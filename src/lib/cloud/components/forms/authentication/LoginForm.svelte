<script>
	import { onMount } from 'svelte';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import Field from '../abstract-components/Field.svelte';
	import { LoginSchema, onValid, fieldSchema, validateurs } from './LoginSchema';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';

	let formHandler = new Formulaire({
		validateurs,
		schema: LoginSchema,
		initialValues: { email: localStorage.getItem('lastLoggedUser') },
		onValid
	});

	onMount(() => {
		formHandler.setup(onValid);
	});
</script>

<form action="" id="default-form" class="space-y-4">
	{#each fieldSchema as field}
		<Field {field} error={formHandler.errors[field.name]} bind:value={formHandler.form[field.name]} />
	{/each}
	<div class="items flex w-full justify-center mt-4">
		<SubmitButton />
	</div>
</form>


<p class="mt-2 text-lg text-purple-800">{formHandler.message}</p>
