<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import Field from '../abstract-components/Field.svelte';
	import { onValid, fieldSchema, buildLoginSchema } from './LoginSchema';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';

	let { LoginSchema, validateurs } = buildLoginSchema();

	let formHandler = new Formulaire({
		validateurs,
		schema: LoginSchema,
		initialValues: { email: localStorage.getItem('lastLoggedUser') },
		onValid
	});
</script>

<form action="" id="default-form" class="space-y-4">
	{#each fieldSchema as field}
		<Field
			{field}
			error={formHandler.errors[field.name]}
			bind:value={formHandler.form[field.name]} />
	{/each}
	<div class="items mt-4 flex w-full justify-center">
		<SubmitButton loading={formHandler.loading}>Se connecter</SubmitButton>
	</div>
</form>

<p class="mt-2 text-lg text-purple-800">{formHandler.message}</p>
