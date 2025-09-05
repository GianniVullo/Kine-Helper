<script module>
    // import TarifsForm from "../finances/TarifsForm.svelte";
	import KineForm from '../KineForm.svelte';
	import PrinterSetupForm from '../PrinterSetupForm.svelte';

	export { UserDataForm, PeriphericForm };
</script>

{#snippet UserDataForm(data)}
	<KineForm bind:formHandler={data.formHandler} {...data} />
{/snippet}

{#snippet PeriphericForm(data)}
	<PrinterSetupForm bind:formHandler={data.formHandler} {...data} />
{/snippet}

<!-- {#snippet TarifsFormStep(data)}
	<TarifsForm form_id="tarifs-form" {...data} />
{/snippet} -->
