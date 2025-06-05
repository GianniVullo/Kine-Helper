export function registerShortcut(callback) {
    console.log('registering shortcut');
	window.addEventListener('keydown', callback);
	return () => window.removeEventListener('keydown', callback);
}
