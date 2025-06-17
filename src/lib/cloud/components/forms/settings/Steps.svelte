<script module>
	import PostSignupForm from '../../../../forms/authentication/PostSignupForm.svelte';
    import TarifsForm from "../finances/TarifsForm.svelte";
	import PrinterSetupForm from './PrinterSetupForm.svelte';

	export { UserDataForm, PeriphericForm, TarifsFormStep };
</script>

{#snippet UserDataForm(data)}
	<PostSignupForm bind:formHandler={data.formHandler} {...data} />
{/snippet}

{#snippet PeriphericForm(data)}
	<PrinterSetupForm bind:formHandler={data.formHandler} {...data} />
{/snippet}

{#snippet TarifsFormStep(data)}
	<TarifsForm form_id="tarifs-form" {...data} />
{/snippet}
