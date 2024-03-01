<script>
	import { DefaultFieldWrapper } from '../index';
	import { open } from '@tauri-apps/plugin-shell';
	import { open as dialogOpen } from '@tauri-apps/plugin-dialog';
	import { user } from '../../stores/UserStore';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { listen } from '@tauri-apps/api/event';
	import { appLocalDataDir, resolve } from '@tauri-apps/api/path';
	import { invoke } from '@tauri-apps/api/core';
	import { readFile } from '@tauri-apps/plugin-fs';
	import { patients } from '../../stores/PatientStore';

	// Lets the user open the file ine the adequate software
	export let withOpener = false;
	export let label = 'Fichier';
	let hoveredByFile = false;
	let loading = false;
	export let filePath = null;
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let buffer;
	let fileResponse;

	async function extractFilePath() {
		return new Promise(async (resolve, reject) => {
			console.log(filePath)
			if (filePath) {
				let dirPath = await appLocalDataDir();
				let path = `${dirPath}${filePath}`;
				if (await invoke('file_exists', { path })) {
					resolve(path);
				}
				reject(`Le fichier ${path} ne semble pas exister`);
			}
			resolve(null);
		});
	}
	let extractedFilePath = extractFilePath();
	async function handleDialog() {
		loading = true;
		let dirPath = await appLocalDataDir();
		console.log('in handleDialog', dirPath);
		fileResponse = await dialogOpen({
			multiple: false,
			filters: [
				{
					name: 'Images',
					extensions: ['jpg', 'jpeg', 'png']
				},
				{ name: 'PDF', extensions: ['pdf'] }
			]
		});
		console.log('the file response', fileResponse);
		if (!fileResponse) {
			loading = false;
			return;
		}
		buffer = await readFile(fileResponse.path);
		loading = false;
	}

	export function getBufferAndResponse() {
		return { fileResponse, buffer };
	}
</script>

<div>
	<h5 class="select-none text-surface-500 dark:text-surface-300" class:font-bold={hoveredByFile}>
		{label}
	</h5>
	{#await extractedFilePath}
		Chargement...
	{:then value}
		<div class="flex flex-col items-start justify-start space-y-2 py-2">
			{#if fileResponse}
				<p>{fileResponse.name}</p>
			{:else if value}
				<p>{value}</p>
			{/if}
			{#if !loading}
				<button class="variant-filled btn btn-sm" on:click={handleDialog}>
					{fileResponse ? 'choisir un autre fichier' : 'Choisir un fichier'}
				</button>
			{:else}
				<p>Ouverture...</p>
			{/if}
		</div>
		{#if withOpener && filePath}
			<button
				on:click={async () => {
					loading = true;
					await open(filePath);
					loading = false;
				}}
				class="variant-outline-primary btn"
				disabled={loading}>Ouvrir l'aperçu</button>
		{/if}
	{:catch error}
		<p>{error}</p>
		<div class="flex flex-col items-start justify-start space-y-2 py-2">
			{#if fileResponse}
				<p>{fileResponse.name}</p>
			{/if}
			{#if !loading}
				<button class="variant-filled btn btn-sm" on:click={handleDialog}>
					{fileResponse ? 'choisir un autre fichier' : 'Choisir un fichier'}
				</button>
			{:else}
				<p>Ouverture...</p>
			{/if}
		</div>

	{/await}
</div>
