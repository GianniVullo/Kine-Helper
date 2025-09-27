<script>
	/**
	 ** Must have 3 States :
	 ** 1. Awaiting for user to pick a solution to acquire an image
	 ** 2. Awaiting the image to be acquired : either by a scanner, a camera or a file
	 ** 3. Displaying the picked image while allowing to pick another one
	 ** Additionnal states :
	 ** 	- display errors
	 */
	import { get } from 'svelte/store';
	import { t } from '$lib/i18n';
	import BoutonPrincipal from '$lib/components/BoutonPrincipal.svelte';
	import TwUiFileField from '../fields/TwUIFileField.svelte';
	import AvailableScanners from '$lib/cloud/libraries/imageCapture/desktop/AvailableScanners.svelte';
	import { fly } from 'svelte/transition';
	import { arrowRightIcon } from '$lib/ui/svgs/IconSnippets.svelte';
	import { goto, pushState } from '$app/navigation';
	import { readFile } from '@tauri-apps/plugin-fs';
	import dayjs from 'dayjs';
	import { platform } from '@tauri-apps/plugin-os';

	let {
		value = $bindable(),
		// scans = $bindable(),
		froms = $bindable(),
		mode,
		prescription,
		error,
		documentName,
		documentPath
	} = $props();

	function getNext() {
		xPos = 800;
		if (stepIndex > 3) {
			stepIndex = 0;
		} else {
			stepIndex++;
		}
	}

	function getPrevious() {
		xPos = -800;
		if (stepIndex < 1) {
			stepIndex = 4;
		} else {
			stepIndex--;
		}
	}

	function gotoStep(step) {
		if (step > stepIndex) {
			xPos = 800;
		} else {
			xPos = -800;
		}
		stepIndex = step;
	}
	let xPos = $state(800);
	let stepIndex = $state(0);
	let srcimg = $state(null);
	let previewModal = () => ({
		title: 'Aperçu de la prescription',
		src: srcimg
	});
</script>

{#snippet gotoStepButton(step, label = 'Retour')}
	<button
		class="mb-4 flex items-center space-x-2"
		onclick={(e) => {
			e.preventDefault();
			gotoStep(step);
		}}>
		{@render arrowRightIcon('size-4 rotate-180')}
		<p class="">{label}</p>
	</button>
{/snippet}

<div class="relative col-span-full h-72 w-full overflow-hidden">
	<h4 class="mb-2 block text-sm/6 font-medium text-gray-900">
		{@html `${get(t)('form.prescription', 'copy.label')}${mode === 'update' && prescription.file_name ? `<br /> <span class="text-sm text-gray-400">Actuellement dans la base de donnée : </span><span class ="text-gray-500 text-sm">${prescription.prescripteurNom} ${prescription.prescripteurPrenom} - ${dayjs(prescription.date).format('DD-MM-YYYY')}.${prescription.file_name}</span>` : ''}`}
	</h4>
	{#if stepIndex === 0}
		<div
			in:fly={{ x: xPos, duration: 400 }}
			out:fly={{ x: -xPos, duration: 400 }}
			class="absolute flex h-full w-full flex-col">
			{#if srcimg}
				{@render gotoStepButton(2, "Retour à l'aperçu")}
			{/if}
			{#if mode === 'update'}
				{#if prescription.file_name}
					<p class="text-sm text-gray-500">
						Actuellement dans la base de donnée : {prescription.file_name}
					</p>
				{/if}
			{/if}

			{#if !['ios, android'].includes(platform())}
				<BoutonPrincipal
					onclick={(e) => {
						e.preventDefault();
						getNext();
					}}
					inner="Scanner une nouvelle prescription" />
				<p class="my-4">OU</p>
			{/if}

			<div class="w-full">
				<TwUiFileField
					id="file"
					name="file"
					inputType="file"
					help={mode === 'update'
						? 'Attention, si vous uploadez un nouveau fichier la copie de la prescription précédemment enregistrée sera écrasée'
						: undefined}
					oninput={(e) => {
						value = Array.from(e.currentTarget.files ?? []);
						srcimg = URL.createObjectURL(value[0]);
						gotoStep(2);
					}}
					files={value}
					{error} />
			</div>
		</div>
	{:else if stepIndex === 1}
		<div
			in:fly={{ x: xPos, duration: 400 }}
			out:fly={{ x: -xPos, duration: 400 }}
			class="absolute h-full w-full">
			<div class="flex flex-col items-start text-gray-500">
				{@render gotoStepButton(0)}
				<AvailableScanners
					{documentName}
					{documentPath}
					afterScan={async (from) => {
						/**
						 * TODO : créer un Viewer pour le filed ici
						 */
						console.log('from = ', from);
						try {
							const file = await readFile(from);
							const blob = new Blob([file]);
							srcimg = URL.createObjectURL(blob);
						} catch (error) {
							console.error('Error reading file: ', error);
							srcimg = 'Error ' + error;
						}
						if (Array.isArray(froms)) {
							froms.push(from);
						} else {
							froms = [from];
						}
						gotoStep(2);
					}}
					onerror={() => {
						gotoStep(4);
					}} />
			</div>
		</div>
	{:else if stepIndex === 2}
		<div
			in:fly={{ x: xPos, duration: 400 }}
			out:fly={{ x: -xPos, duration: 400 }}
			class="absolute h-full w-full">
			{@render gotoStepButton(0, 'Retour à la sélection')}
			{#if srcimg}
				{#if srcimg === 'Error'}
					<p class="text-red-500">Erreur lors de la lecture du fichier</p>
				{:else if srcimg === 'tiff'}
					<p class="text-indigo-500">
						Le fichier est au format TIFF, Il ne peut pas être affiché ici. <br />
					</p>
					<BoutonPrincipal
						inner="Ouvrir le fichier pour contrôler son intégrité"
						onclick={(e) => {
							e.preventDefault();
							goto(documentPath);
						}} />
				{:else}
					<button
						class=""
						onclick={(e) => {
							e.preventDefault();
							pushState('', {
								modal: previewModal()
							});
						}}><img src={srcimg} alt="" class="h-56" /></button>
				{/if}
			{/if}
		</div>
	{:else if stepIndex === 3}
		<div
			in:fly={{ x: xPos, duration: 400 }}
			out:fly={{ x: -xPos, duration: 400 }}
			class="absolute h-full w-full bg-yellow-400">
			AUREVOIR!
		</div>
	{:else if stepIndex === 4}
		<div
			in:fly={{ x: xPos, duration: 400 }}
			out:fly={{ x: -xPos, duration: 400 }}
			class="absolute h-full w-full bg-purple-400">
			{@render gotoStepButton(0, 'Retour à la sélection')}
			ERREUR!
		</div>
	{:else}
		<div class="absolute h-full w-full bg-gray-400">AUCUN ETAT!</div>
	{/if}
</div>
