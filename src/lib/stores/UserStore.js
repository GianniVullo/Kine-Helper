import { persisted } from 'svelte-persisted-store';

export const user = persisted(
	'user',
	{},
	{
		storage: 'session'
	}
);
