import * as v from 'valibot';
import { t } from '../../../../i18n';
import { get } from 'svelte/store';
import { lock, mailIcon, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';
import { getModalStore } from '@skeletonlabs/skeleton';
import { createUser } from '$lib/user-ops-handlers/users';
import { toast } from '$lib/cloud/libraries/overlays/notificationUtilities.svelte';

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
			'Your password must have 8 characters or more. Contains at least 1 upper case letter, one number and one special caracter'
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
	const message = get(t)('signup', 'emailConfirmation', { email: data.email });
	const title = message.split(' <br /><h5 class')[0];
	const description = '<br /><h5 class' + message.split(' <br /><h5 class')[1];

	toast.trigger({
		leading: mailIcon,
		leadingCSS: 'size-6 stroke-green-400',
		title,
		description
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
