import { page } from '$app/state';
import { pushState, replaceState } from '$app/navigation';
/**
 *
 * @param {{name: string}} modal
 */
export function openModal(modal) {
	if (page.state.modal) {
		replaceState('', { ...page.state, modal });
	} else {
		pushState('', { ...page.state, modal });
	}
}

export const modalStore = null;
