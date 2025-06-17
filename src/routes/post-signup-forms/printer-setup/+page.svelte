<script>
	import { open } from '@tauri-apps/plugin-shell';
	import { FormWrapper, SubmitButton } from '../../../lib/forms/index';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { t, locale } from '../../../lib/i18n';
	import { get } from 'svelte/store';
	import { platform } from '@tauri-apps/plugin-os';
	import TextFieldV2 from '../../../lib/forms/abstract-fields/TextFieldV2.svelte';
	import RadioFieldV2 from '../../../lib/forms/abstract-fields/RadioFieldV2.svelte';
	import WindowsSelectionField from '../../../lib/forms/settings/WindowsSelectionField.svelte';
	import { appState } from '../../../lib/managers/AppState.svelte';
	import Modal from '../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { openModal } from '../../../lib/cloud/libraries/overlays/modalUtilities.svelte';

	const modal = {
		type: 'confirm',
		title: get(t)('printerSetup', 'confirmModal.title'),
		body: get(t)('printerSetup', 'confirmModal.body'),
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel'),
		response: (r) => {
			if (r) {
				goto('/dashboard');
			}
		}
	};
	let printerField;

	const platformName = platform();

	async function gotoKineHelperbeMacOs() {
		if ($locale.toLowerCase() === 'fr') {
			await open('https://kine-helper.be/tutoriels/setup-macos-raw-printer');
		} else {
			await open('https://kine-helper.be/nl/tutorials/matrixprinter-instellen');
		}
	}

	const formSchema = {
		isValid
	};
	async function setPrinter(printerName, is_nine_pin) {
		if (!appState.db) {
			await appState.init({});
		}
		// it'es enough to store these in local db
		await appState.db.execute(
			'INSERT INTO appareils (id, name, role, metadata) VALUES ($1, $2, $3, $4)',
			[crypto.randomUUID(), printerName, 'raw_printer', JSON.stringify({ is_nine_pin })]
		);
		goto('/dashboard');
	}

	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		await setPrinter(formData.printer, formData.is_nine_pin);
	}
</script>

<Modal
	opened={page.state?.modal?.name === 'confirmExitPrinterConfig'}
	title={get(t)('printerSetup', 'confirmModal.title')}
	body={get(t)('printerSetup', 'confirmModal.body')}
	onAccepted={() => {
		goto('/dashboard');
	}} />

<main class="p-10">
	<h1 class="text-surface-900 dark:text-surface-400">
		{$t('printerSetup', 'title')}
	</h1>
	<div class="mt-4 mb-4 flex flex-col items-start">
		{#if platformName === 'windows'}
			<h5 class="text-secondary-700 dark:text-secondary-200 text-xl">
				{$t('shared', 'for')} windows
			</h5>
			<p class="text-surface-700 dark:text-surface-200">
				{@html $t(
					'printerSetup',
					'explainationsWindows',
					null,
					"Veuillez cliquer sur votre imprimante matricielle afin de la configurer pour Kiné Helper.<br />Si votre imprimante ne se trouve pas dans la liste ci-dessous, veuillez d'abord installer votre imprimante et relancer Kiné Helper."
				)}
			</p>
		{:else}
			<h5 class="text-secondary-700 dark:text-secondary-200 text-xl">
				{$t('shared', 'for')} macOs
			</h5>
			<p class="text-surface-700 dark:text-surface-200">
				{@html $t(
					'printerSetup',
					'explainationsmacOs',
					null,
					'Veuillez suivre les étapes de configuration reprises dans ce tutoriel pour configurer votre imprimante matricielle :'
				)}
				<button class="variant-glass btn btn-sm" onclick={gotoKineHelperbeMacOs}>
					{$t('printerSetup', 'tutoAccess', null, 'Accéder au tutoriel')}
				</button>
			</p>
		{/if}
	</div>
	{#if platformName === 'windows'}
		<WindowsSelectionField bind:printerField />
	{/if}
	<div class="">
		<FormWrapper
			class="group/form mt-4 flex max-w-sm flex-col items-start justify-start space-y-4"
			{formSchema}>
			<TextFieldV2
				class="input max-w-sm min-w-[24rem] {platformName === 'windows' ? '!hidden' : ''}"
				labelClass={platformName === 'windows' ? '!hidden' : ''}
				value={printerField}
				label={$t('printerSetup', 'label.printer')}
				name="printer" />
			<RadioFieldV2
				name="is_nine_pin"
				value={true}
				inline
				label={$t('printerSetup', 'pins.label')}
				options={[
					{ value: true, label: '9' },
					{ value: false, label: '12/24' }
				]} />
			<div class="flex w-full justify-between">
				<SubmitButton class="!self-start" />
				<button
					onclick={(e) => {
						e.preventDefault();
						openModal({
							name: 'confirmExitPrinterConfig'
						});
					}}
					class="variant-outline-secondary btn">{$t('printerSetup', 'ignore')}</button>
			</div>
		</FormWrapper>
	</div>
	<div class="mt-14 flex flex-col">
		<h3 class="mb-4 text-2xl text-purple-600 dark:text-purple-500">
			{$t('printerSetup', 'important')}
		</h3>
		<p>
			{$t('printerSetup', 'important.description')}
		</p>
	</div>
</main>
