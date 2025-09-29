<script>
	import LoginForm from '../lib/components/forms/LoginForm.svelte';
	import { t } from '$lib/i18n';
	import { open } from '@tauri-apps/plugin-shell';
	import { onDestroy } from 'svelte';
	import { platform } from '@tauri-apps/plugin-os';
	import { goto } from '$app/navigation';
	import logoUrl from '$lib/assets/logo head.avif';
	import { invoke } from '@tauri-apps/api/core';
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

<div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-sm">
		<div class="flex flex-col items-center justify-center">
			<img src={logoUrl} alt="Your Company" class="mx-auto h-40 w-auto" />
		</div>
		<LoginForm {message} />
		<button
			onclick={async () => {
				await open('https://kine-helper.be/reset-password');
			}}
			class="text-gray-600">
			{$t('login', 'controls.forgot')}</button>
	</div>
</div>
