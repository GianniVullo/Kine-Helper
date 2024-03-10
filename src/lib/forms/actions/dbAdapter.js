import { get } from 'svelte/store';
import { user } from '../../stores/UserStore';
import { supabase } from '../../stores/supabaseClient';
import { DBInitializer } from '../../stores/databaseInitializer';

export default class DBAdapter {
	constructor() {
		//? Le type de l'adapter est soit true (Remote (Supabase) soit false (Local (SQLite)).
		this.offre = get(user)?.profil?.offre ?? 'free';
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
				let db = await new DBInitializer().openDBConnection();
				// Prepare and run the INSERT statement
				let query = await db.select(
					`INSERT INTO ${table} (${columns}) VALUES ${placeholders} RETURNING *`,
					values
				);
				console.log('Inserted successfully now closing db');
				await db.close();
				return { data: query };
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

	async update(table, filters, formData) {
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
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
				const stmt = await db.execute(statement, [
					...Object.values(formData),
					...filters.map(([_, filterValue]) => filterValue)
				]);
				console.log('updated successfully now closing db');
				await db.close();
				return stmt;

			default:
				break;
		}
	}

	async delete(table, [filterName, filterValue]) {
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
				const stmt = await db.execute(`DELETE FROM ${table} WHERE ${filterName} = $1`, [
					filterValue
				]);
				await db.close();
				return stmt;
			case 'cloud':
				return await supabase.from(table).delete().eq('id', id);
			default:
				console.log(`in DBAdapter.save(${table}, ${id})`);
				return;
		}
	}

	async retrieve(table, selectStatement, [filterName, filterValue]) {
		switch (this.offre) {
			case 'free':
				console.log('in DBAdapter.retrieve() with', table, selectStatement, filterName, filterValue);
				let db = await new DBInitializer().openDBConnection();

				const stmt = await db.select(
					`SELECT ${selectStatement} FROM ${table} WHERE ${filterName} = $1`,
					[filterValue]
				);
				await db.close();
				return { data: stmt };
			case 'cloud':
				return await supabase.from(table).select(selectStatement).eq(filterName, filterValue);
			default:
				console.log(`in DBAdapter.save(${table}, ${id})`);
				return;
		}
	}
	async retrieve_sp(sp_id) {
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
				console.log('in DBAdapter.retrieve_sp() with', sp_id);
				let latestPs = await db.select('SELECT * FROM situations_pathologiques WHERE sp_id = $1', [
					sp_id
				]);
				console.log('in DBAdapter.retrieve_sp() with', latestPs);
				if (latestPs.length === 0) {
					// No record found
					return { error: 'No record found' };
				}

				// Fetch related data for each table
				let seances = await db.select(`SELECT * FROM seances WHERE sp_id = $1`, [sp_id]);
				console.log('in DBAdapter.retrieve_sp() with', seances);
				let prescriptions = await db.select(`SELECT * FROM prescriptions WHERE sp_id = $1`, [
					sp_id
				]);
				console.log('in DBAdapter.retrieve_sp() with', prescriptions);
				let attestations = await db.select(`SELECT * FROM attestations WHERE sp_id = $1`, [sp_id]);
				console.log('in DBAdapter.retrieve_sp() with', attestations);
				let generateurs = await db.select(`SELECT * FROM generateurs_de_seances WHERE sp_id = $1`, [
					sp_id
				]);
				console.log('in DBAdapter.retrieve_sp() with', generateurs);
				let documents = await db.select(`SELECT * FROM documents WHERE sp_id = $1`, [sp_id]);
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
				await db.close();
				return result;
			case 'cloud':
				let selectStatement =
					'sp_id, created_at, numero_etablissement, service, motif, plan_du_ttt, seances (seance_id,code_id,date,description,has_been_attested,attestation_id,prescription_id,is_paid,gen_id), prescriptions ( prescription_id, date, jointe_a, prescripteur, nombre_seance, seance_par_semaine), attestations (attestation_id, porte_prescr, numero_etablissement, service, has_been_printed, prescription_id, total_recu, valeur_totale, with_indemnity, with_intake, with_rapport, date), generateurs_de_seances (gen_id, created_at, auto, groupe_id, lieu_id, duree, intake, examen_consultatif, rapport_ecrit, rapport_ecrit_custom_date, volet_j, seconde_seance_fa, duree_seconde_seance_fa, nombre_code_courant_fa, volet_h, patho_lourde_type, gmfcs, seconde_seance_e, premiere_seance, jour_seance_semaine_heures, deja_faites, default_seance_description, nombre_seances, seances_range, date_presta_chir_fa, examen_ecrit_date, amb_hos, rapport_ecrit_date), documents (document_id, created_at, form_data)';
				return await supabase
					.from('situations_pathologiques')
					.select(selectStatement)
					.eq('sp_id', sp_id);
			default:
				console.log(`in DBAdapter.save(${table}, ${id})`);
				return;
		}
	}

	async list(
		table,
		filters,
		{ selectStatement, limit, orderBy, ascending = true } = { selectStatement: '*' }
	) {
		console.log('in DBAdapter.list() with', table, selectStatement, orderBy, ascending);
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
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
				const stmt = await db.select(
					liteQuery,
					filters?.map(([_, filterValue]) => filterValue)
				);
				console.log('in DBAdapter.list() After query', stmt);
				await db.close();
				return { data: stmt };
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
					`SELECT * FROM situations_pathologiques WHERE patient_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 1`,
					[patient_id, user_id]
				);

				if (latestPs.length === 0) {
					// No record found
					return { data: { ps: [] } };
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
					data: {
						ps: latestPs,
						seances: seances,
						prescriptions: prescriptions,
						attestations: attestations,
						generateurs_de_seances: generateurs,
						documents: documents
					}
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
									  date = $1, 
									  has_been_attested = $2, 
									  attestation_id = $3, 
									  code_id = $4 
									  WHERE seance_id = $5`,
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
	}

	async delete_all_patient() {
		switch (this.offre) {
			case 'free':
				let db = await new DBInitializer().openDBConnection();
				await db.execute('DELETE FROM patients WHERE kinesitherapeute_id = $1', [
					get(user).user.id
				]);
				await db.close();
				break;
			case 'cloud':
				return await supabase.rpc('delete_all_patient');
			default:
				console.log(`in DBAdapter.delete_all_patient()`);
				return;
		}
	}

	async customSQL(statement, args) {}
}
