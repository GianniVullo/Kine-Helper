import { NomenclatureArchitecture } from './nomenclatureManager';
import { LocalDatabase } from '../stores/databaseInitializer';
import DBAdapter from '$lib/user-ops-handlers/dbAdapter';import dayjs from 'dayjs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import { patients } from '../stores/PatientStore';
import { encryptTable } from '../stores/encryption';
import { supabase } from '../stores/supabaseClient';

/** Pour manipuler une séances :
 *!	- L'opération adéquate en fonction de la manipulation :
 *?		REPORTER :
 *?			- assigner la nouvelle date à la séance pointée par l'argument seanceId
 *?		SUPPRIMER :
 *?			- retirer la séance de la liste this.seances
 *?			- delete query pour effacer la séance de la db
 *?		AJOUTER :
 *?			- créer un objet séance et y ajouter :
 *?				- la date
 *?				- le champ created_at
 *?				- la description
 *?				- la prescription
 *?				- le userId
 *?				- le patientId
 *?			- insert query la séance dans la db
 *?			- ajouter la séance à la liste this.seances
 *
 *(realign method)
 **	- réordonner la liste de séance avec .sort(byDate)
 **	- itérer au travers de la liste de séances (this.séances)
 **	- fetch la bonne convention en fonction de la date de la séance
 **	- cacher la convention pour ne pas refetch à chaque fois
 **	- fetch le code à partir de l'id de la convention
 **	- cacher le code pour les autre séances
 **	- update Query les date et code de la séance
 **		- le code doit provenir de la liste architecture.
 **		- on y accède grâce à l'index de la boucle d'itération */

export class ManipulateurDeSeances {
	/** Le but de cette classe :
	** Elle permet de modifier et de supprimer des séances au sein d'une situation pathologique SANS altérer la structure des codes de nomenclature de la situation pathologique.
  	*? Par exemple :
    On encode une pathologie courante et on y génère 18 séances.
    *? Cas 1 : Report d'une séance
      Si l'on reporte une des 9 premières séances (donc portant le code SEANCE_NORMALE) à la fin du traitement, il faut que la séance reportée prennent désormais le code adéquat (SEANCE_DEPASSEMENT) ET que la séance qui était la dixième séance porte .
    *? Cas 2 : Suppression d'une séance
      Si l'on supprime une séance, il faut que la séance qui était la dixième séance porte le code adéquat (SEANCE_NORMALE) et que les séances suivantes soient décalées d'un rang.
    *? Cas 3 : Ajout d'une séance
      Si l'on ajoute une séance, il faut que la séance qui était la dixième séance porte le code adéquat (SEANCE_DEPASSEMENT) et que les séances suivantes soient décalées d'un rang. */

	constructor(patient, sp) {
		this.seances = sp.seances;
		this.architecture = new NomenclatureArchitecture(patient, sp);
	}

	async prepareArchitecture(db) {
		return this.architecture.architecture(
			(
				await db.select('SELECT * from codes WHERE convention_id = $1', [
					'3ba16c31-d8c3-4f07-a5ed-9148dfcccf8f'
				])
			)
		);
	}

	async template(manipulation) {
		console.log('in the template method');
		// open a db connection
		let db = new LocalDatabase();
		// prepare architecture
		let arch = await this.prepareArchitecture(db);
		console.log('architecture prepared', arch);
		// perform the manipulation
		await manipulation(db);
		// Then reordering the list
		this.seances.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
		// realign the séances
		await this.realign(db, arch);
		console.log('template method done');
		patients.update((ps) => {
			const p = ps.find((p) => p.patient_id === this.seances[0].patient_id);
			const sp = p.situations_pathologiques.find((sp) => sp.sp_id === this.seances[0].sp_id);
			sp.seances = [];
			sp.seances = this.seances;
			return ps;
		});
	}

	async realign(db, arch) {
		console.log('realigning');
		let mergedArch = [];
		if (Array.isArray(arch[0])) {
			console.log;
			for (const archType of arch) {
				mergedArch = [...mergedArch, ...archType];
			}
		} else {
			mergedArch = arch;
		}
		if (get(user).profil.offre === 'cloud') {
			//* We need to build a list of encrypted and adjusted seance
			let seances_data = [];
			for (let idx = 0; idx < this.seances.length; idx++) {
				
				const seance = this.seances[idx];
				const code_ref = mergedArch[idx].code_reference;
				console.log('code_ref', code_ref);
				let updated_code_id = await db.select(
					`SELECT c.code_id
						FROM codes AS c
						INNER JOIN conventions AS con ON c.convention_id = con.convention_id
						WHERE con.created_at <= date($1)
							AND c.code_reference = $2
						ORDER BY con.created_at DESC
						LIMIT 1`,
					[seance.date, code_ref]
				);
				seances_data.push(
					await encryptTable(
						'seances',
						{
							...seance,
							code_id: updated_code_id
						}
					)
				);
			}
			await supabase.rpc('bulk_update_seances', { seances_data });
			//! le if statment ici vient prévenir un bug où certaines fois la query SQL ne retournait rien car, comme j'avais delete une row, il y avait un null dans this.seances. je ne me rapelle plus pourquoi...
			if (updatedSeance.length > 0) {
				seance.code_id = updatedSeance[0].code_id;
			}
		} else {
			for (let idx = 0; idx < this.seances.length; idx++) {
				const seance = this.seances[idx];
				const code_ref = mergedArch[idx].code_reference;
				// Update the seance with the correct code_id based on the most recent convention and the specific code_reference
				const updatedSeance = await db.select(
					`
					UPDATE seances
					SET code_id = (
						SELECT c.code_id
						FROM codes AS c
						INNER JOIN conventions AS con ON c.convention_id = con.convention_id
						WHERE con.created_at <= date($1)
							AND c.code_reference = $2
						ORDER BY con.created_at DESC
						LIMIT 1
					), date = $3
					WHERE seance_id = $4
					RETURNING *;`,
					[seance.date, code_ref, seance.date, seance.seance_id]
				);
				//! le if statment ici vient prévenir un bug où certaines fois la query SQL ne retournait rien car, comme j'avais delete une row, il y avait un null dans this.seances. je ne me rapelle plus pourquoi...
				if (updatedSeance.length > 0) {
					seance.code_id = updatedSeance[0].code_id;
				}
			}
		}
	}

	async reporter(seance, newDate) {
		console.log('reporting', seance, newDate);
		await this.template(async (db) => {
			// First assigning the new date to the seance
			this.seances.find((s) => s.seance_id === seance.seance_id).date = newDate;
		});
	}

	async supprimer(seance) {
		await this.template(async (db) => {
			if (Array.isArray(seance)) {
				console.log('the seance obj is a list :', seance);
				// First removing the seance from the list
				this.seances = this.seances.filter((s) => s.seance_id !== seance.seance_id);
				console.log(this.seances);
				const sqlSttmt = `DELETE FROM seances WHERE ${seance
					.map((s, idx) => `${idx === 0 ? '' : 'OR'} seance_id = $${idx + 1}`)
					.reduce((a, b) => `${a} ${b}`)};`;
				console.log(sqlSttmt);
				// Then deleting the seance from the db
				if (get(user).profil.offre === 'cloud') {
					//TODO handle ERROR
					let { data, error } = await supabase
						.from('seances')
						.delete()
						.in(
							'seance_id',
							seance.map((s) => s.seance_id)
						);
					console.log(data, error);
				} else {
					await db.execute(
						sqlSttmt,
						seance.map((s) => s.seance_id)
					);
				}
			} else {
				// First removing the seance from the list
				this.seances = this.seances.filter((s) => s.seance_id !== seance.seance_id);
				// Then deleting the seance from the db
				if (get(user).profil.offre === 'cloud') {
					//TODO handle Error
					const { data, error } = await supabase
						.from('seances')
						.delete()
						.eq('seance_id', seance.seance_id);
					console.log(data, error);
				} else {
					await db.execute('DELETE FROM seances WHERE seance_id = $1;', [seance.seance_id]);
				}
			}
		});
	}

	async ajouter(seance) {
		await this.template(async (db) => {
			if (get(user).profil.offre === 'cloud') {
				//TODO handle ERROR
				const { data, error } = await supabase.from('seances').insert(
					await encryptTable('seances', {
						seance_id: seance.seance_id,
						sp_id: seance.sp_id,
						date: seance.date,
						created_at: seance.created_at,
						description: seance.description,
						prescription_id: seance.prescription_id,
						user_id: get(user).user.id,
						patient_id: seance.patient_id
					})
				);
			} else {
				await db.execute(
					'INSERT INTO seances (seance_id, sp_id, date, created_at, description, prescription_id, user_id, patient_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);',
					[
						seance.seance_id,
						seance.sp_id,
						seance.date,
						seance.created_at,
						seance.description,
						seance.prescription_id,
						get(user).user.id,
						seance.patient_id
					]
				);
			}
			this.seances.push(seance);
		});
	}
}
