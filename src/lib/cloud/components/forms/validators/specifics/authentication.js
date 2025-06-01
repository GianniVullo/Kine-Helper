import { minLength, partialCheck, regex } from 'valibot';

export const passwordValidator = regex(
	/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
	'Your password must have 8 characters or more. Contains at least 1 upper case letter, one number and one special caracter'
);

export const minLengthPassword = minLength(1, 'Please enter your password.');

export const partialCheckPasswordComparison = partialCheck(
	[['password1'], ['password2']],
	(input) => input.password === input.password2,
	'The two passwords do not match.'
);
