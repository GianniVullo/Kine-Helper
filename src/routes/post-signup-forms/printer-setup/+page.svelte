<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { open } from '@tauri-apps/plugin-shell';
	import { FormWrapper, SubmitButton } from '../../../lib/forms/index';
	import { goto } from '$app/navigation';
	import DBAdapter from '../../../lib/forms/actions/dbAdapter';
	import { user } from '../../../lib/index';
	import { t } from '../../../lib/i18n';
	import { get } from 'svelte/store';
	import { platform } from '@tauri-apps/plugin-os';
	import { invoke } from '@tauri-apps/api/core';
	import { PrinterIcon } from '../../../lib/ui/svgs';
	import TextFieldV2 from '../../../lib/forms/abstract-fields/TextFieldV2.svelte';
	import RadioFieldV2 from '../../../lib/forms/abstract-fields/RadioFieldV2.svelte';

	const modalStore = getModalStore();
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

	let initPrintersAndPlatform = new Promise(async (resolve) => {
		let platformName = await platform();
		let printers = await invoke('get_printer');
		resolve({ platformName, printers });
	});
	async function gotoKineHelperbeMacOs() {
		await open('https://kine-helper.be/tutoriels');
	}

	const formSchema = {
		isValid
	};

	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		setPrinter(formData.printer, formData.is_nine_pin);
	}
	async function setPrinter(printerName, is_nine_pin) {
		let db = new DBAdapter();
		await db.update('settings', [['user_id', $user.user.id]], {
			raw_printer: printerName,
			is_nine_pin: JSON.parse(is_nine_pin)
		});
		user.update((u) => {
			u.settings.raw_printer = printerName;
			u.settings.is_nine_pin = JSON.parse(is_nine_pin);
			return u;
		});
		goto('/dashboard');
	}
</script>

{#await initPrintersAndPlatform}
	loading...
{:then { platformName, printers }}
	<main class="p-10">
		<h1 class="text-surface-400">
			{$t('printerSetup', 'title')}
		</h1>
		<!-- <p class="text-surface-800 dark:text-surface-200">
			{@html $t('printerSetup', 'description')}
		</p> -->
		<div class="mb-4 mt-4 flex flex-col items-start">
			{#if platformName === 'windows'}
				<h5 class="text-xl text-secondary-200">{$t('shared', 'for')} windows</h5>
				<p class="text-surface-700 dark:text-surface-200">
					{@html $t(
						'printerSetup',
						'explainationsWindows',
						null,
						"Veuillez cliquer sur votre imprimante matricielle afin de la configurer pour Kiné Helper.<br />Si votre imprimante ne se trouve pas dans la liste ci-dessous, veuillez d'abord installer votre imprimante et relancer Kiné Helper."
					)}
				</p>
			{:else}
				<h5 class="text-xl text-secondary-200">{$t('shared', 'for')} macOs</h5>
				<p class="text-surface-700 dark:text-surface-200">
					{@html $t(
						'printerSetup',
						'explainationsmacOs',
						null,
						'Veuillez suivre les étapes de configuration reprises dans ce tutoriel pour configurer votre imprimante matricielle :'
					)}
					<button class="variant-glass btn btn-sm" on:click={gotoKineHelperbeMacOs}>
						{$t('printerSetup', 'tutoAccess', null, 'Accéder au tutoriel')}
					</button>
				</p>
			{/if}
		</div>
		{#if platformName === 'windows'}
			<div class="flex flex-wrap overflow-x-scroll">
				{#each printers as printer}
					<button
						on:click={() => {
							printerField = printer.system_name;
						}}
						class="mb-2 mr-2 flex items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 duration-200 hover:bg-surface-200 dark:bg-surface-800 hover:dark:bg-surface-700">
						<PrinterIcon class="size-5" />
						<div class="flex flex-col items-start">
							<h1 class="select-none text-surface-800 dark:text-surface-100">{printer.name}</h1>
						</div>
						{#if printerField === printer.system_name}
							<div class="ml-1">&#10003;</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
		<div class="">
			<FormWrapper
				class="group/form mt-4 flex max-w-sm flex-col items-start justify-start space-y-4"
				{formSchema}>
				<TextFieldV2
					class="input min-w-[24rem] max-w-sm {platformName === 'windows' ? '!hidden' : ''}"
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
						on:click|preventDefault={() => modalStore.trigger(modal)}
						class="variant-outline-secondary btn">{$t('printerSetup', 'ignore')}</button>
				</div>
			</FormWrapper>
		</div>
		<div class="mt-14 flex flex-col">
			<h3 class="mb-4 text-2xl text-primary-600 dark:text-primary-500">{$t('printerSetup', 'important')}</h3>
			<p>
				{$t('printerSetup', 'important.description')}
			</p>
		</div>
	</main>
{/await}
