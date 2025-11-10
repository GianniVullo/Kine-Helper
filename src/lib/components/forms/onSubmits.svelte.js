import { checkAndUpdateConventions } from '../../stores/conventionStore';
import { appState } from '../../managers/AppState.svelte';
import { supabase } from '../../stores/supabaseClient';
import { t } from '../../i18n';
import { goto, invalidate } from '$app/navigation';
import { get } from 'svelte/store';
import { cloneDeep, isEmpty } from 'lodash';
import { diffArrays } from './utils/tarifHelpers';
import { prescriptionPath } from './utils/prescriptionPath';
import {
	file_exists,
	open_file,
	open_remote_file,
	remove_file,
	save_local_file
} from '../../utils/fsAccessor';
import { platform } from '@tauri-apps/plugin-os';
import { appLocalDataDir, documentDir } from '@tauri-apps/api/path';
import { toast } from '../../cloud/libraries/overlays/notificationUtilities.svelte';
import { printAttestation } from '../../utils/rawPrinting';
import {
	getAccordPDF,
	getFactureMutuellePDFHandler,
	getFacturePatientPDFHandler
} from '../../user-ops-handlers/documents';
import { info } from '../../cloud/libraries/logging';

// --------------------------------------------
// ON SUBMITS FUNCTIONS
// --------------------------------------------

export async function onLogin(data) {
	info('In the LoginForm onValid');
	await appState.initializeDatabase();
	// Reset the cache part of the db
	await appState.db.execute('Delete from patients');
	await appState.db.execute('Delete from situations_pathologiques');
	info('AppState initialized with database', appState.db);
	// Connecter l'utilisateur
	let { data: signInData, error } = await supabase.auth.signInWithPassword({
		email: data.email.toLowerCase(),
		password: data.password
	});
	info('User signed in', signInData);
	let { user, session } = signInData;
	//  TODO STEP 1a : Error handling
	if (error) {
		info('Error while signing in:', error);
		return { error };
	}
	if (error) {
		info(`Erreur dans LoginForm onValid : ${error}`);
		switch (error.message) {
			case 'Invalid login credentials':
				return (this.message = 'Identifiants incorrects');
			default:
				return (this.message = error.message);
		}
	}
	info('Successfully logged user in');

	this.message = 'Mise à jour des conventions inami, cela peut prendre quelques minutes...';
	// Mettre à jour les conventions
	try {
		await synchConventions(this.message);
	} catch (error) {
		info('Error while updating conventions:', error);
	}

	// This will stay here for now for retrocompatibility
	info('Fetching remote user data');
	let { data: remoteUser, error: remoteUserError } = await supabase
		.from('kinesitherapeutes')
		.select('*')
		.eq('id', user.id)
		.single();

	info('Remote user data:', remoteUser, remoteUserError);
	user = { ...user, ...(remoteUser ? remoteUser : {}) };

	info('Remote user data fetching');
	this.message = get(t)('login', 'submission.profil');

	// Fetch either the locally last selected Organization or the first organisation owned by the user
	let organizations = await getOrganizationsForUser(user.id);

	info('Initialising AppState for the first time');
	info('Initializing AppState for the first time');
	// Initialiser l'objet "AppState"
	await appState.init({ user, session, organizations });

	// Peupler la base de données locale avec les patients si le client a le cloud activé
	try {
		await fetchPatients(this.message, user);
	} catch (error) {
		info('Error while fetching patients:', error);
	}

	// Récupérer les settings
	this.message = get(t)('login', 'submission.settings', null, 'Gathering settings');

	// REDIRECTION :
	//! I got tired of all these redirection bs. On the advices of my designer conselor I moved everything into its own form and redirect the user on an onBoarding widget on the dashboard.

	// Si le profil de l'utilisateur est incomplet
	// if (!appState.has_complete_profile()) {
	// 	info('User has incomplete profile');
	// 	goto('/post-signup-forms');
	// 	return;
	// }

	// Check si l'utilisateur a au moins un appareil enregistré
	info('Fetching user devices');
	let { data: appareil, error: appareilError } = await appState.db.select(
		"SELECT * FROM appareils WHERE role = 'raw_printer';"
	);

	if (appareilError) {
		info('appareil Error : ', appareilError);

		return (this.message = appareilError);
	}

	// REDIRECTION :
	// Si l'utilisateur n'a pas d'appareil enregistré
	// if (appareil?.length === 0 && platform() !== 'ios' && platform() !== 'android') {
	// 	info('User has no device on local db');
	// 	goto('/post-signup-forms');
	// 	return;
	// }

	info('Everything is fine, redirecting to the dashboard');
	goto('/dashboard');
}

export async function onKineUpsert(formData) {
	info('Form data submitted:', formData, this.form);
	/**
	 * * On valide les données du formulaire et on crée le profil utilisateur.
	 ** Puis on le redirige vers la page de configuration de l'imprimante/scanner ou de tarifs/suppléments si nécessaire.
	 */
	if (!appState.db) {
		await appState.init({});
	}
	const filteredData = this.filtrerLesChampsAUpdater(formData);
	info('Filtered data for DB operation', filteredData, isEmpty(filteredData));
	if (!isEmpty(filteredData)) {
		const { data: profileData, error: profileError } = await supabase
			.from('kinesitherapeutes')
			.upsert({ ...formData, id: appState.user.id, organization_id: appState.selectedOrg.id });
		info('profileData, error and formData', profileData, formData);
		if (profileError) {
			this.message = error;
			return;
		}
		// insert in local db
		const retrocompatibility = cloneDeep(filteredData);
		const { data: user, error: userTestError } = await appState.db.select(
			'SELECT * FROM kines WHERE user_id = $1',
			[appState.user.id]
		);
		info('User existence check:', user);
		if (user && user.length > 0) {
			// Update the existing record
			const { error: updateError } = await appState.db.updateLocal(
				'kines',
				[['user_id', appState.user.id]],
				retrocompatibility
			);
			info('Update error', updateError);
		} else {
			retrocompatibility.user_id = appState.user.id;
			delete retrocompatibility.id;
			// We don't need the id in the local db
			const { data: dbResponse, error: dbError } = await appState.db.execute(
				'INSERT INTO kines (user_id, nom, prenom, inami, bce, iban, adresse, cp, localite, conventionne) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
				[
					retrocompatibility.user_id,
					retrocompatibility.nom,
					retrocompatibility.prenom,
					retrocompatibility.inami,
					retrocompatibility.bce,
					retrocompatibility.iban,
					retrocompatibility.adresse,
					retrocompatibility.cp,
					retrocompatibility.localite,
					retrocompatibility.conventionne
				]
			);
			info('DB Response:', dbResponse, 'DB Error:', dbError);
		}
		//* Reset the user object in AppState otherwise the user data will be outdated
		await appState.init({
			user: { ...appState.user, ...retrocompatibility },
			session: appState.session
		});
		this.reset();
		info('now toasting');
		toast.trigger({
			title: 'Yes !',
			description: 'Données utilisateur modifiées avec succès.',
			type: 'success',
			timeout: 3000
		});
	}
}

export async function onPatientUpsert(data) {
	info('In PatientForm.onValid');

	if (this.mode === 'create') {
		info('Engaging Patient creation');
		// <!--* CREATE PROCEDURE -->
		let { data: response, error } = await appState.db.insert('patients', data);
		if (error) {
			return (this.message = error.message);
		}
		info('Patient Creation done Successfully');
	} else {
		info('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		const { error } = await appState.db.update(
			'patients',
			[
				['user_id', appState.user.id],
				['patient_id', data.patient_id]
			],
			this.filtrerLesChampsAUpdater(data)
		);
		info('Patient Updated');
		if (error) {
			return (this.message = error.message);
		}
		// TODO. I am seriously questioning this. I really have a bad understanding of the invalidation system. It would safer and probably even more ergonomic to simply add a reactive current patient $state to AppState class.
		await invalidate('patient:layout');
		info('Patient modified done Successfully');
	}

	goto('/dashboard/patients/' + this.form.patient_id);
}

export async function onSPUpsert(data) {
	info('In SPForm.onValid');

	if (this.mode === 'create') {
		info('Engaging SP creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await appState.db.insert('situations_pathologiques', data);
		if (error) {
			this.message = error;
			return;
		}
		info('SP Creation done Successfully');
	} else {
		info('Engaging sp modification');
		// <!--* UPDATE PROCEDURE -->
		const updatedFields = this.filtrerLesChampsAUpdater(data);
		if (!isEmpty(updatedFields)) {
			const { error } = await appState.db.update(
				'situations_pathologiques',
				[['sp_id', data.sp_id]],
				updatedFields
			);
			if (error) {
				info('Error while updating SP', error);
				this.message = error;
				return;
			}
			await invalidate('patient:layout');
		}
		info('sp modified done Successfully');
	}

	goto('/dashboard/patients/' + data.patient_id + '/situation-pathologique/' + data.sp_id);
}

export async function onPrescriptionUpsert(data) {
	info('In PrescriptionForm.onValid');

	if (this.mode === 'create') {
		info('Engaging Prescription creation');
		// <!--* CREATE PROCEDURE -->
		let { data: prescription, error } = await createPrescription(
			data,
			$state.snapshot(this.form.file)?.[0]
		);
		// ça pourrait être cool d'implémenter un ssytème de toast qui notifie "l'élément a bien été enregistré"
		if (error) {
			return (this.message = error);
		}
		// TODO : Handle Error
		info('SP Creation done Successfully');
	} else {
		info('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		const { error } = await updatePrescription(data, $state.snapshot(this.form.file)?.[0]);
		if (error) {
			return (this.message = error);
		}
		info('Patient modified done Successfully');
	}

	await invalidate('patient:layout');
	goto('/dashboard/patients/' + data.patient_id + '/situation-pathologique/' + data.sp_id);
}

export async function onSeanceUpsert(data) {
	info('In SeanceForm.onValid');

	if (this.mode === 'create') {
		info('Engaging Seance creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await appState.db.insert('seances', data);
		if (error) {
			return (this.message = error);
		}
		await invalidate('patient:layout');
		info('Seance Creation done Successfully');
	} else {
		info('Engaging Seance modification');
		const updateFields = this.filtrerLesChampsAUpdater(data);
		const modificationDone = !isEmpty(updateFields);
		info('les updateFields', updateFields, 'isEmpty', isEmpty(updateFields));
		// <!--* UPDATE PROCEDURE -->
		if (modificationDone) {
			const { error } = await appState.db.update(
				'seances',
				[['seance_id', this.form.seance_id]],
				data
			);
			if (error) {
				return (this.message = error);
			}
			await invalidate('patient:layout');
		}
		info('Seance modification done Successfully');
		toast.trigger({
			title: modificationDone ? 'Séance modifiée avec succès.' : 'Aucune modification effectuée.',
			description: 'Vous retrouverez votre séance dans votre agenda',
			type: 'success',
			timeout: 3000
		});
	}

	goto(
		'/dashboard/patients/' +
			this.form.patient_id +
			'/situation-pathologique/' +
			this.form.sp_id +
			'/seances'
	);
}

export async function onMultipleSeanceUpsert(data) {
	info('In MultipleSeanceForm.onValid');

	// info('in onValid with data' + JSON.stringify(data));
	info('onValid', data);
	// <!--* CREATE PROCEDURE -->
	const { error } = await appState.db.insert('seances', data);
	if (error) {
		return (this.message = error);
	}
	await invalidate('patient:layout');
	info('Seance Creation done Successfully');

	goto(
		'/dashboard/patients/' +
			(this.form.seances[0].patient_id ?? data[0]?.patient_id) +
			'/situation-pathologique/' +
			(this.form.seances[0].sp_id ?? data[0]?.sp_id) +
			'/seances'
	);
}

export async function onAttestationCreate(data) {
	info('In AttestationSchema.onValid');

	if (this.mode === 'create') {
		info('Engaging Attestation creation');
		// <!--* CREATE PROCEDURE -->
		// first we do it on the server
		const supabaseArgs = {
			p_generate_facture_patient: data.generateFacturePatient,
			p_generate_facture_mutuelle: data.generateFactureMutuelle,
			p_attestation: data.attestation,
			p_facture_patient: data.facturePatient,
			p_facture_mutuelle: data.factureMutuelle,
			p_seances: data.seances
		};
		try {
			supabaseArgs.p_attestation.total_recu = parseFloat(data.attestation.total_recu);
			supabaseArgs.p_attestation.valeur_totale = parseFloat(data.attestation.valeur_totale);
			supabaseArgs.p_attestation.numero = parseInt(data.attestation.numero);
			supabaseArgs.p_facture_patient.total = parseFloat(data.facturePatient.total);
			supabaseArgs.p_facture_mutuelle.total = parseFloat(data.factureMutuelle.total);
		} catch (error) {
			info('Error while preparing Supabase args for Attestation creation: ', error);
		}
		info('Supabase args for Attestation creation:', supabaseArgs);
		let { data: response, error: supabaseError } = await supabase.rpc(
			'create_attestation_rpc',
			supabaseArgs
		);
		info('Attestation creation response:', response, 'Error:', supabaseError);
		if (supabaseError || !response) {
			info('Error while creating attestation: ', supabaseError);
			return (this.message = supabaseError.message);
		}
		//then we do it on the local db
		let { error: localError } = await createLocalAttestation(data);
		if (localError) {
			info('Error while creating local attestation: ', localError);
			return (this.message = localError.message);
		}
		//then we do the side effects
		try {
			let { error: sideEffectsError } = await createAttestationSideEffects(data);
			if (sideEffectsError) {
				info('Error while creating attestation side effects: ', sideEffectsError);
				return (this.message = sideEffectsError.message);
			}
		} catch (unknownError) {
			console.error(unknownError);
		}

		info('Attestation Creation done Successfully');
	} else {
		info('Engaging Attestation modification');
		// <!--* UPDATE PROCEDURE -->
		// TODO
		info('Attestation modified done Successfully');
	}
	await invalidate('patient:layout');
	info('NOW SENDING THE USER TO THE DASHBOARD');
	goto(
		'/dashboard/patients/' +
			data.attestation.patient_id +
			'/situation-pathologique/' +
			data.attestation.sp_id +
			'/attestations'
	);
}

export async function onAccordUpsert(accord) {
	const { data: annexe, error: annexeError } = await appState.db.insert('accords', accord);
	if (annexeError) {
		return { error: annexeError };
	}
	// Create le pdf
	const { accord: accordPDF, error: accordPDFError } = await getAccordPDF(accord);
	if (accordPDFError) {
		return { error: accordPDFError };
	}
	// Open le pdf
	try {
		await accordPDF.open();
		// return { data: annexe[0] };
	} catch (errorPDFOpen) {
		// return { error: errorPDFOpen };
	}
	await invalidate('patient:layout');
	goto(
		'/dashboard/patients/' +
			accord.patient_id +
			'/situation-pathologique/' +
			accord.sp_id +
			'/documents'
	);
}

export async function onTarifsModification(data) {
	info('In TarifsForm.onValid');
	/**
	 ** Ici trois cas de figures :
	 **		- ou bien le tarifs/suppléments existe déjà => update
	 **		- ou bien non => create
	 **		- ou bien y'a rien de changé => on fait rien
	 */

	for (const fieldKey of Object.keys(data)) {
		const field = data[fieldKey];
		const initialValue = this.initialValues[fieldKey];
		info('in loop with : ', fieldKey);

		if (Array.isArray(field)) {
			const { created, updated, deleted } = diffArrays(initialValue, $state.snapshot(field));
			for (const newEl of created) {
				let { error } = await appState.db.insert(fieldKey, newEl);
				if (error) {
					return (this.message = error);
				}
			}
			for (const updateEl of updated) {
				let { error } = await appState.db.update(fieldKey, [['id', updateEl.id]], updateEl);
				if (error) {
					return (this.message = error);
				}
			}
			for (const deleteEl of deleted) {
				let { error } = await appState.db.delete(fieldKey, [['id', deleteEl.id]]);
				if (error) {
					return (this.message = error);
				}
			}
		} else {
			//* Create
			if (!field.id && field.valeur) {
				field.id = crypto.randomUUID();
				let { error } = await appState.db.insert('tarifs', $state.snapshot(field));
				if (error) {
					return (this.message = error);
				}
			}
			//* Update
			if (field.id && field.valeur != initialValue.valeur) {
				let { error } = await appState.db.update(
					'tarifs',
					[['id', field.id]],
					$state.snapshot(field)
				);
				if (error) {
					return (this.message = error);
				}
			}
			//* Delete
			if (field.id && !field.valeur) {
				let { error } = await appState.db.delete('tarifs', [['id', field.id]]);
				if (error) {
					return (this.message = error);
				}
			}
		}
	}
	goto('/dashboard/finances');
}

export async function onFactureCreate(data, attestation_ids, produce_pdf = true) {
	console.log('in createFacture with data, attestation_ids :', data, attestation_ids);
	/**
	 ** - Enregistrer une facture
	 ** - Lier les attestations à la facture
	 ** - Produire un PDF
	 */

	// facture creation
	let { data: facture, error: factureError } = await appState.db.insert('factures', data);
	if (factureError) {
		return { error: factureError };
	}
	console.log('facture', facture);

	// attestation linking
	for (const attestation_id of attestation_ids) {
		let { data: factureAttestation, error: factureAttestationError } = await appState.db.insert(
			'factures_attestations',
			{
				facture_id: data.id,
				attestation_id,
				user_id: appState.user.id,
				organization_id: appState.selectedOrg.id
			}
		);
		if (factureAttestationError) {
			return { error: factureAttestationError };
		}
		console.log('factureAttestation', factureAttestation);
	}

	// pdf production
	if (produce_pdf) {
		const { facture: facturePDF, error: facturePDFError } = await getFacturePDF(data);
		if (facturePDFError) {
			return { error: facturePDFError };
		}
		await facturePDF.open();
	}
	return { data: facture[0] };
}

// --------------------------------------------
// UTILS FUNCTIONS
// --------------------------------------------

async function synchConventions(message) {
	const { error: conventionUpdateError } = await checkAndUpdateConventions(message);
	if (conventionUpdateError) {
		info('Error while updating conventions : ', conventionUpdateError);
		return (message = conventionUpdateError);
	}
}

async function fetchPatients(message, user) {
	info('Populating local database with patients');
	message = 'Récupération des patients...';
	const { error: patientsError } = await appState.db.selectRemote(null, null, {
		table: 'patients',
		statement: '*',
		filters: { user_id: user.id }
	});
	if (patientsError) {
		info('Error while populating local database with patients: ', patientsError);
		return (message = patientsError);
	}
	info('Local database successfully populated with patients');
}

async function createPrescription(data, file) {
	info('in createPrescription');
	if (data.file_name) {
		delete data.file_name;
	}

	let file_name;
	if (file) {
		try {
			const fileExtension = file.name.split('.').pop();
			file_name = `${data.prescription_id}.${fileExtension}`;
			const filePath = prescriptionPath();
			data.prescripteur = JSON.stringify(data.prescripteur);
			let file_path = `${await get_precription_file_dir()}/${filePath}`;
			// first always compress the file.
			// 1 -> save it temporarily on the disk
			let _cachedFile = await save_local_file(filePath, file_name, file);
			// 2 -> compress and resize it
			await appState.queue.addToQueue({
				label: 'Compressing prescription scan',
				job: 'CompressAndSendPrescription',
				data: {
					file_path,
					file_name: prescriptionFileName(data, 'avif'),
					from: `${file_path}/${file_name}`
				}
			});
			data.file_name = { ext: 'avif' };
		} catch (error) {
			console.error('error while trying to compress and store prescription file ', error);
			throw new Error('Error while compressing and or storing the prescription file.');
		}
	}
	delete data.file;

	if (Array.isArray(data.froms)) {
		data.file_name = { ext: 'avif', n_p: data.froms.length };
		const applocaldataDir = await get_precription_file_dir();
		info('the froms', data.froms);
		for (const from of data.froms) {
			info('the from', from);
			await appState.queue.addToQueue({
				label: 'Compressing prescription scan',
				job: 'CompressAndSendPrescription',
				data: {
					file_path: `${applocaldataDir}/${prescriptionPath()}`,
					file_name: prescriptionFileName(data, 'avif'),
					from
				}
			});
		}
	}
	delete data.froms;
	info('the data', data);

	const { data: prescription, error } = await appState.db.insert('prescriptions', data);
	if (error) {
		return { data: null, error };
	}
	return { data: prescription, error: null };
}

async function updatePrescription(data, file) {
	info('in updatePrescription with data', data, 'and file', file);
	// TODO 1 : Il faut enregistrer le filename en fait car il faut pouvoir supprimer l'ancienne prescription même si l'extension de fichier n'est pas le même.
	// TODO 2 Implement the saveFile with supabase API
	//* comme c'est update, il n'y a pas besoin de changer l'image si elle n'a pas été transformée
	if (file) {
		info('there is a file', file);

		const filePath = prescriptionPath();
		const fileExtension = file.name.split('.').pop();
		const file_name = `${data.prescription_id}.${fileExtension}`;

		if (data.file_name) {
			info(
				'deleting old file, with name',
				prescriptionFileName(data, data.file_name),
				data.file_name
			);
			let delError = await remove_file(
				filePath + '/' + prescriptionFileName(data, data.file_name),
				{
					recursive: true
				}
			);
			info('delError', delError);
			// if (delError) {
			// 	return { error: delError };
			// }
		}
		let _cachedFile = await save_local_file(filePath, file_name, file);
		let file_path = `${await get_precription_file_dir()}/${filePath}`;
		await appState.queue.addToQueue({
			label: 'Compressing prescription scan',
			job: 'CompressAndSendPrescription',
			data: {
				file_path,
				file_name: prescriptionFileName(data, 'avif'),
				from: `${file_path}/${file_name}`
			}
		});
		data.file_name = { ext: fileExtension };
	}
	delete data.file;

	if (Array.isArray(data.froms) && data.froms.length > 0) {
		if (data.file_name) {
			try {
				// TODO for loop to delete all the files for n_p files
				// if !n_p, delete a single file
				// for (index of n_p)

				let delError = await remove_file(filePath + '/' + prescriptionFileName(data), {
					recursive: true
				});
				if (delError) {
					return { error: delError };
				}
			} catch (error) {
				console.error('Error deleting file', error);
			}
		}
		data.file_name = { ext: 'avif', n_p: data.froms.length };

		const applocaldataDir = await get_precription_file_dir();
		const filePath = prescriptionPath();

		info('the froms', data.froms);

		for (const from of data.froms) {
			info('the from', from);
			await appState.queue.addToQueue({
				label: 'Compressing prescription scan',
				job: 'CompressAndSendPrescription',
				data: {
					file_path: `${applocaldataDir}/${prescriptionPath()}`,
					file_name: prescriptionFileName(data, 'avif'),
					from
				}
			});
		}
	}
	delete data.froms;

	const { error } = await appState.db.update(
		'prescriptions',
		[
			['prescription_id', data.prescription_id],
			['user_id', appState.user.id]
		],
		data
	);
	info('the error', error);
	if (error) {
		return { error };
	}
	return { error: null };
}

export async function deletePrescription(prescription) {
	let { data, error } = await appState.db.delete('prescriptions', [
		['prescription_id', prescription.prescription_id]
	]);
	if (error) {
		info(error);

		return { data: null, error };
	}
	const filePath = prescriptionPath();
	let file_name = prescriptionFileName(prescription, prescription.file_name);
	const completePath = `${filePath}/${file_name}`;
	if (file_name) {
		if (await file_exists(completePath)) {
			let fserror = await remove_file(completePath, { recursive: false });
			if (fserror) {
				info(fserror);

				return { data: null, error: fserror };
			}
		}
	}
	return { data, error: error };
}

/**
 ** - We try to open it from local
 ** - If it fails, we try to open it from the cloud
 ** - If it fails, we return an error
 ** - If it succeeds, we store the file locally
 ** - finally, we return the file content
 */
export async function openPrescription(prescription) {
	// --------------------------------------------
	// PREPARING EXTRACTION
	// --------------------------------------------
	if (typeof prescription.file_name === 'string') {
		try {
			prescription.file_name = JSON.parse(prescription.file_name);
		} catch (error) {
			console.error('Error parsing file_name:', error);
		}
	}
	info('the prescription', prescription);
	let path = prescriptionPath();
	// the prescription file name has a ?? call for retro compatibility.
	const fileName = `${prescription.prescription_id}.${prescription.file_name?.ext ?? prescription.file_name}`;
	const completePath = `${path}/${fileName}`;
	info('the complete path', completePath);

	// --------------------------------------------
	// TRYING TO OPEN THE FILE FROM LOCAL STORAGE
	// --------------------------------------------
	// Check if the file exists locally
	let exist = await file_exists(completePath);
	if (exist) {
		let fsError = await open_file(completePath);
		if (fsError) {
			return { error: fsError };
		}
	} else {
		info('File does not exist locally, trying to fetch from cloud');
		// --------------------------------------------
		// TRYING TO OPEN THE FILE FROM CLOUD STORAGE
		// --------------------------------------------
		try {
			let { data, error: downloadError } = await open_remote_file(
				'users',
				`${appState.user.id}/prescriptions/${prescription.prescription_id}.${prescription.file_name.ext}`
			);
			if (downloadError) {
				console.error('Error downloading file from cloud:', downloadError);
				return { error: downloadError };
			}
			// --------------------------------------------
			// SAVING THE FILE LOCALLY
			// --------------------------------------------
			info('File downloaded successfully from cloud:', data);
			try {
				let response = await save_local_file(path, fileName, data);
				info('File saved locally:', response);
			} catch (fsError) {
				console.error('Error saving file locally:', fsError);
				return { error: fsError };
			}
			// --------------------------------------------
			// OPENING THE FILE LOCALLY
			// --------------------------------------------
			await open_file(completePath);
		} catch (error) {
			console.error('Error fetching file from cloud:', error);
			return { error };
		}
	}
	return { data: null, error: null };
}

// This is needed because Windows won't let us write to the appLocalDataDir so we need to rewire it to the documentDir
async function get_precription_file_dir() {
	if (platform() === 'windows') {
		return await documentDir();
	}
	return await appLocalDataDir();
}

function prescriptionFileName(prescription, ext) {
	if (ext) {
		info('ext is a string', ext);
		if (typeof ext === 'string') {
			try {
				info('Parsing ext as JSON', ext);
				const prescriptionName = `${prescription.prescription_id}.${JSON.parse(ext).ext}`;
				info('Parsed prescription name:', prescriptionName);
				return prescriptionName;
			} catch (error) {
				console.error('Error parsing ext:', error);
			}
			return `${prescription.prescription_id}.${ext}`;
		}
	} else {
		if (!prescription.file_name?.ext) {
			return null;
		}
		return `${prescription.prescription_id}.${prescription.file_name.ext}`;
	}
}

async function createLocalAttestation(data) {
	/**
	 ** Il faut :
	 ** 	- Créer une attestation
	 ** 	- Mettre à jour la prescription.jointe_a si attestation.porte_prescr
	 ** 	- Mettre à jour les séances (has_been_attested)
	 *TODO 	- Si la séance contient des tarifs avec un uuid, il faut hardcoder le tarif
	 ** 	- Créer une facture si nécessaire
	 ** 	- Créer le lien entre facture et attestation(s)
	 ** 	- Imprimer l'attestation et/ou la facture
	 ** 	- Mettre à jour la valeur de num_attestation dans le store
	 */

	// Création de l'attestation
	info('createAttestation', data);
	let { data: attestation, error: attestationError } = await appState.db.insertLocal(
		'attestations',
		data.attestation
	);

	info('attestation', attestation);
	if (attestationError) {
		return { error: attestationError };
	}

	// Mise à jour de la prescription
	if (data.attestation.porte_prescr) {
		let { data: prescription, error: prescriptionError } = await appState.db.updateLocal(
			'prescriptions',
			[['prescription_id', data.attestation.prescription_id]],
			{ jointe_a: data.attestation.date }
		);
		info('prescription', prescription);
		if (prescriptionError) {
			return { error: prescriptionError };
		}
	}

	// Mise à jour des séances
	let seanceCodeMap = data.seances.reduce((seanceMap, s) => {
		info('seanceMap', seanceMap);
		if (!seanceMap[s.code_id]) seanceMap[s.code_id] = [];
		seanceMap[s.code_id].push(s.seance_id);
		return seanceMap;
	}, {});
	info('seanceCodeMap', seanceCodeMap);
	let caseStatements = Object.entries(seanceCodeMap)
		.map(([code, seanceIds]) => `WHEN seance_id IN ('${seanceIds.join("', '")}') THEN '${code}'`)
		.join('\n');

	info('caseStatements', caseStatements);

	// Il faut remplacer les tarifs et suppléments par une valeur "metadata.valeur_totale" qui additionne le prix de la séance + le prix des suppléments
	// cette addition doit être réalisée dans AttestationSchema et metadata doit être updaté ici
	let sqlQuery = `
		UPDATE seances
			SET 
			attestation_id = $1,
			has_been_attested = true,
			code_id = CASE 
				${caseStatements}
				END
		WHERE seance_id IN ('${data.seances.map((s) => s.seance_id).join("', '")}');`;

	info(sqlQuery);
	let { data: seances, error: seancesError } = await appState.db.execute(sqlQuery, [
		data.attestation.attestation_id
	]);
	for (const { metadata, seance_id } of data.seances) {
		let { data: metadataUpdateStatus, error: metadataUpdateError } = await appState.db.execute(
			"UPDATE seances SET metadata = json_insert(COALESCE(metadata, '{}'), '$.valeur_totale', $1) WHERE seance_id = $2",
			[metadata.valeur_totale, seance_id]
		);
		if (metadataUpdateError) {
			return { error: metadataUpdateError };
		}
		info('metadataUpdateStatus', metadataUpdateStatus);
	}
	if (seancesError) {
		return { error: seancesError };
	}
	info('seances', seances);

	// Génération des fatcures
	if (data.generateFacturePatient) {
		let { data: facturePatient, error: facturePatientError } = await appState.db.insertLocal(
			'factures',
			data.facturePatient
		);
		if (facturePatientError) {
			return { error: facturePatientError };
		}
		let { data: factureAttestation, error: factureAttestationError } =
			await appState.db.insertLocal('factures_attestations', {
				facture_id: data.facturePatient.id,
				attestation_id: data.attestation.attestation_id
			});
		info('factureAttestation', factureAttestation);
		if (factureAttestationError) {
			return { error: factureAttestationError };
		}
		info('facturePatient', facturePatient);
	}
	if (data.generateFactureMutuelle) {
		console.log('need to generateFactureMutuelle');
		let { data: factureMutuelle, error: factureMutuelleError } = await appState.db.insertLocal(
			'factures',
			data.factureMutuelle
		);
		if (factureMutuelleError) {
			return { error: factureMutuelleError };
		}
		let { data: factureAttestation, error: factureAttestationError } =
			await appState.db.insertLocal('factures_attestations', {
				facture_id: data.factureMutuelle.id,
				attestation_id: data.attestation.attestation_id
			});
		if (factureAttestationError) {
			return { error: factureAttestationError };
		}
		info('factureMutuelle', factureMutuelle);
	}
	// THis is because fcts accrss my code desctructure the result
	return {};
}

async function createAttestationSideEffects(data) {
	// impression des faactures et attestation
	if (data.has_been_printed) {
		const { error } = await printAttestation(data.lines, data.attestation);
		// Mise à jour de num_attestation
		let { data: numero, error: storeError } = await appState.db.setItem(
			'num_attestation',
			parseInt(data.attestation.numero) + 1
		);
		info('numeroQueryResult', numero);

		if (storeError) {
			return { error: storeError };
		}
	}
	if (data.printFacturePatient) {
		// TODO : implement PDF printing
		try {
			const { facture: facturePatient, error: facturePatientError } =
				await getFacturePatientPDFHandler(data.facturePatient);

			if (facturePatientError) {
				return { error: facturePatientError };
			}
			// TODO Mettre la fonction print lorsque l'API sera prête
			facturePatient.open();
			// facturePatient.print();
		} catch (error) {
			console.error(error);
			return { error };
		}
	}
	if (data.printFactureMutuelle) {
		// TODO : implement PDF printing
		const { facture: factureMutuelle, error: factureMutuelleError } =
			await getFactureMutuellePDFHandler(data.factureMutuelle);
		if (factureMutuelleError) {
			return { error: factureMutuelleError };
		}
		// TODO Mettre la fonction print lorsque l'API sera prête
		factureMutuelle.open();
		// factureMutuelle.print();
	}
	return {};
}

async function getOrganizationsForUser(user_id) {
	// Fetch either the locally last selected Organization or the first organisation owned by the user
	let locallyLastSelectedOrganization = await appState.db.getItem(`lastSelectedOrgBy-${user_id}`);

	let { data: organizations, error } = await supabase
		.from('organizations')
		.select(`*, organization_members!inner(user_id, user_roles(role:roles(name)))`)
		.eq('organization_members.user_id', user_id);

	info(organizations);

	// Use the organization we found
	const selectedOrg =
		organizations.find((o) => o.id === locallyLastSelectedOrganization) || organizations[0];

	let v_organisations = [];
	// Adding the selected prop on organization for future UI manipulations
	// Adding the logo prop containing the logo blob
	for (const org of organizations) {
		const { data: logo, error } = await open_remote_file('team-logos', org.logo_path);
		v_organisations.push({
			id: org.id,
			name: org.name,
			selected: org === selectedOrg,
			slug: org.slug,
			settings: org.settings,
			logo: error ? undefined : logo,
			created_at: org.created_at,
			updated_at: org.updated_at
		});
	}
	organizations = organizations.map((o) =>
		o === selectedOrg
			? { ...o, selected: true, membres: [] }
			: { ...o, selected: false, membres: [] }
	);

	if (selectedOrg) {
		// Store/update the last selected org
		await appState.db.setItem(`lastSelectedOrgBy-${user_id}`, selectedOrg.id);
	}
	return organizations;
}
