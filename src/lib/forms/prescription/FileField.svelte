<script>
	import { DefaultFieldWrapper } from '../index';
	import { open } from '@tauri-apps/plugin-shell';
	import { open as dialogOpen } from '@tauri-apps/plugin-dialog';
	import { user } from '../../stores/UserStore';
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { listen } from '@tauri-apps/api/event';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { invoke } from '@tauri-apps/api/core';
	import { readFile } from '@tauri-apps/plugin-fs';
	import {patients} from '../../stores/PatientStore';

	// Lets the user open the file ine the adequate software
	export let withOpener = false;
	export let label = 'Fichier';
	export let fileName = null;
	let hoveredByFile = false;
	let loading = false;
	export let filePath = null;
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let buffer = extractFile(filePath);
	let fileResponse;

	async function extractFile(filePath) {
		if (filePath) {
			let dirPath = await appLocalDataDir();
			let buffer = await readFile(dirPath+'/'+`${$user.user.id}/${patient.patient_id}/${filePath}.pdf`);
			return buffer;
		}
		return null;
	}
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

	export async function save() {
		console.log('in save', filePath, fileResponse, );
		let dirPath = await appLocalDataDir()
		await invoke('setup_path', {
			dirPath: dirPath + `/${get(user).user.id}/${patient.patient_id}`,
			fileName: fileName ? fileName + '.' + fileResponse.name.split('.').pop() : fileResponse.name,
			fileContent: Array.from(buffer)
		});
		console.log('fil saved');
	}
</script>

<DefaultFieldWrapper>
	<div>
		<h5 class="select-none text-surface-500 dark:text-surface-300" class:font-bold={hoveredByFile}>
			{label}
		</h5>
		<div class="flex flex-col items-start justify-start py-2 space-y-2">
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
	</div>
</DefaultFieldWrapper>
