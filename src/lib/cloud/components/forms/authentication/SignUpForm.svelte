<script>
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { t } from '../../../../i18n';
	import Field from '../abstract-components/Field.svelte';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { SignupSchema, onValid, fieldSchema, validateurs } from './SignupSchema';
	import { onMount } from 'svelte';

	let formHandler = new Formulaire({
		validateurs,
		schema: SignupSchema,
		onValid
	});

	onMount(() => {
		formHandler.setup();
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
		<SubmitButton />
	</div>
</form>
