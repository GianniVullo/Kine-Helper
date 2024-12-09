import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import { supabase } from '../stores/supabaseClient';
import { LocalDatabase } from '../stores/databaseInitializer';
import { decryptTable, encryptTable } from '../stores/encryption';
import { invoke } from '@tauri-apps/api/core';

export default class DBAdapter {
	constructor() {
		//? Le type de l'adapter est soit true (Remote (Supabase) soit false (Local (SQLite)).
		this.offre = get(user)?.profil?.offre;
		//? Le dossier racine de l'application où devrait se trouver le stockage de tous les fichiers binaires.
		this.baseAppDirectory;
		//? Dossier par défault où l'utilisateur souhaite sauvergarder ses fichiers
		this.defaultSaveDirectory;
	}

	//? Fonction retournant une Promesse enveloppant la fonction asynchrone permettant l'enregistrement de données
	//* Supabase et SQLite fonctionnant tout deux avec SQL les fonctions peuvent être généralisées
	// Devrais-je ajouter un flag permettant ou non de retourner les données enregistrées ? Pour le moment la réponse est NON
	async save(table, formData, key) {
		switch (this.offre) {
			case 'free':
				let db = new LocalDatabase();
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
				let query = await db.select(
					`INSERT INTO ${table} (${columns}) VALUES ${placeholders} RETURNING *`,
					values
				);
				console.log('Inserted successfully now closing db', query);
				return { data: query };
			case 'cloud':
				console.log('in the cloud save function with :', table, formData, key);

				let stuffToSave;
				if (Array.isArray(formData)) {
					stuffToSave = [];
					for (const element of formData) {
						stuffToSave.push(
							await encryptTable(
								table,
								element,
								key ?? (await invoke('get_main_key', { userId: get(user).user.id }))
							)
						);
					}
				} else {
					stuffToSave = await encryptTable(
						table,
						formData,
						key ?? (await invoke('get_main_key', { userId: get(user).user.id }))
					);
				}
				console.log('stuff to save = ', stuffToSave);

				const response = await supabase.from(table).insert(stuffToSave);
				console.log(response);
				return response;

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

	async update(table, filters, formData, key) {
		switch (this.offre) {
			case 'free':
				let db = new LocalDatabase();
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
				console.log('updated successfully now closing db', stmt);
				return stmt;
			case 'cloud':
				//! Attention ici car si on laisse la façon de faire actuelle il va y avoir des dégats (il faut réencrypter à chaque fois TOUS les champs de l'objet)
				// TODO find a way to gather all the info before encryption
				//? at the moment I just spread the entire object before the modifications in the update function like
				//? {... object, updatedAttrs}
				console.log('in dbadapter with', table, formData, filters, key);

				const encryptedData = await encryptTable(table, formData);
				console.log('encrypted data = ', encryptedData);

				console.log(supabase.auth);

				let query = supabase.from(table).update(encryptedData);
				for (const filter of filters ?? []) {
					query.eq(filter[0], filter[1]);
				}
				console.log(query);
				const suparesponse = await query;
				console.log('respose from supabase', suparesponse);
				return suparesponse;
			default:
				break;
		}
	}

	async delete(table, filters) {
		switch (this.offre) {
			case 'free':
				let whereClauses = [];
				let filterValues = [];
				for (const filter of filters) {
					whereClauses.push(`${filter[0]} = $${filters.indexOf(filter) + 1}`);
					filterValues.push(filter[1]);
				}
				let db = new LocalDatabase();
				const stmt = await db.execute(
					`DELETE FROM ${table} WHERE ${whereClauses.join(', ')}`,
					filterValues
				);
				return stmt;
			case 'cloud':
				console.log('in dbAdapter.delete with ', table, filters);

				let query = supabase.from(table).delete();

				for (const filter of filters) {
					query.eq(filter[0], filter[1]);
				}
				console.log('current delete query', query);
				const supaResponse = await query;
				console.log('supabase response', supaResponse);

				return supaResponse;
			default:
				console.log(`in DBAdapter.save(${table}, ${formData})`);
				return;
		}
	}

	async retrieve(table, selectStatement, [filterName, filterValue]) {
		switch (this.offre) {
			case 'free':
				console.log(
					'in DBAdapter.retrieve() with',
					table,
					selectStatement,
					filterName,
					filterValue
				);
				let db = new LocalDatabase();

				const stmt = await db.select(
					`SELECT ${selectStatement} FROM ${table} WHERE ${filterName} = $1`,
					[filterValue]
				);
				return { data: stmt };
			case 'cloud':
				const { data, error } = await supabase
					.from(table)
					.select(selectStatement)
					.eq(filterName, filterValue);
				console.log('data from retrieve', data);

				if (data.length > 0) {
					return await decryptTable(table, data[0]);
				} else {
					return { data: [] };
				}
			default:
				console.log(`in DBAdapter.save(${table}, ${selectStatement})`);
				return;
		}
	}
	async retrieve_sp(sp_id) {
		switch (this.offre) {
			case 'free':
				let db = new LocalDatabase();
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
				let seances = await db.select(`SELECT * FROM seances WHERE sp_id = $1 ORDER BY date ASC`, [
					sp_id
				]);
				console.log('in DBAdapter.retrieve_sp() with', seances);
				let prescriptions = await db.select(
					`SELECT * FROM prescriptions WHERE sp_id = $1 ORDER BY created_at ASC`,
					[sp_id]
				);
				console.log('in DBAdapter.retrieve_sp() with', prescriptions);
				let attestations = await db.select(
					`SELECT * FROM attestations WHERE sp_id = $1 ORDER BY created_at ASC`,
					[sp_id]
				);
				console.log('in DBAdapter.retrieve_sp() with', attestations);
				let generateurs = await db.select(`SELECT * FROM generateurs_de_seances WHERE sp_id = $1`, [
					sp_id
				]);
				console.log('in DBAdapter.retrieve_sp() with', generateurs);
				let documents = await db.select(
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
			case 'cloud':
				let selectStatement = `sp_id, created_at, encrypted,
					seances (seance_id, user_id, sp_id, patient_id, start, end, encrypted),
					prescriptions (prescription_id, patient_id, sp_id, user_id, encrypted),
					attestations (attestation_id, patient_id, sp_id, prescription_id, user_id, encrypted),
					documents (document_id, patient_id, sp_id, user_id, encrypted)`;
				const { data, error } = await supabase
					.from('situations_pathologiques')
					.select(selectStatement)
					.eq('user_id', get(user).user.id)
					.eq('sp_id', sp_id);
				//TODO HANDLE ERROR
				if (data.length > 0) {
					const { decryptedSP, prescrs, prestas, attests, docs } = await decryptSP(data);
					return {
						data: {
							...decryptedSP,
							seances: prestas,
							prescriptions: prescrs,
							attestations: attests,
							documents: docs
						}
					};
				} else {
					return { data: {} };
				}
			default:
				console.log(`in DBAdapter.save(${table}, ${sp_id})`);
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
				let db = new LocalDatabase();
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
				console.log('the finale supabase QUERY = ', query);

				let { data, error } = await query;
				const returningObj = { data: [] };
				const key = await invoke('get_main_key', { userId: get(user).user.id });
				console.log('key and data', key, data, error);

				for (const element of data) {
					returningObj.data.push(await decryptTable(table, element, key));
				}
				return returningObj;
			default:
				console.log(`in DBAdapter.save(${table}, ${selectStatement})`);
				return;
		}
	}

	async get_last_sp(patient_id, user_id) {
		console.log('in DBAdapter.get_last_sp() with', patient_id, user_id);
		switch (this.offre) {
			case 'free':
				let db = new LocalDatabase();
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
				let seances = await db.select(`SELECT * FROM seances WHERE sp_id = $1 ORDER BY date ASC`, [
					sp_id
				]);
				let prescriptions = await db.select(
					`SELECT * FROM prescriptions WHERE sp_id = $1 ORDER BY created_at ASC`,
					[sp_id]
				);
				let attestations = await db.select(
					`SELECT * FROM attestations WHERE sp_id = $1 ORDER BY created_at ASC`,
					[sp_id]
				);
				let generateurs = await db.select(`SELECT * FROM generateurs_de_seances WHERE sp_id = $1`, [
					sp_id
				]);
				let documents = await db.select(
					`SELECT * FROM documents WHERE sp_id = $1 ORDER BY created_at ASC`,
					[sp_id]
				);

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
				return result;
			case 'cloud':
				// TODO handle ERROR
				//! il faut pouvoir à chaque fois : soit envoyer les données au server, soit les stocker en local en attendant de pouvoir les envoyer au server
				const { data, error } = await supabase
					.from('situations_pathologiques')
					.select(
						`sp_id, created_at, encrypted,
					seances (seance_id, user_id, sp_id, patient_id, date, end, encrypted),
					prescriptions (prescription_id, patient_id, sp_id, user_id, encrypted),
					attestations (attestation_id, patient_id, sp_id, prescription_id, user_id, encrypted),
					documents (document_id, patient_id, sp_id, user_id, encrypted)`
					)
					.eq('user_id', user_id)
					.eq('patient_id', patient_id)
					.order('created_at', { ascending: false })
					.limit(1);
				console.log('in dbAdapter.get_last_sp with ', data, error);

				const { decryptedSP, prescrs, prestas, attests, docs } = await decryptSP(data);
				let final_resutl = {
					data: {
						ps: [decryptedSP],
						seances: prestas,
						prescriptions: prescrs,
						attestations: attests,
						documents: docs
					}
				};
				console.log('dbadapter.get_last_sp final result = ', final_resutl);
				return final_resutl;

			default:
				console.log(`in DBAdapter.get_last_sp(${patient_id}, ${user_id})`);
				return;
		}
	}

	async update_seances(seances_array, key) {
		console.log('in DBAdapter.update_seances() with', seances_array);
		switch (this.offre) {
			case 'free':
				let db = new LocalDatabase();

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
				break;
			case 'cloud':
				let seances_data = [];
				for (const s of seances_array) {
					seances_data.push(await encryptTable('seances', s, key ?? (await invoke())));
				}
				console.log('in DBAdapter.update_seances() with', seances_data);
				return await supabase.rpc('bulk_update_seances', {
					seances_data
				});
			default:
				console.log(`in DBAdapter.update_seances(${seances_array})`);
				return;
		}
	}

	async delete_all_patient() {
		switch (this.offre) {
			case 'free':
				let db = new LocalDatabase();
				await db.execute('DELETE FROM patients WHERE user_id = $1', [get(user).user.id]);
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

async function decryptSP(data) {
	if (!data || data.length === 0) {
		return {
			docs: undefined,
			prestas: undefined,
			prescrs: undefined,
			attests: undefined,
			decryptedSP: undefined
		};
	}
	let sp = data[0];
	let docs = [];
	for (const doc of sp.documents) {
		docs.push(await decryptTable('documents', doc));
	}
	let prescrs = [];
	for (const prescr of sp.prescriptions) {
		prescrs.push(await decryptTable('prescriptions', prescr));
	}
	let attests = [];
	for (const att of sp.attestations) {
		attests.push(await decryptTable('attestations', att));
	}
	let prestas = [];
	for (const presta of sp.seances) {
		prestas.push(await decryptTable('seances', presta));
	}
	delete sp.documents;
	delete sp.attestations;
	delete sp.seances;
	delete sp.prescriptions;
	let decryptedSP = await decryptTable('situations_pathologiques', sp);

	return {
		docs,
		prestas,
		prescrs,
		attests,
		decryptedSP
	};
}
