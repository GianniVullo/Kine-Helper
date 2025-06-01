import { pipe, transform, object, forward } from 'valibot';
import { t } from '../../../../i18n';
import { get } from 'svelte/store';
import { lock, mailIcon, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';
import { createUser } from '$lib/user-ops-handlers/users';
import { toast } from '$lib/cloud/libraries/overlays/notificationUtilities.svelte';
import { stringVal, emailVal } from '../validators/commons';
import {
	minLengthPassword,
	partialCheckPasswordComparison,
	passwordValidator
} from '../validators/specifics/authentication';
export function buildSignupSchema() {
	const email = pipe(
		transform((input) =>
			input?.length === 0 ? null : typeof input === 'string' ? input.toLowerCase() : input
		),
		pipe(stringVal, emailVal)
	);

	const password = pipe(
		transform((input) => (input?.length == 0 ? null : input)),
		pipe(stringVal, minLengthPassword, passwordValidator)
	);

	const password2 = pipe(
		transform((input) => (input?.length == 0 ? null : input)),
		stringVal
	);
	const validateurs = {
		email,
		password,
		password2
	};

	const SignupSchema = pipe(
		object({
			email,
			password,
			password2
		}),
		forward(partialCheckPasswordComparison, ['password2'])
	);
	return { SignupSchema, validateurs };
}

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
