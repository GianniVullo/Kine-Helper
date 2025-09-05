import { getTarifs } from '../../../../lib/components/forms/utils/tarifHelpers';

/** @type {import('./$types').PageLoad} */
export async function load() {
	return await getTarifs();
}
