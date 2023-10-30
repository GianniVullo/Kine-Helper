export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11')
];

export const server_loads = [];

export const dictionary = {
		"/": [4],
		"/dashboard": [5,[2]],
		"/dashboard/agenda": [6,[2]],
		"/dashboard/medical-files": [7,[2]],
		"/dashboard/medical-files/patients/[patientId]": [8,[2]],
		"/dashboard/settings": [9,[2,3]],
		"/dashboard/tarification": [10,[2]],
		"/post-signup-form": [11]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';