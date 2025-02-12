<script>
	import { invoke } from '@tauri-apps/api/core';
	import { user } from '../../../lib';
	import { get } from 'svelte/store';
	import { generateEncryptionKeys } from '../../../lib/stores/strongHold';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';
	import { t } from '../../../lib/i18n';
	import { getModalStore } from '@skeletonlabs/skeleton';
	const modalStore = getModalStore();
	import { goto } from '$app/navigation';

	/**
	 * TODO Il faut faire ça autrement pour checker... genre faire une fonction qui vérifie qu'il y a bien une stronghold key */
	// 2 façons de faire :
	//	- Ou bien il s'agit d'jà d'une deuxième machine et donc l'utilisateur doit simplement réencoder sa clé
	const generatingKey = new Promise(async (resolve) => {
		// the function generateEncryptionKeys does everything security needs
		let key;
		if (!key) {
			key = await invoke('get_main_key', { userId: get(user).user.id });
		}
		resolve(key);
	});

	// Ici il faut s'arranger pour setup la sécurité puis vérifier si le profil est rempli puis l'imprimante a besoin d'être setup. Si oui rediriger vers l'imprimante sinon on peut aller au dashboard directement
	async function checkForData() {
		console.log($user);
		
		if (!$user.profil.inami) {
			goto('/post-signup-forms/kine-profile')
		}
		if (!$user.settings?.raw_printer) {
			goto('/post-signup-forms/printer-setup');
			return;
		} else {
			goto('/dashboard');
			return;
		}
	}
	let copierLabel = $t('encryption', 'copy', null, 'Copy');
</script>

<main class="flex flex-col items-start justify-start p-10">
	<h1 class="mb-2 text-2xl font-medium text-surface-900">
		{$t('encryption', 'title', null, 'Defining an encryption key')}
	</h1>
	<p class="text-surface-700 dark:text-surface-200">
		{@html $t(
			'encryption',
			'description',
			null,
			'Here you will find an encryption key to hash all your data so no one but you can actually read it. Please copy it, print it and save it really carefully.'
		)}
	</p>

	{#await generatingKey}
		pending
	{:then key}
		{#if key}
			<div class="card my-5 rounded-md bg-white px-8 py-10">
				{key}
			</div>
			<div class="flex w-96 justify-between">
				<div class="flex space-x-2">
					<button
						id="copy-btn"
						class="variant-filled-secondary btn"
						on:click={async () => {
							await writeText(key);
							const copyBtn = document.getElementById('copy-btn');
							copyBtn.innerText = $t('encryption', 'copied', null, 'Copied!');
							copyBtn.classList.remove('variant-filled-secondary');
							copyBtn.classList.add('variant-filled-success');
							setTimeout(() => {
								copyBtn.classList.remove('variant-filled-success');
								copyBtn.classList.add('variant-filled-secondary');
								copyBtn.innerText = $t('encryption', 'copy', null, 'Copy');
							}, 2000);
						}}>{copierLabel}</button>
				</div>
				<button
					class="variant-filled-error btn"
					on:click={() => {
						modalStore.trigger({
							type: 'confirm',
							title: 'Confirmation required',
							body: 'Your key really is important. Are you sure it is safe?',
							response: (r) => {
								checkForData();
							}
						});
					}}>Suivant</button>
			</div>
		{:else}
			<input type="text" class="input" name="encryptionKey" />
		{/if}
	{:catch error}
		{error}
	{/await}
</main>
