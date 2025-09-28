<script>
	import { Formulaire } from '$lib/cloud/libraries/formHandler.svelte';
	import { Field, SubmitButton } from './blocks/index';
	import { onLogin } from './onSubmits.svelte';
	import { object } from 'valibot';

	import { pipe, transform } from 'valibot';
	import { emailVal, stringVal } from './validators/baseValidators';

	const email = pipe(
		transform((input) =>
			input?.length === 0 ? null : typeof input === 'string' ? input.toLowerCase() : input
		),
		stringVal(),
		emailVal()
	);
	const password = pipe(
		transform((input) => (input?.length === 0 ? null : input)),
		stringVal()
	);

	const validateurs = {
		email,
		password
	};

	let formHandler = new Formulaire({
		validateurs,
		schema: object(validateurs),
		initialValues: { email: localStorage.getItem('lastLoggedUser') },
		onValid: onLogin
	});

	const fieldSchema = [
		{
			id: 'email',
			name: 'email',
			inputType: 'text',
			// leading: userIcon,
			leadingCSS: 'size-6 stroke-purple-500 stroke-2',
			placeholder: 'email',
			titre: 'Email',
			help: null,
			outerCSS: 'sm:col-span-full',
			innerCSS: ''
		},
		{
			id: 'password',
			name: 'password',
			// leading: lock,
			leadingCSS: 'size-6 stroke-purple-500 stroke-2',
			inputType: 'password',
			titre: 'Password',
			outerCSS: 'sm:col-span-full',
			innerCSS: ''
		}
	];
</script>

<form action="" id="default-form" class="space-y-6">
	{#each fieldSchema as field}
		<Field
			{field}
			error={formHandler.errors[field.name]}
			bind:value={formHandler.form[field.name]} />
	{/each}
	<div class="items mt-4 flex w-full justify-center">
		<SubmitButton
			className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			loading={formHandler.loading}>Se connecter</SubmitButton>
	</div>
</form>

<p class="mt-2 text-lg text-purple-800">{formHandler.message}</p>
