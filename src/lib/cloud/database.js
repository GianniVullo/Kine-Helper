import { trace, error as errorLog, info } from '@tauri-apps/plugin-log';
import Database from '@tauri-apps/plugin-sql';
import { supabase } from '../stores/supabaseClient';
import { Patient, SituationPathologique } from '../user-ops-handlers/models';
import { terminal } from 'virtual:terminal';

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
	offre;

	constructor(dbPath, offre = 'local') {
		this.offre = offre;
		if (dbPath) {
			this.db = new Database(dbPath);
		}
	}

	async setItem(key, value) {
		return await this.execute(
			`INSERT OR REPLACE 
				INTO key_value (key, value) 
				VALUES ($1, $2);`,
			[key, value]
		);
	}

	async getItem(key) {
		const { data, error } = await this.select(`SELECT value FROM key_value WHERE key = $1`, [key]);
		if (error || !data?.[0]?.value) {
			return null;
		}
		return data[0].value;
	}

	async deleteItem(key) {
		return await this.execute(`DELETE FROM key_value WHERE key = $1`, [key]);
	}

	async getRawPrinter() {
		const { data: rawprinterList, error } = await this.select(
			"SELECT * FROM appareils WHERE role = 'raw_printer'",
			[]
		);
		if (error) {
			return { data: null, error };
		}
		if (rawprinterList.length === 0) {
			return { data: null, error: null };
		}
		rawprinterList[0].metadata = JSON.parse(rawprinterList[0].metadata);
		return { data: rawprinterList[0], error: null };
	}

	async update(table, filters, formData) {
		// first try to update in Supabase
		let query = supabase.from(table).update(formData);
		for (const filter of filters ?? []) {
			terminal.log('Adding filter:', filter);
			query.eq(filter[0], filter[1]);
		}

		let supabaseResponse = await query;
		if (supabaseResponse.error) {
			errorLog(`Error updating in ${table}: ${supabaseResponse.error.message}`);
			return { data: null, error: supabaseResponse.error };
		}
		// If successful, update the local database (used as a cache)
		let localResponse = await this.updateLocal(table, filters, formData);
		if (localResponse.error) {
			errorLog(`Error updating local database ${table}: ${localResponse.error.message}`);
			return { data: null, error: localResponse.error };
		}
		return { data: supabaseResponse.data, error: null };
	}

	async updateLocal(table, filters, formData) {
		terminal.log('In DatabaseManager.updateLocal with', table, filters, formData);
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
		terminal.log('Statement to execute:', statement, 'with bind values:', bindValues);
		const { data: stmt, error } = await this.execute(statement, bindValues);
		terminal.log('updated successfully now closing db', stmt);
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
		terminal.log('updated successfully now closing db', stmt);
		return { stmt, error };
	}

	async delete(table, filters) {
		// first try to delete in Supabase
		let query = supabase.from(table).delete();
		for (const filter of filters ?? []) {
			query.eq(filter[0], filter[1]);
		}

		let supabaseResponse = await query;
		if (supabaseResponse.error) {
			errorLog(`Error deleting from ${table}: ${supabaseResponse.error.message}`);
			return { data: null, error: supabaseResponse.error };
		}
		// If successful, delete from the local database (used as a cache)
		let localResponse = await this.deleteLocal(table, filters);
		if (localResponse.error) {
			errorLog(`Error deleting from local database ${table}: ${localResponse.error.message}`);
			return { data: null, error: localResponse.error };
		}
		return { data: supabaseResponse.data, error: null };
	}

	async deleteLocal(table, filters) {
		let whereClauses = [];
		let filterValues = [];
		for (const filter of filters) {
			whereClauses.push(`${filter[0]} = $${filters.indexOf(filter) + 1}`);
			filterValues.push(filter[1]);
		}
		const stt = `DELETE FROM ${table} WHERE ${whereClauses.join(', ')}`;
		terminal.log(stt);

		const { data: stmt, error } = await this.execute(stt, filterValues);
		return { data: stmt, error };
	}

	async retrievePatient(patient_id) {
		console.log('Entering AppState.db.retrievePatient');
		let { data, error } = await this.select('SELECT * FROM patients WHERE patient_id = $1', [
			patient_id
		]);
		if (error) {
			return { data: null, error };
		}
		if (data.length === 1) {
			console.log('Patient found:', data[0]);
			let patient = new Patient(data[0]);
			trace('Engaging SP summary fetch');
			let { data: spResult, error: spError } = await this.select(
				`SELECT * FROM situations_pathologiques WHERE patient_id = $1`,
				[patient_id]
			);
			trace('SP summary fetch completed');
			if (spError) {
				return { data: patient, error: spError };
			}
			if (spResult.length === 0) {
				console.log('No SP found locally, trying Supabase');
				trace(
					'No situations pathologiques found for this patient, attempting to fetch from Supabase'
				);
				let { data: spData, error: spError } = await supabase
					.from('situations_pathologiques')
					.select('*')
					.eq('patient_id', patient_id);
				if (spError) {
					console.error('Error fetching situations pathologiques from Supabase:', spError);
					return { data: patient, error: spError };
				}
				console.log('\n\nSPDATA\n\n',spData);
				spResult = spData;
				if (spResult.length === 0) {
					trace('No situations pathologiques found for this patient in Supabase either');
					spResult = [];
				} else {
					trace('Found situations pathologiques in Supabase, inserting into local database');
					// Set the data in the DB cache
					let { error: splocalinsertionError } = await this.insertLocal(
						'situations_pathologiques',
						spResult
					);
					if (splocalinsertionError) {
						errorLog(
							`Error inserting situations_pathologiques into local database: ${splocalinsertionError.message}`
						);
						return { data: patient, error: splocalinsertionError };
					}
				}
			}
			patient.situations_pathologiques = spResult.map((sp) => new SituationPathologique(sp));
			return { data: patient, error: null };
		} else {
			return { data: null, error: new Error('Patient not found') };
		}
	}

	async retrieve_sp({ sp_id }) {
		// first try to retrieve from local database
		let { data: completeSp, error: localResponseError } = await this.retrieve_spLocal(sp_id);

		terminal.log('Retrieved SP from local database:', completeSp);

		let sp = new SituationPathologique(completeSp);

		// Here we take the prescriptions as the ground reference for the SP being up to date. reason : If we can retrieve at least one prescription, it means the SP has been used recently and is up to date.
		if (sp.prescriptions.length > 0) {
			sp.upToDate = true;
			return { data: sp, error: null };
		}

		// If local retrieval fails or no prescriptions found, try Supabase
		let supabaseResponse = await supabase
			.from('situations_pathologiques')
			.select(
				`*,
					seances (*),
					accords (*),
					factures (*),
					prescriptions (*),
					attestations (*)`
			)
			.eq('sp_id', sp_id)
			.single();
		terminal.log('Supabase response:', supabaseResponse);
		if (supabaseResponse.error) {
			errorLog(`Error retrieving from Supabase: ${supabaseResponse.error.message}`);
			return { data: null, error: supabaseResponse.error };
		}
		sp = new SituationPathologique(supabaseResponse.data);
		// If successful, record the data in the local database
		let { error: localError } = await this.insertLocal('situations_pathologiques', [sp.toDB]);
		if (localError) {
			errorLog(`Error inserting into local database: ${localError.message}`);
		}
		if (sp.prescriptions.length > 0) {
			let { error: prescriptionsError } = await this.insertLocal('prescriptions', sp.prescriptions);
			if (prescriptionsError) {
				errorLog(`Error inserting into local database: ${prescriptionsError.message}`);
			}
		}
		if (sp.accords.length > 0) {
			let { error: accordsError } = await this.insertLocal('accords', sp.accords);
			if (accordsError) {
				errorLog(`Error inserting into local database: ${accordsError.message}`);
			}
		}
		if (sp.attestations.length > 0) {
			let { error: attestationsError } = await this.insertLocal('attestations', sp.attestations);
			if (attestationsError) {
				errorLog(`Error inserting into local database: ${attestationsError.message}`);
			}
		}
		if (sp.factures.length > 0) {
			let { error: facturesError } = await this.insertLocal('factures', sp.factures);
			if (facturesError) {
				errorLog(`Error inserting into local database: ${facturesError.message}`);
			}
		}
		if (sp.seances.length > 0) {
			let { error: seancesError } = await this.insertLocal('seances', sp.seances);
			if (seancesError) {
				errorLog(`Error inserting into local database: ${seancesError.message}`);
			}
		}
		sp.upToDate = true;
		return { data: sp, error: null };
	}

	async retrieve_spLocal(sp_id) {
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
			typeof seance.metadata === 'string' && (seance.metadata = JSON.parse(seance.metadata));
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
		terminal.log('accords', accords);
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
		terminal.log(
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
		terminal.log('in DBManager.list() After query', data);
		return { data, error };
	}

	//! Attention il faut modifier pour utiliser this.execute
	async update_seances(seances_array, key) {
		terminal.log('in DBManager.update_seances() with', seances_array);

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

	async selectRemote(query, bindValues, { table, statement, filters } = {}) {
		terminal.log('In DatabaseManager.select with', query, bindValues, table, statement, filters);
		let localResponse = { data: [], error: null };
		// first try to select from Local database
		if (query) {
			localResponse = await this.select(query, bindValues);
		}
		terminal.log('Local response:', localResponse);
		if (localResponse.error || localResponse.data.length === 0) {
			let supabaseResponse = await supabase
				.from(table)
				.select(statement)
				.match(filters ?? {});
			terminal.log('Supabase response:', supabaseResponse);
			if (supabaseResponse.error) {
				errorLog(`Error selecting from Supabase: ${supabaseResponse.error.message}`);
				return { data: null, error: supabaseResponse.error };
			}
			// If successful, return the data
			if (supabaseResponse.data.length === 0) {
				return { data: [], error: null };
			}
			// Update the local database with the fetched data
			let insertResponse = await this.insertLocal(table, supabaseResponse.data);
			if (insertResponse.error) {
				errorLog(`Error inserting into local database ${table}: ${insertResponse.error}`);
				terminal.error(`Error inserting into local database ${table}: ${insertResponse.error}`);
				return { data: null, error: insertResponse.error };
			}
			terminal.log('Inserted into local database successfully');
			// Return the data fetched from Supabase
			terminal.log('Fetched from Supabase successfully');
			terminal.log('Supabase data: ', supabaseResponse.data);
			return { data: supabaseResponse.data, error: null };
		}
		// If successful, return the data
		return { data: localResponse.data, error: null };
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
		// first try to insert into Supabase
		// TODO. I am reconsidering working with an async Task queue. The main problem is the lack of a postgrest client for Rust. There is the postrest crate but it is not maintained and I am scared that I might be locked into a dead end.

		// TODO. Having such a feature would be amazing as I could send data to Supabase in the background then set the Synched Column of the patients's row in the local db to true. This would happen seamlessly for the user raising the percepted performances to a new level.
		terminal.log('In DatabaseManager.insert with', table, formData);
		let supabaseResponse = await supabase.from(table).insert(formData);
		if (supabaseResponse.error) {
			errorLog(`Error inserting into ${table}: ${supabaseResponse.error.message}`);
			return { data: null, error: supabaseResponse.error };
		}
		// If successful, update the local database (used as a cache)
		let localResponse = this.insertLocal(table, formData);
		if (localResponse.error) {
			errorLog(`Error inserting into local database ${table}: ${localResponse.error.message}`);
			return { data: null, error: localResponse.error };
		}
		return { data: supabaseResponse.data, error: null };
		// 	}
	}
	async insertLocal(table, formData) {
		let columns;
		let placeholders;
		let values = [];
		if (Array.isArray(formData)) {
			terminal.log('Preparing save statement with : ');
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
			terminal.log('Prepared save statement with : ', columns, placeholders);
		} else {
			terminal.log('Preparing save statement with : ');
			columns = Object.keys(formData).join(', ');
			placeholders = Object.keys(formData)
				.map((val, idx) => `$${idx + 1}`)
				.join(', ');
			placeholders = `(${placeholders})`;
			values = Object.values(formData);
			terminal.log('Prepared save statement with : ', columns, placeholders, values);
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
			terminal.log('In DatabaseManager.execute with data : ');
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

export function safeBooleanJsonParse(jsonString) {
	if (typeof jsonString === 'string') {
		try {
			return JSON.parse(jsonString);
		} catch (e) {
			console.error('Error parsing JSON string:', e);
			return null;
		}
	} else if (typeof jsonString === 'number') {
		// If it's a number, return it as is
		return jsonString ? true : false;
	}
	return null;
}
