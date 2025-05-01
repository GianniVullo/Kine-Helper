import { page } from '$app/state';
import { pushState, replaceState } from '$app/navigation';
/**
 *
 * @param {{name: string}} drawer
 */
export function openDrawer(drawer) {
	if (page.state.drawer) {
		replaceState('', { ...page.state, drawer });
	} else {
		pushState('', { ...page.state, drawer });
	}
}

