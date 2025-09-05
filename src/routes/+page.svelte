<script>
	import LoginForm from '../lib/components/forms/LoginForm.svelte';
	import { t } from '$lib/i18n';
	import { open } from '@tauri-apps/plugin-shell';
	import { onDestroy } from 'svelte';
	import { platform } from '@tauri-apps/plugin-os';
	import { goto } from '$app/navigation';
	import logoUrl from '$lib/assets/logo head.png';
	// import { scan, checkPermissions, requestPermissions } from '@tauri-apps/plugin-barcode-scanner';
	import { terminal } from 'virtual:terminal';
	// import RichTextEditor from '../lib/cloud/libraries/rich-text-editor/RichTextEditor.svelte';
	// import TemplateCreatorModal from '../lib/cloud/libraries/rich-text-editor/TemplateCreatorModal.svelte';
	// `windowed: true` actually sets the webview to transparent
	// instead of opening a separate view for the camera
	// make sure your user interface is ready to show what is underneath with a transparent element

	function registerShortcut(callback) {
		window.addEventListener('keydown', function (event) {
			const isMac = platform() === 'macos';

			if ((isMac ? event.metaKey : event.ctrlKey) && event.shiftKey && event.key === 'C') {
				console.log(isMac);
				event.preventDefault();
				callback();
			}
		});
	}

	const shortcutHandler = registerShortcut(() => {
		goto('test');
	});

	onDestroy(() => {
		window.removeEventListener('keydown', shortcutHandler);
	});

	let message = '';
</script>

<!-- <RichTextEditor /> -->
<!-- <TemplateCreatorModal /> -->
<!-- <button
	onclick={async () => {
		terminal.log('Button clicked');
		let permissions = await checkPermissions();
		terminal.log('Permissions:', permissions);
		if (permissions !== 'granted') {
			permissions = await requestPermissions();
			terminal.log('Requested Permissions:', permissions);
			if (permissions.camera !== 'granted') {
				message = 'no grant';
				return;
			}
		}
		terminal.log('Scanning...');
		scan({ windowed: false, formats: [''] });
	}}>TEST</button> -->
<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<div class="flex flex-col items-center justify-center">
			<img src={logoUrl} alt="Your Company" class="mx-auto h-40 w-auto" />
		</div>
		<h2 class="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
			{$t('login', 'title', {}, 'Sign in to your account')}
		</h2>
	</div>

	<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
		<LoginForm {message} />
		<!--? We remove the ability to sign up in the app and we will only allow it on the web. this is to enforce the appStore policies and avoid issues with the app store review process. -->
		<button
			onclick={async () => {
				await open('https://kine-helper.be/reset-password');
			}}
			class="mt-10 w-full text-center text-sm/6 text-gray-500">
			{$t('login', 'controls.forgot')}</button>
	</div>
</div>
