import { derived, get } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

export const locale = persisted('locale', null);
export const dictionnary = persisted('dictionnary', {});

function translate(locale, page, message, vars, fallback) {
	// Let's throw some errors if we're trying to use keys/locales that don't exist.
	// We could improve this by using Typescript and/or fallback values.
	// console.log(get(dictionnary));
	try {
		if (!page) throw new Error('no key provided to $t()');
		if (!locale) return fallback;

		// Grab the translation from the translations object.
		let text = get(dictionnary)[locale][page][message];
		// console.log(text, fallback);
		if (!text) return fallback;

		// Replace any passed in variables in the translation string.
		if (vars) {
			Object.keys(vars).map((k) => {
				const regex = new RegExp(`{{${k}}}`, 'g');
				text = text.replace(regex, vars[k]);
			});
		}

		return text;
	} catch (error) {
		console.error(error, locale, page, message);
		return fallback ?? 'No translation provided';
	}
}

export const t = derived(
	locale,
	($locale) =>
		(page, message, vars = {}, fallback) =>
			translate($locale, page, message, vars, fallback)
);
