<script>
	import { PasswordResetForm } from '../lib/index';
	import LoginForm from '../lib/cloud/components/forms/authentication/LoginForm.svelte';
	import SignUpForm from '../lib/cloud/components/forms/authentication/SignUpForm.svelte';
	import { t } from '../lib/i18n';
	// import { goto } from '$app/navigation';
	// import { onDestroy } from 'svelte';
	// import { platform } from '@tauri-apps/plugin-os';
	import { open } from '@tauri-apps/plugin-shell';

	// function registerShortcut(callback) {
	// 	window.addEventListener('keydown', function (event) {
	// 		const isMac = platform() === 'macos';

	// 		if ((isMac ? event.metaKey : event.ctrlKey) && event.shiftKey && event.key === 'C') {
	// 			console.log(isMac);
	// 			event.preventDefault();
	// 			callback();
	// 		}
	// 	});
	// }

	// const shortcutHandler = registerShortcut(() => {
	// 	goto('debug');
	// });

	// onDestroy(() => {
	// 	window.removeEventListener('keydown', shortcutHandler);
	// });

	let selectedForm = 'login';
	let message = '';
</script>

<!-- <AvailableScanners /> -->
<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-500">
	<!--? CENTERED CARD -->
	<div
		class="relative w-[350px] space-y-2 overflow-hidden bg-white px-6 py-4 dark:border dark:border-gray-400">
		<div
			class="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-purple-600 opacity-25 dark:opacity-50">
		</div>
		<div
			class="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-sky-600 opacity-25 dark:opacity-60">
		</div>
		<div class="card-header">
			<h2 class="mb-2 text-center text-2xl font-bold text-purple-600 dark:text-purple-400">
				Kiné Helper
			</h2>
			<p class=" text-center text-sm text-gray-600">
				<!-- {$t('login', 'subtitle')} -->
				Open Source et au service des kinésithérapeutes
			</p>
		</div>
		{#if selectedForm == 'login'}
			<LoginForm {message} />
		{:else if selectedForm == 'signup'}
			<SignUpForm />
		{:else}
			<PasswordResetForm />
		{/if}
		<div class="card-footer mt-4 flex flex-col items-center justify-center space-y-2">
			{#if selectedForm == 'login'}
				<button onclick={() => (selectedForm = 'signup')} class="group text-gray-600"
					>{$t('login', 'controls.register.question')}
					<span class="border-purple-500 text-base duration-200 group-hover:border-b"
						>{$t('login', 'controls.register.link')}</span
					></button>
			{:else}
				<button onclick={() => (selectedForm = 'login')} class="group text-gray-600"
					>{@html selectedForm == 'passwordReset'
						? $t('login', 'controls.resetCancel')
						: $t('login', 'controls.SignupCancel')}<span
						class="border-purple-500 text-base duration-200 group-hover:border-b"
						>{$t('login', 'controls.submit')}</span
					></button>
			{/if}
			{#if selectedForm !== 'passwordReset'}
				<button
					onclick={async () => {
						await open('https://kine-helper.be/reset-password');
					}}
					class="text-gray-600">
					{$t('login', 'controls.forgot')}</button>
			{/if}
		</div>
	</div>
</div>
