import { get } from 'svelte/store';
import { user } from '../../stores/UserStore';
import { supabase } from '../../stores/supabaseClient';
import { DBInitializer } from '../../stores/databaseInitializer';

export class DBAdapter {
	constructor() {
		//? Le type de l'adapter est soit true (Remote (Supabase) soit false (Local (SQLite)).
		this.offre = get(user).profil.offre;
		//? Le dossier racine de l'application où devrait se trouver le stockage de tous les fichiers binaires.
		this.baseAppDirectory;
		//? Dossier par défault où l'utilisateur souhaite sauvergarder ses fichiers
		this.defaultSaveDirectory;
	}

	//? Fonction retournant une Promesse enveloppant la fonction asynchrone permettant l'enregistrement de données
	//* Supabase et SQLite fonctionnant tout deux avec SQL les fonctions peuvent être généralisées
	// Devrais-je ajouter un flag permettant ou non de retourner les données enregistrées ? Pour le moment la réponse est NON
	async save(table, formData) {
		switch (this.offre) {
			case 'free':
				let columns;
				let placeholders;
				let values = [];
				if (Array.isArray(formData)) {
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
				} else {
					columns = Object.keys(formData).join(', ');
					placeholders = Object.keys(formData)
						.map((val, idx) => `$${idx + 1}`)
						.join(', ');
					placeholders = `(${placeholders})`;
					values = Object.values(formData);
				}
				let db = await new DBInitializer().openDBConnection();
				// Prepare and run the INSERT statement
				let query = db.select(
					`INSERT INTO ${table} (${columns}) VALUES ${placeholders} RETURNING *`,
					values
				);
				await db.close();
				return query;
			case 'cloud':
				return await supabase.from(table).insert(formData).select();
			default:
				console.log(`in DBAdapter.save(${table}, ${formData})`);
				return;
		}
	}

	async saveFile(fileName, fileData) {
		switch (this.offre) {
			case 'free':
				break;
			case 'cloud':
				return await supabase.storage.from('users').upload(fileName, fileData);
			default:
				console.log(`in DBAdapter.saveFile(${fileData})`);
				return;
		}
	}

	async update(table, id, formData) {}

	async delete(table, id) {}

	async retrieve(table, selectStatement, [filterName, filterValue]) {
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();

				const stmt = await db.select(
					`SELECT ${selectStatement} FROM ${table} WHERE ${filterName} = $1`,
					[filterValue]
				);
				await db.close();
				return stmt;
			case 'cloud':
				return await supabase.from(table).select(selectStatement).eq(filterName, filterValue);
			default:
				console.log(`in DBAdapter.save(${table}, ${id})`);
				return;
		}
	}

	async list(table, filters, { selectStatement, limit, orderBy, ascending = true }) {
		console.log('in DBAdapter.list() with', table, selectStatement, orderBy, ascending);
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
				let liteQuery = `SELECT ${selectStatement} FROM ${table}`;

				// Adding filters
				if (filters && filters.length > 0) {
					const filterClauses = filters.map(([filterName, filterValue], idx) => {
						return filterName.startsWith('!')
							? `${filterName.substring(1)} != $${idx + 1}}`
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

				// Prepare and execute the query
				const stmt = await db.select(
					liteQuery,
					filters.map(([_, filterValue]) => filterValue)
				);
				await db.close();
				return stmt;
			case 'cloud':
				let query = supabase.from(table).select(selectStatement);
				if (orderBy) {
					query.order(orderBy, { ascending: ascending });
				}
				if (limit) {
					query.limit(limit);
				}
				if (filters.length > 0) {
					for (const [filterName, filterValue] of filters) {
						if (filterName.startsWith('!')) {
							query.neq(filterName.substring(1), filterValue);
						} else {
							query.eq(filterName, filterValue);
						}
					}
				}
				return await query;
			default:
				console.log(`in DBAdapter.save(${table}, ${selectStatement})`);
				return;
		}
	}

	async get_last_sp(patient_id, user_id) {
		console.log('in DBAdapter.get_last_sp() with', patient_id, user_id);
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
				let latestPs = await db.select(
					`SELECT * FROM situation_pathologiques WHERE patient_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1`,
					[patient_id, user_id]
				);

				if (latestPs.length === 0) {
					// No record found
					return null;
				}

				let sp_id = latestPs[0].sp_id;

				// Fetch related data for each table
				let seances = await db.select(`SELECT * FROM seances WHERE sp_id = $1`, [sp_id]);
				let prescriptions = await db.select(`SELECT * FROM prescriptions WHERE sp_id = $1`, [
					sp_id
				]);
				let attestations = await db.select(`SELECT * FROM attestations WHERE sp_id = $1`, [sp_id]);
				let generateurs = await db.select(`SELECT * FROM generateurs_de_seances WHERE sp_id = $1`, [
					sp_id
				]);
				let documents = await db.select(`SELECT * FROM documents WHERE sp_id = $1`, [sp_id]);

				// Aggregate the data in JavaScript
				let result = {
					ps: latestPs[0],
					seances: seances,
					prescriptions: prescriptions,
					attestations: attestations,
					generateurs_de_seances: generateurs,
					documents: documents
				};
				await db.close();
				return result;
			case 'cloud':
				return await supabase.rpc('get_last_sp', {
					user_id_param: user_id,
					patient_id_param: patient_id
				});
			default:
				console.log(`in DBAdapter.get_last_sp(${patient_id}, ${user_id})`);
				return;
		}
	}

	async update_seances(seances_array) {
		console.log('in DBAdapter.update_seances() with', seances_array);
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();

				for (const seance of seances_array) {
					// Construct the update query for each seance
					const { seance_id, date, has_been_attested, attestation_id, code_id } = seance;
					await db.execute(
						`UPDATE seances SET 
									  date = ?, 
									  has_been_attested = ?, 
									  attestation_id = ?, 
									  code_id = ? 
									  WHERE seance_id = ?`,
						[date, has_been_attested, attestation_id, code_id, seance_id]
					);
				}
				await db.close();
				break;
			case 'cloud':
				console.log('in DBAdapter.update_seances() with', seances_array);
				return await supabase.rpc('update_seances', {
					_updates: seances_array
				});
			default:
				console.log(`in DBAdapter.update_seances(${seances_array})`);
				return;
		}
		await $1.rpc('get_last_sp', {
			user_id_param: 'b0f022dc-6688-430c-8da7-3763c469fb9f',
			patient_id_param: '2f72126f-90e5-44bd-9d5e-bd372c8fd29a'
		});
	}

	async customSQL(statement, args) {}
}
