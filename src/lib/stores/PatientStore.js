import { writable } from 'svelte/store';
import { selectPatients } from './supabaseClient';
import { persisted } from 'svelte-persisted-store';

function createPatientStore() {
	console.log('Initialized $patients with ');
	const { subscribe, update, set } = persisted('patients', [], {
		storage: 'session' // 'session' for sessionStorage, defaults to 'local'
	});

	const loading = writable(false);

	async function fetchPatient(modifiedUser) {
		console.log('In fetchPatients from $patients');
		loading.set(true);
		const { data, error } = await selectPatients(modifiedUser);
		if (error) throw error;
		console.log('Les patients queried', data);
		data.sort((a, b) => {
			if (a.nom > b.nom) {
				return 1;
			} else {
				return -1;
			}
		});
		loading.set(false);
		set(data);
	}

	function sortPatient() {
		update((patients) => {
			patients.sort((a, b) => {
				if (a.nom > b.nom) {
					return 1;
				} else {
					return -1;
				}
			});
			return patients;
		});
	}

	function remove(patient_id) {
		console.log('in patients.remove(id) with', patient_id);
		update((ps) => {
			console.log('in patients.remove(id)>update with ps length BEFORE', ps.length);
			ps.splice(
				ps.findIndex((p) => p.patient_id == patient_id),
				1
				);
				console.log('in patients.remove(id)>update with ps length AFTER', ps.length);
			return ps;
		});
	}
	async function insertPatient(data) {
		console.log('in insertPatient() with', data);
		loading.set(true);
		let newPatient = await supabase.from('patients').insert(data).select();
		if (newPatient.error) return;
		console.log('Response from Supabase client', newPatient);
		update((n) => n.push(newPatient.data[0]));
		patients.value.push(newPatient.data[0]);
		loading.set(false);
		return newPatient.data[0];
	}

	return {
		subscribe,
		update,
		set,
		loading,
		sortPatient,
		fetchPatient,
		remove
	};
}

export const patients = createPatientStore();
