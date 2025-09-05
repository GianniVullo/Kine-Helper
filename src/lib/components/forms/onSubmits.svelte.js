import { checkAndUpdateConventions } from '../../stores/conventionStore';
import { appState } from '../../managers/AppState.svelte';
import { trace, error as errorLog, info } from '@tauri-apps/plugin-log';
import { supabase } from '../../stores/supabaseClient';
import { t } from '../../i18n';
import { goto, invalidate } from '$app/navigation';
import { get } from 'svelte/store';
import { cloneDeep, isEmpty } from 'lodash';
import { successIcon } from '../../ui/svgs/IconSnippets.svelte';
import { diffArrays } from './utils/tarifHelpers';
import { prescriptionPath } from './utils/prescriptionPath';
import {
	file_exists,
	open_file,
	remove_file,
	save_local_file,
	save_to_disk
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
import { terminal } from 'virtual:terminal';

// --------------------------------------------
// ON SUBMITS FUNCTIONS
// --------------------------------------------

export async function onLogin(data) {
	trace('In the LoginForm onValid');
	await appState.initializeDatabase();
	terminal.log('AppState initialized with database', appState.db);
	// Connecter l'utilisateur
	let { data: signInData, error } = await supabase.auth.signInWithPassword({
		email: data.email.toLowerCase(),
		password: data.password
	});
	terminal.log('User signed in', signInData);
	let { user, session } = signInData;
	//  TODO STEP 1a : Error handling
	if (error) {
		terminal.error('Error while signing in:', error);
		return { error };
	}
	if (error) {
		errorLog(`Erreur dans LoginForm onValid : ${error}`);
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
		pluginTerminal.error('Error while updating conventions:', error);
	}

	// This will stay here for now for retrocompatibility
	trace('Fetching remote user data');
	let { data: remoteUser, error: remoteUserError } = await supabase
		.from('kinesitherapeutes')
		.select('*')
		.eq('id', user.id)
		.single();
	console.log('Remote user data:', remoteUser, remoteUserError);
	user = { ...user, ...(remoteUser ? remoteUser : {}) };

	trace('Remote user data fetching');
	this.message = get(t)('login', 'submission.profil');

	// Peupler la base de données locale avec les patients si le client a le cloud activé
	try {
		await fetchPatients(this.message, user);
	} catch (error) {
		terminal.error('Error while fetching patients:', error);
	}

	// Récupérer les settings
	this.message = get(t)('login', 'submission.settings', null, 'Gathering settings');

	trace('Initialising AppState for the first time');
	terminal.warn('Initializing AppState for the first time');
	// Initialiser l'objet "AppState"
	await appState.init({ user, session });

	// REDIRECTION :
	// Si le profil de l'utilisateur est incomplet
	if (!appState.has_complete_profile()) {
		info('User has incomplete profile');
		goto('/post-signup-forms');
		return;
	}

	// Check si l'utilisateur a au moins un appareil enregistré
	trace('Fetching user devices');
	let { data: appareil, error: appareilError } = await appState.db.select(
		"SELECT * FROM appareils WHERE role = 'raw_printer';"
	);

	if (appareilError) {
		console.log('appareil Error : ', appareilError);

		return (this.message = appareilError);
	}

	// REDIRECTION :
	// Si l'utilisateur n'a pas d'appareil enregistré
	if (appareil?.length === 0 && platform() !== 'ios' && platform() !== 'android') {
		info('User has no device on local db');
		goto('/post-signup-forms');
		return;
	}

	info('Everything is fine, redirecting to the dashboard');
	goto('/dashboard');
}

export async function onKineUpsert(formData) {
	console.log('Form data submitted:', formData, this.form);
	/**
	 * * On valide les données du formulaire et on crée le profil utilisateur.
	 ** Puis on le redirige vers la page de configuration de l'imprimante/scanner ou de tarifs/suppléments si nécessaire.
	 */
	if (!appState.db) {
		await appState.init({});
	}
	const filteredData = this.filtrerLesChampsAUpdater(formData);
	console.log('Filtered data for DB operation', filteredData);
	if (!isEmpty(filteredData)) {
		const { data: profileData, error: profileError } = await supabase
			.from('kinesitherapeutes')
			.upsert({ ...formData, id: appState.user.id });
		console.log('profileData, error and formData', profileData, formData);
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
		console.log('User existence check:', user);
		if (user && user.length > 0) {
			// Update the existing record
			const { error: updateError } = await appState.db.updateLocal(
				'kines',
				[['user_id', appState.user.id]],
				retrocompatibility
			);
			console.log('Update error', updateError);
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
			console.log('DB Response:', dbResponse, 'DB Error:', dbError);
		}
		//* Reset the user object in AppState otherwise the user data will be outdated
		await appState.init({
			user: { ...appState.user, ...retrocompatibility },
			session: appState.session
		});
		this.reset();
		console.log('now toasting');
		toast.trigger({
			title: 'Yes !',
			description: 'Données utilisateur modifiées avec succès.',
			type: 'success',
			timeout: 3000
		});
	}
}

export async function onPatientUpsert(data) {
	trace('In PatientForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Patient creation');
		// <!--* CREATE PROCEDURE -->
		let { data: response, error } = await appState.db.insert('patients', data);
		if (error) {
			return (this.message = error.message);
		}
		info('Patient Creation done Successfully');
	} else {
		trace('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		const { error } = await appState.db.update(
			'patients',
			[
				['user_id', appState.user.id],
				['patient_id', data.patient_id]
			],
			this.filtrerLesChampsAUpdater(data)
		);
		trace('Patient Updated');
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
	trace('In SPForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging SP creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await appState.db.insert('situations_pathologiques', data);
		if (error) {
			this.message = error;
			return;
		}
		info('SP Creation done Successfully');
	} else {
		trace('Engaging sp modification');
		// <!--* UPDATE PROCEDURE -->
		const updatedFields = this.filtrerLesChampsAUpdater(data);
		if (!isEmpty(updatedFields)) {
			const { error } = await appState.db.update(
				'situations_pathologiques',
				[['sp_id', data.sp_id]],
				updatedFields
			);
			if (error) {
				errorLog('Error while updating SP', error);
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
	trace('In PrescriptionForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Prescription creation');
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
		trace('Engaging Patient modification');
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
	trace('In SeanceForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Seance creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await appState.db.insert('seances', data);
		if (error) {
			return (this.message = error);
		}
		await invalidate('patient:layout');
		info('Seance Creation done Successfully');
	} else {
		trace('Engaging Seance modification');
		const updateFields = this.filtrerLesChampsAUpdater(data);
		const modificationDone = !isEmpty(updateFields);
		console.log('les updateFields', updateFields, 'isEmpty', isEmpty(updateFields));
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
	trace('In MultipleSeanceForm.onValid');

	// trace('in onValid with data' + JSON.stringify(data));
	console.log('onValid', data);
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
	trace('In AttestationSchema.onValid');

	if (this.mode === 'create') {
		trace('Engaging Attestation creation');
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
			errorLog('Error while preparing Supabase args for Attestation creation: ', error);
		}
		console.log('Supabase args for Attestation creation:', supabaseArgs);
		let { data: response, error: supabaseError } = await supabase.rpc(
			'create_attestation_rpc',
			supabaseArgs
		);
		console.log('Attestation creation response:', response, 'Error:', supabaseError);
		if (supabaseError || !response) {
			errorLog('Error while creating attestation: ', supabaseError);
			return (this.message = supabaseError.message);
		}
		//then we do it on the local db
		let { error: localError } = await createLocalAttestation(data);
		if (localError) {
			errorLog('Error while creating local attestation: ', localError);
			return (this.message = localError.message);
		}
		//then we do the side effects
		let { error: sideEffectsError } = await createAttestationSideEffects(data);
		if (sideEffectsError) {
			errorLog('Error while creating attestation side effects: ', sideEffectsError);
			return (this.message = sideEffectsError.message);
		}

		info('Attestation Creation done Successfully');
	} else {
		trace('Engaging Attestation modification');
		// <!--* UPDATE PROCEDURE -->
		// TODO
		info('Attestation modified done Successfully');
	}
	await invalidate('patient:layout');

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
	trace('In TarifsForm.onValid');
	/**
	 ** Ici trois cas de figures :
	 **		- ou bien le tarifs/suppléments existe déjà => update
	 **		- ou bien non => create
	 **		- ou bien y'a rien de changé => on fait rien
	 */

	for (const fieldKey of Object.keys(data)) {
		const field = data[fieldKey];
		const initialValue = this.initialValues[fieldKey];
		console.log('in loop with : ', fieldKey);

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

// --------------------------------------------
// UTILS FUNCTIONS
// --------------------------------------------

async function synchConventions(message) {
	const { error: conventionUpdateError } = await checkAndUpdateConventions(message, appState.db);
	if (conventionUpdateError) {
		errorLog('Error while updating conventions : ', conventionUpdateError);
		return (message = conventionUpdateError);
	}
}

async function fetchPatients(message, user) {
	trace('Populating local database with patients');
	message = 'Récupération des patients...';
	const { error: patientsError } = await appState.db.selectRemote(null, null, {
		table: 'patients',
		statement: '*',
		filters: { user_id: user.id }
	});
	if (patientsError) {
		errorLog('Error while populating local database with patients: ', patientsError);
		return (message = patientsError);
	}
	info('Local database successfully populated with patients');
}

async function createPrescription(data, file) {
	trace('in createPrescription');
	if (data.file_name) {
		delete data.file_name;
	}

	let file_name;
	if (file) {
		const fileExtension = file.name.split('.').pop();
		file_name = `${data.prescription_id}.${fileExtension}`;
		const filePath = prescriptionPath();
		data.prescripteur = JSON.stringify(data.prescripteur);
		let fsError = await save_to_disk(filePath, file_name, file);
		data.file_name = { ext: fileExtension };
		if (fsError) {
			return { data: prescription, error: fsError };
		}
	}
	delete data.file;

	if (Array.isArray(data.froms)) {
		data.file_name = { ext: 'avif', n_p: data.froms.length };
		const applocaldataDir = await get_precription_file_dir();
		console.log('the froms', data.froms);
		for (const from of data.froms) {
			console.log('the from', from);
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
	console.log('the data', data);

	const { data: prescription, error } = await appState.db.insert('prescriptions', data);
	if (error) {
		return { data: null, error };
	}
	return { data: prescription, error: null };
}

async function updatePrescription(data, file) {
	console.log('in updatePrescription with data', data, 'and file', file);
	// TODO 1 : Il faut enregistrer le filename en fait car il faut pouvoir supprimer l'ancienne prescription même si l'extension de fichier n'est pas le même.
	// TODO 2 Implement the saveFile with supabase API
	//* comme c'est update, il n'y a pas besoin de changer l'image si elle n'a pas été transformée
	if (file) {
		console.log('there is a file', file);

		const filePath = prescriptionPath();
		const fileExtension = file.name.split('.').pop();
		const fileName = `${data.prescription_id}.${fileExtension}`;

		if (data.file_name) {
			console.log(
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
			console.log('delError', delError);
			// if (delError) {
			// 	return { error: delError };
			// }
		}
		let fsError = await save_to_disk(filePath, fileName, file);

		if (fsError) {
			console.log('ERRor! ', fsError);
			return { data, error: fsError };
		}
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

		console.log('the froms', data.froms);

		for (const from of data.froms) {
			console.log('the from', from);
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
	console.log('the error', error);
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
		console.log(error);

		return { data: null, error };
	}
	const filePath = prescriptionPath();
	let file_name = prescriptionFileName(prescription, prescription.file_name);
	const completePath = `${filePath}/${file_name}`;
	if (file_name) {
		if (await file_exists(completePath)) {
			let fserror = await remove_file(completePath, { recursive: false });
			if (fserror) {
				console.log(fserror);

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
	console.log('the prescription', prescription);
	let path = prescriptionPath();
	// the prescription file name has a ?? call for retro compatibility.
	const fileName = `${prescription.prescription_id}.${prescription.file_name?.ext ?? prescription.file_name}`;
	const completePath = `${path}/${fileName}`;
	console.log('the complete path', completePath);

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
		console.log('File does not exist locally, trying to fetch from cloud');
		// --------------------------------------------
		// TRYING TO OPEN THE FILE FROM CLOUD STORAGE
		// --------------------------------------------
		try {
			let { data, error: downloadError } = await supabase.storage
				.from('users')
				.download(
					`${appState.user.id}/prescriptions/${prescription.prescription_id}.${prescription.file_name.ext}`
				);
			if (downloadError) {
				console.error('Error downloading file from cloud:', downloadError);
				return { error: downloadError };
			}
			// --------------------------------------------
			// SAVING THE FILE LOCALLY
			// --------------------------------------------
			console.log('File downloaded successfully from cloud:', data);
			try {
				let response = await save_local_file(path, fileName, data);
				console.log('File saved locally:', response);
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
		console.log('ext is a string', ext);
		if (typeof ext === 'string') {
			try {
				console.log('Parsing ext as JSON', ext);
				const prescriptionName = `${prescription.prescription_id}.${JSON.parse(ext).ext}`;
				console.log('Parsed prescription name:', prescriptionName);
				return prescriptionName;
			} catch (error) {
				console.error('Error parsing ext:', error);
			}
			return `${prescription.prescription_id}.${ext}`;
		}
	} else {
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
	console.log('createAttestation', data);
	let { data: attestation, error: attestationError } = await appState.db.insertLocal(
		'attestations',
		data.attestation
	);

	console.log('attestation', attestation);
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
		console.log('prescription', prescription);
		if (prescriptionError) {
			return { error: prescriptionError };
		}
	}

	// Mise à jour des séances
	let seanceCodeMap = data.seances.reduce((seanceMap, s) => {
		console.log('seanceMap', seanceMap);
		console.log('s', s);
		if (!seanceMap[s.code_id]) seanceMap[s.code_id] = [];
		seanceMap[s.code_id].push(s.seance_id);
		return seanceMap;
	}, {});
	console.log('seanceCodeMap', seanceCodeMap);
	let caseStatements = Object.entries(seanceCodeMap)
		.map(([code, seanceIds]) => `WHEN seance_id IN ('${seanceIds.join("', '")}') THEN '${code}'`)
		.join('\n');

	console.log('caseStatements', caseStatements);

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

	console.log(sqlQuery);
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
		console.log('metadataUpdateStatus', metadataUpdateStatus);
	}
	if (seancesError) {
		return { error: seancesError };
	}
	console.log('seances', seances);

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
		console.log('factureAttestation', factureAttestation);
		if (factureAttestationError) {
			return { error: factureAttestationError };
		}
		console.log('facturePatient', facturePatient);
	}
	if (data.generateFactureMutuelle) {
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
		console.log('factureMutuelle', factureMutuelle);
	}
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
		console.log('numeroQueryResult', numero);

		if (storeError) {
			return { error: storeError };
		}
	}
	if (data.printFacturePatient) {
		// TODO : implement PDF printing
		const { facture: facturePatient, error: facturePatientError } =
			await getFacturePatientPDFHandler(data.facturePatient);
		if (facturePatientError) {
			return { error: facturePatientError };
		}
		// TODO Mettre la fonction print lorsque l'API sera prête
		facturePatient.open();
		// facturePatient.print();
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
}
