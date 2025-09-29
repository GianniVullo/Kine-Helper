import Database from '@tauri-apps/plugin-sql';

export class LocalDatabase {
	async select(query, bindValues) {
		let db = await Database.load('sqlite:kinehelper2.db');
		try {
			console.log('in LocalDatabase with', query, bindValues);
			let result = await db.select(query, bindValues);
			console.log('result is ', result);
			
			await db.close();
			return result;
		} catch (error) {
			if (error === 'attempted to acquire a connection on a closed pool') {
				db = await Database.load('sqlite:kinehelper2.db');
				let result = await db.select(query, bindValues);
				await db.close();
				return result;
			}
			console.error(error);
		}
	}
	
	// for now I just add a placeholder for stability
	async close() {
		return;
	}
	
	async execute(query, bindValues) {
		let db = await Database.load('sqlite:kinehelper2.db');
		try {
			console.log('in LocalDatabase with', query, bindValues);
			let result = await db.execute(query, bindValues);
			await db.close();
			return result;
		} catch (error) {
			if (error === 'attempted to acquire a connection on a closed pool') {
				db = await Database.load('sqlite:kinehelper2.db');
				let result = await db.execute(query, bindValues);
				await db.close();
				return result;
			}
		}
	}

	constructor() {
		this.connection;
	}

	async testingValues() {}
}
