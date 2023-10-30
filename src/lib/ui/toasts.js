export function errorToast(message, action, actionLabel, persistent) {
	let toast = {
		message: message,
		background: 'variant-ghost-error'
	};
	if (persistent) {
		toast.autohide = false;
	}
	if (action === 'none') {
		return toast;
	}
	if (actionLabel) {
		toast.action = {
			label: actionLabel,
			response: action
		};
		return toast;
	}
	toast.action = {
		label: 'Moniteur',
		response: () => {
			console.log('Whatever it takes to get to the monitor');
		}
	};
	return toast;
}
