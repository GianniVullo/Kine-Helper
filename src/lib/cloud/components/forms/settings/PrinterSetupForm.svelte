<script>
	import { open } from '@tauri-apps/plugin-shell';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { t, locale } from '../../../../i18n';
	import { get } from 'svelte/store';
	import { platform } from '@tauri-apps/plugin-os';
	import Modal from '../../../libraries/overlays/Modal.svelte';
	import { openModal } from '../../../libraries/overlays/modalUtilities.svelte';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import Field from '../abstract-components/Field.svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { chevronRightIcon } from '../../../../ui/svgs/IconSnippets.svelte';

	let { formHandler } = $props();

	const platformName = platform();

	async function gotoKineHelperbeMacOs() {
		if ($locale.toLowerCase() === 'fr') {
			await open('https://kine-helper.be/tutoriels/setup-macos-raw-printer');
		} else {
			await open('https://kine-helper.be/nl/tutorials/matrixprinter-instellen');
		}
	}

	let getPrinters = new Promise(async (resolve) => {
		let printers = await invoke('get_printer');
		resolve(printers);
	});
</script>

<Modal
	opened={page.state?.modal?.name === 'confirmExitPrinterConfig'}
	title={get(t)('printerSetup', 'confirmModal.title')}
	body={get(t)('printerSetup', 'confirmModal.body')} />

<Form id="peripheric-form" className="flex flex-col items-start w-full">
	<FormSection
		titre="Définissez votre imprimante matricielle"
		description={platformName === 'windows'
			? $t(
					'printerSetup',
					'explainationsWindows',
					null,
					"Veuillez cliquer sur votre imprimante matricielle afin de la configurer pour Kiné Helper.<br />Si votre imprimante ne se trouve pas dans la liste ci-dessous, veuillez d'abord installer votre imprimante et relancer Kiné Helper."
				)
			: $t(
					'printerSetup',
					'explainationsmacOs',
					null,
					'Veuillez suivre les étapes de configuration reprises dans le tutoriel pour configurer votre imprimante matricielle.'
				)}>
		{#if platformName === 'macos'}
			<div class="col-span-full">
				<button
					class="flex items-center px-2 py-1 text-sm text-indigo-600 shadow hover:text-indigo-800"
					onclick={gotoKineHelperbeMacOs}>
					<p class="">{$t('printerSetup', 'tutoAccess', null, 'Accéder au tutoriel')}</p>
					{@render chevronRightIcon('size-5 text-gray-500')}
				</button>
			</div>
		{/if}
		{#await getPrinters then printers}
			<Field
				field={{
					inputType: platformName === 'macos' ? 'text' : 'select',
					name: 'printer',
					label: $t('printerSetup', 'label.printer'),
					titre: $t('printerSetup', 'label.printer'),
					placeholder: 'Entrez le nom de votre imprimante RAW',
					outerCSS: 'col-span-full md:col-span-3',
					options: printers.map((printer) => ({
						value: printer.system_name,
						label: printer.name
					}))
				}}
				error={formHandler.errors.printer} />
		{/await}
		<Field
			field={{
				name: 'is_nine_pin',
				label: "Nombres d'aiguilles de l'imprimante",
				inputType: 'select',
				outerCSS: 'col-span-full md:col-span-3',
				options: [
					{ value: true, label: '9' },
					{ value: false, label: '12/24' }
				],
				help: 'Cette information se trouve sur la fiche technique de votre imprimante. <br>Vous la trouverez sur le site du fabricant.'
			}}
			bind:value={formHandler.form['is_nine_pin']}
			error={formHandler.errors?.['is_nine_pin']} />
	</FormSection>
</Form>
