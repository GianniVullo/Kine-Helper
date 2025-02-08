<script>
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { t } from '../../../../i18n';
	import Field from '../abstract-components/Field.svelte';
	import { safeParse } from 'valibot';
	import { extractErrorForField, Formulaire } from '../../../libraries/formHandler.svelte';
	import { SignupSchema, onValid, fieldSchema } from './SignupSchema';
	import { onMount } from 'svelte';

	let formHandler = new Formulaire({
		schema: SignupSchema,
		onValid
	});

	let validationState = $derived(safeParse(SignupSchema, formHandler.form));

	console.log(validationState);

	onMount(() => {
		formHandler.setup(onValid);
	});
</script>

{#each fieldSchema as field}
	<Field
		{field}
		error={extractErrorForField(field.name, validationState).errorString}
		bind:value={formHandler.form[field.name]} />
{/each}

<div class="items flex w-full justify-center">
	<SubmitButton />
</div>
