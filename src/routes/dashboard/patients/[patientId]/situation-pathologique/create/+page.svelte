<script>
	import SPForm from '../../../../../../lib/cloud/components/forms/situation-pathologique/SPForm.svelte';

	import { t } from '../../../../../../lib/i18n';

	let { data } = $props();
	const { patient, tarifs, supplements } = data;
</script>

<SPForm {patient} {tarifs} {supplements} />
