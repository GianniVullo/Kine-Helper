<script>
    // Pour choisir une prescription
    import {SelectFieldV2} from '../../index'
	import { page } from '$app/stores';
	import { patients } from '../../../stores/PatientStore';
    import { t } from '../../../i18n';

    export let value = null;
    const patient = $patients.find((p) => p.patient_id === $page.params.patientId);

    let sp = patient.situations_pathologiques.find((sp) => sp.sp_id == $page.params.spId);
    let options = sp.prescriptions.map((prescription) => {
        let prescripteur = prescription.prescripteur;
        return {
            value: prescription.prescription_id,
            label: `${prescripteur.nom} ${prescripteur.prenom} - ${prescription.date} - (${prescription.nombre_seance} ${$t('patients.detail', 'prestations')}, ${prescription.seance_par_semaine}x/${$t('shared', 'week')})`
        }
    })
</script>

<!--* Super simple : un select field avec les prescriptions disponibles sur la situation pathologique -->

<SelectFieldV2 name="prescriptionId" required bind:value={value} {options} />