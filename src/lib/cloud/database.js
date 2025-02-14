import { trace, error as errorLog } from '@tauri-apps/plugin-log';
import Database from '@tauri-apps/plugin-sql';

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
		console.log('in DBAdapter.update() with', updateStmt, whereStmt);
		const stmt = await this.db.execute(statement, [
			...Object.values(formData),
			...filters.map(([_, filterValue]) => filterValue)
		]);
		console.log('updated successfully now closing db', stmt);
		return stmt;
	}

	async delete(table, filters) {
		let whereClauses = [];
		let filterValues = [];
		for (const filter of filters) {
			whereClauses.push(`${filter[0]} = $${filters.indexOf(filter) + 1}`);
			filterValues.push(filter[1]);
		}
		const stmt = await this.db.execute(
			`DELETE FROM ${table} WHERE ${whereClauses.join(', ')}`,
			filterValues
		);
		return stmt;
	}

	async retrieve_sp(sp_id) {
		console.log('in DBAdapter.retrieve_sp() with', sp_id);
		let latestPs = await this.db.select('SELECT * FROM situations_pathologiques WHERE sp_id = $1', [
			sp_id
		]);
		console.log('in DBAdapter.retrieve_sp() with', latestPs);
		if (latestPs.length === 0) {
			// No record found
			return;
		}

		// Fetch related data for each table
		let seances = await this.db.select(`SELECT * FROM seances WHERE sp_id = $1 ORDER BY date ASC`, [
			sp_id
		]);
		console.log('in DBAdapter.retrieve_sp() with', seances);
		let prescriptions = await this.db.select(
			`SELECT * FROM prescriptions WHERE sp_id = $1 ORDER BY created_at ASC`,
			[sp_id]
		);
		console.log('in DBAdapter.retrieve_sp() with', prescriptions);
		let attestations = await this.db.select(
			`SELECT * FROM attestations WHERE sp_id = $1 ORDER BY created_at ASC`,
			[sp_id]
		);
		console.log('in DBAdapter.retrieve_sp() with', attestations);
		let generateurs = await this.db.select(
			`SELECT * FROM generateurs_de_seances WHERE sp_id = $1`,
			[sp_id]
		);
		console.log('in DBAdapter.retrieve_sp() with', generateurs);
		let documents = await this.db.select(
			`SELECT * FROM documents WHERE sp_id = $1 ORDER BY created_at ASC`,
			[sp_id]
		);
		console.log('in DBAdapter.retrieve_sp() with', documents);
		// Aggregate the data in JavaScript
		let result = {
			data: {
				...latestPs[0],
				seances: seances,
				prescriptions: prescriptions,
				attestations: attestations,
				generateurs_de_seances: generateurs,
				documents: documents
			}
		};
		console.log('in DBAdapter.retrieve_sp() with', result);
		return result;
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
			'in DBAdapter.list() Before query',
			liteQuery,
			'with args',
			filters?.map(([_, filterValue]) => filterValue)
		);
		// Prepare and execute the query
		const stmt = await this.select(
			liteQuery,
			filters?.map(([_, filterValue]) => filterValue)
		);
		console.log('in DBAdapter.list() After query', stmt);
		return { data: stmt };
	}

	async update_seances(seances_array, key) {
		console.log('in DBAdapter.update_seances() with', seances_array);

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
		try {
			trace('In DatabaseManager.select with ' + query);
			let result = await this.db.select(query, bindValues);
			console.log('result is ', result);
			return result;
		} catch (error) {
			errorLog(`In the DatabaseManager.select with error : ${error}`);
			if (error === 'attempted to acquire a connection on a closed pool') {
				await this.initializing();
				let result = await this.db.select(query, bindValues);
				return result;
			}
			// TODO : handle error properly
		}
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
		let query = await this.db.select(
			`INSERT INTO ${table} (${columns}) VALUES ${placeholders} RETURNING *`,
			values
		);
		console.log('Inserted successfully now closing db', query);
		return { data: query };
	}

	// for now I just add a placeholder for stability
	async close() {
		return;
	}

	async execute(query, bindValues) {
		try {
			console.log('in LocalDatabase with', query, bindValues);
			let result = await this.db.execute(query, bindValues);
			await this.db.close();
			return result;
		} catch (error) {
			if (error === 'attempted to acquire a connection on a closed pool') {
				await this.initializing();
				let result = await this.db.execute(query, bindValues);
				return result;
			}
		}
	}
}

export const db = new DatabaseManager();
