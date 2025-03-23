import { trace, error as errorLog, info } from '@tauri-apps/plugin-log';
import Database from '@tauri-apps/plugin-sql';

/**
 ** Update est une fonction qui aide à la création d'expresion SQL update. Elle vient
 * @param {Object.<string, boolean>} touched
 * @param {Object.<string, any>} data
 */
export function filtrerLesChampsAUpdater(touched, data) {
	for (const field of Object.keys(touched)) {
		const isTouched = touched[field];
		if (!isTouched) {
			delete data[field];
		}
	}
	return data;
}

export class DatabaseManager {
	/**@type Database */
	db;

	constructor(dbPath) {
		if (dbPath) {
			this.db = new Database(dbPath);
		}
	}

	async update(table, filters, formData, key) {
		let updateStmt = Object.keys(formData).reduce((acc, key, idx) => {
			return `${acc}${idx > 0 ? ', ' : ''}${key} = $${idx + 1}`;
		}, '');
		let whereStmt = filters.reduce((acc, [filterName, _], idx) => {
			return `${acc}${idx > 0 ? ' AND ' : ''}${filterName} = $${
				idx + Object.keys(formData).length + 1
			}`;
		}, '');
		let statement = `UPDATE ${table} SET ${updateStmt} WHERE ${whereStmt}`;
		const bindValues = [
			...Object.values(formData),
			...filters.map(([_, filterValue]) => filterValue)
		];
		const { data: stmt, error } = await this.execute(statement, bindValues);
		console.log('updated successfully now closing db', stmt);
		return { stmt, error };
	}

	async updateMultiples(table, ids, formData, idLabel = 'id') {
		let updateStmt = Object.keys(formData).reduce((acc, key, idx) => {
			return `${acc}${idx > 0 ? ', ' : ''}${key} = $${idx + 1}`;
		}, '');
		let whereStmt = `${idLabel} IN (${ids.map((_, idx) => `$${idx + Object.keys(formData).length + 1}`).join(', ')})`;
		let statement = `UPDATE ${table} SET ${updateStmt} WHERE ${whereStmt}`;
		const bindValues = [...Object.values(formData), ...ids];
		const { data: stmt, error } = await this.execute(statement, bindValues);
		console.log('updated successfully now closing db', stmt);
		return { stmt, error };
	}

	async delete(table, filters) {
		let whereClauses = [];
		let filterValues = [];
		for (const filter of filters) {
			whereClauses.push(`${filter[0]} = $${filters.indexOf(filter) + 1}`);
			filterValues.push(filter[1]);
		}
		const stt = `DELETE FROM ${table} WHERE ${whereClauses.join(', ')}`;
		console.log(stt);

		const { data: stmt, error } = await this.execute(stt, filterValues);
		return { data: stmt, error };
	}

	async retrieve_sp(sp_id) {
		trace('Entering AppState.db.retrieve_sp');
		let { data: latestPs, error } = await this.select(
			'SELECT * FROM situations_pathologiques WHERE sp_id = $1',
			[sp_id]
		);
		if (error) {
			return { data: null, error };
		}
		if (latestPs.length === 0) {
			trace('No sp found');
			// No record found
			return { data: null, error };
		}

		// Fetch related data for each table
		trace('Fetching Séances');
		let { data: seances, error: seancesError } = await this.select(
			`SELECT * FROM seances WHERE sp_id = $1 ORDER BY date ASC`,
			[sp_id]
		);

		if (seancesError) {
			return { data: null, error: seancesError };
		}
		seances.map((seance) => {
			seance.metadata = JSON.parse(seance.metadata);
			typeof seance.indemnite === 'string' && (seance.indemnite = JSON.parse(seance.indemnite));
			typeof seance.rapport_ecrit === 'string' &&
				(seance.rapport_ecrit = JSON.parse(seance.rapport_ecrit));
			typeof seance.ticket_moderateur === 'string' &&
				(seance.ticket_moderateur = JSON.parse(seance.ticket_moderateur));
		});
		trace('Fetching Prescriptions');
		let { data: prescriptions, error: prescriptionsError } = await this.select(
			`SELECT * FROM prescriptions WHERE sp_id = $1 ORDER BY created_at ASC`,
			[sp_id]
		);
		if (prescriptionsError) {
			return { data: null, error: prescriptionsError };
		}

		trace('Fetching Attestations');
		let { data: attestations, error: attestationsError } = await this.select(
			`SELECT * FROM attestations WHERE sp_id = $1 ORDER BY created_at ASC`,
			[sp_id]
		);
		if (attestationsError) {
			return { data: null, error: attestationsError };
		}
		attestations.map((attestation) => {
			typeof attestation.mutuelle_paid == 'string' &&
				(attestation.mutuelle_paid = JSON.parse(attestation.mutuelle_paid));
			typeof attestation.patient_paid == 'string' &&
				(attestation.patient_paid = JSON.parse(attestation.patient_paid));
		});

		// trace("Fetching ")
		// let generateurs = await this.db.select(
		// 	`SELECT * FROM generateurs_de_seances WHERE sp_id = $1`,
		// 	[sp_id]
		// );

		trace('Fetching Accords');
		let { data: accords, error: accordsError } = await this.select(
			`SELECT * FROM accords WHERE sp_id = $1 ORDER BY date ASC`,
			[sp_id]
		);
		console.log('accords', accords);
		if (accordsError) {
			return { data: null, error: accordsError };
		}
		accords.map((accord) => {
			accord.situation = parseInt(accord.situation);
			typeof accord.metadata === 'string' && (accord.metadata = JSON.parse(accord.metadata));
		});

		trace('Fetching Factures');
		let { data: factures, error: documentsError } = await this.select(
			`SELECT * FROM factures WHERE sp_id = $1 ORDER BY date ASC`,
			[sp_id]
		);
		if (documentsError) {
			return { data: null, error: documentsError };
		}

		info('Fetched all elements of the SP');
		return {
			data: {
				...latestPs[0],
				seances,
				prescriptions,
				attestations,
				// generateurs_de_seances: generateurs, deprecated
				accords,
				factures
			},
			error: null
		};
	}

	async list(
		table,
		filters,
		{ selectStatement, limit, orderBy, ascending = true } = { selectStatement: '*' }
	) {
		trace('In DatabaseManager.list');
		let liteQuery = `SELECT ${selectStatement} FROM ${table}`;

		// Adding filters
		if (filters && filters.length > 0) {
			const filterClauses = filters.map(([filterName, filterValue], idx) => {
				return filterName.startsWith('!')
					? `${filterName.substring(1)} != $${idx + 1}`
					: `${filterName} = $${idx + 1}`;
			});
			liteQuery += ` WHERE ${filterClauses.join(' AND ')}`;
		}

		// Adding ordering
		if (orderBy) {
			liteQuery += ` ORDER BY ${orderBy} ${ascending ? 'ASC' : 'DESC'}`;
		}

		// Adding limit
		if (limit) {
			liteQuery += ` LIMIT ${limit}`;
		}
		console.log(
			'in DBManager.list() Before query',
			liteQuery,
			'with args',
			filters?.map(([_, filterValue]) => filterValue)
		);
		// Prepare and execute the query
		const { data, error } = await this.select(
			liteQuery,
			filters?.map(([_, filterValue]) => filterValue)
		);
		console.log('in DBManager.list() After query', data);
		return { data, error };
	}

	//! Attention il faut modifier pour utiliser this.execute
	async update_seances(seances_array, key) {
		console.log('in DBManager.update_seances() with', seances_array);

		for (const seance of seances_array) {
			// Construct the update query for each seance
			const { seance_id, date, has_been_attested, attestation_id, code_id } = seance;
			await this.db.execute(
				`UPDATE seances SET 
									  date = $1, 
									  has_been_attested = $2, 
									  attestation_id = $3, 
									  code_id = $4 
									  WHERE seance_id = $5`,
				[date, has_been_attested, attestation_id, code_id, seance_id]
			);
		}
	}

	async initializing() {
		this.db = await Database.load('sqlite:kinehelper.db');
	}

	async select(query, bindValues) {
		let data;
		let errorThrown;

		try {
			trace('In DatabaseManager.select with ' + query);
			data = await this.db.select(query, bindValues);
		} catch (error) {
			errorLog(`In the DatabaseManager.select with error : ${error}`);
			if (error === 'attempted to acquire a connection on a closed pool') {
				try {
					await this.initializing();
					data = await this.db.select(query, bindValues);
				} catch (error) {
					errorThrown = error;
				}
			} else {
				errorThrown = error;
			}
		}
		return { data, error: errorThrown };
	}

	async insert(table, formData) {
		let columns;
		let placeholders;
		let values = [];
		if (Array.isArray(formData)) {
			console.log('Preparing save statement with : ', formData);
			let placeholderIdx = 1;
			columns = Object.keys(formData[0]).join(', ');
			placeholders = [];
			for (const item of formData) {
				placeholders.push(
					Object.keys(item).map((val, idx) => {
						let holder = `$${placeholderIdx}`;
						placeholderIdx++;
						return holder;
					})
				);
				values = [...values, ...Object.values(item)];
			}
			placeholders = placeholders.map((val) => `(${val.join(', ')})`).join(', ');
			console.log('Prepared save statement with : ', columns, placeholders, values);
		} else {
			console.log('Preparing save statement with : ', formData);
			columns = Object.keys(formData).join(', ');
			placeholders = Object.keys(formData)
				.map((val, idx) => `$${idx + 1}`)
				.join(', ');
			placeholders = `(${placeholders})`;
			values = Object.values(formData);
			console.log('Prepared save statement with : ', columns, placeholders, values);
		}
		// Prepare and run the INSERT statement
		let { data, error } = await this.select(
			`INSERT INTO ${table} (${columns}) VALUES ${placeholders} RETURNING *`,
			values
		);
		return { data, error };
	}

	// for now I just add a placeholder for stability
	async close() {
		return;
	}

	async execute(query, bindValues) {
		let data;
		let errorThrown;
		try {
			trace('In DatabaseManager.execute with ' + query);

			data = await this.db.execute(query, bindValues);
			console.log('In DatabaseManager.execute with data : ', data);
			// await this.db.close();
		} catch (error) {
			errorLog(`In the DatabaseManager.execute with error : ${error}`);
			if (error === 'attempted to acquire a connection on a closed pool') {
				await this.initializing();
				try {
					data = await this.db.execute(query, bindValues);
				} catch (error) {
					errorLog(`In the DatabaseManager.execute with error : ${error}`);
					errorThrown = error;
				}
			} else {
				errorThrown = error;
			}
		}
		return { data, error: errorThrown };
	}
}

export const db = new DatabaseManager();
