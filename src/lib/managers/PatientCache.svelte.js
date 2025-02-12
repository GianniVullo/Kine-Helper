import { goto } from '$app/navigation';
import { Patient, SituationPathologique } from '../user-ops-handlers/models';

class PatientCache {
	currentPatient = $state();
	currentSp = $state();

	set patient(patient) {
		sessionStorage.setItem('currentPatient', JSON.stringify(patient));
		this.currentPatient = patient;
	}

	get patient() {
		if (this.currentPatient) {
			return this.currentPatient;
		}
		const patient = sessionStorage.getItem('currentPatient');
		if (patient) {
			return new Patient(patient);
		} else {
			goto('/dashboard/patients');
		}
	}

	set sp(sp) {
		sessionStorage.setItem('currentSP', JSON.stringify(sp));
		this.currentSp = sp;
	}

	get sp() {
		if (this.currentPatient) {
			return this.currentPatient;
		}
		const sp = sessionStorage.getItem('currentSP');
		if (sp) {
			return new SituationPathologique(sp);
		} else {
			if (this.patient) {
				goto('/dashboard/patients/' + this.patient.patient_id);
			} else {
				goto('/dashboard/patients');
			}
		}
	}
}

export const patientState = new PatientCache();
