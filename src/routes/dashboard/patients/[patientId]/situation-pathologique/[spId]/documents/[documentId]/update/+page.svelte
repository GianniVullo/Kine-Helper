<script>
    import { patients } from "../../../../../../../../../lib/stores/PatientStore";
    import {page} from '$app/stores';
	import AnnexeAForm from "../../../../../../../../../lib/forms/documents/AnnexeAForm.svelte";
	import AnnexeBForm from "../../../../../../../../../lib/forms/documents/AnnexeBForm.svelte";

    const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
    const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
    const doc = sp.documents.find((doc) => doc.document_id === $page.params.documentId);
</script>

{#if doc.docType === 0}
	<AnnexeAForm {patient} {sp} {doc} />
{/if}
{#if doc.docType === 1}
	 <AnnexeBForm {patient} {sp} {doc} />
{/if}