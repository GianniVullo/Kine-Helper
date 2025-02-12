import * as v from 'valibot';
import { t } from '../../../../i18n';
import { get } from 'svelte/store';
import { lock, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';
import { getModalStore } from '@skeletonlabs/skeleton';

const email = v.pipe(
	v.transform((input) =>
		input?.length === 0 ? null : typeof input === 'string' ? input.toLowerCase() : input
	),
	v.pipe(v.string('Ce champ est obligatoire'), v.email('Email invalide'))
);

const password = v.pipe(
	v.transform((input) => (input?.length == 0 ? null : input)),
	v.pipe(
		v.string('Ce champ est obligatoire'),
		v.minLength(1, 'Please enter your password.'),
		v.regex(
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
			'You password must have 8 characters or more. Contains at least 1 upper case letter, one number and one special caracter'
		)
	)
);

const password2 = v.pipe(
	v.transform((input) => (input?.length == 0 ? null : input)),
	v.string('Ce champ est obligatoire')
);

export const validateurs = {
	email,
	password,
	password2
};

export const SignupSchema = v.pipe(
	v.object({
		email,
		password,
		password2
	}),
	v.forward(
		v.partialCheck(
			[['password1'], ['password2']],
			(input) => input.password === input.password2,
			'The two passwords do not match.'
		),
		['password2']
	)
);

export async function onValid(data) {
	await createUser(data);
	const modalStore = getModalStore();
	modalStore.trigger({
		body: get(t)('signup', 'emailConfirmation', { email: data.email })
	});
}

export const fieldSchema = [
	{
		id: 'email',
		name: 'email',
		inputType: 'text',
		leading: userIcon,
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
		leading: lock,
		leadingCSS: 'size-6 stroke-purple-500 stroke-2',
		inputType: 'password',
		titre: 'Mot de passe',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},
	{
		id: 'password2',
		name: 'password2',
		leading: lock,
		leadingCSS: 'size-6 stroke-purple-500 stroke-2',
		inputType: 'password',
		titre: 'Confirmation du mot de passe',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	}
];
