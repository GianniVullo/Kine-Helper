<script>
	import { safeParse } from 'valibot';
	import { onMount } from 'svelte';
	import { extractErrorForField, Formulaire } from '../../../libraries/formHandler.svelte';
	import Field from '../abstract-components/Field.svelte';
	import { LoginSchema, onValid, fieldSchema } from './LoginSchema';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';

	let formHandler = new Formulaire({
		schema: LoginSchema,
		initialValues: { email: localStorage.getItem('lastLoggedUser'), password: null },
		onValid
	});

	let validationState = $derived(safeParse(LoginSchema, formHandler.form));

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

<div class="flex w-full items justify-center">
	<SubmitButton />
</div>