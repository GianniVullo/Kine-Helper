<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { open } from '@tauri-apps/plugin-shell';
	import { FormWrapper, SubmitButton, TextFieldV2 } from '../../../lib/forms/index';
	import { goto } from '$app/navigation';
	import DBAdapter from '../../../lib/forms/actions/dbAdapter';
	import { user } from '../../../lib/index';
	import { t } from '../../../lib/i18n';
	import { get } from 'svelte/store';

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

	async function gotoKineHelperbeWindows() {
		await open('https://kine-helper.be');
	}
	async function gotoKineHelperbeMacOs() {
		await open('https://kine-helper.be');
	}
	async function gotoKineHelperbeLinux() {
		await open('https://kine-helper.be');
	}
	let printer;
	const formSchema = {
		isValid
	};
	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		let db = new DBAdapter();
		await db.update('settings', [['user_id', $user.user.id]], { raw_printer: printer });
        user.update((u) => {
            u.settings.raw_printer = printer;
            return u;
        });
        goto('/dashboard');
	}
</script>

<main class="p-10">
	<h1 class="text-surface-400">
		{$t('printerSetup', 'title')}
	</h1>
	<p class="text-surface-800 dark:text-surface-200">
		{@html $t('printerSetup', 'description')}
	</p>
	<div class="mt-4 flex flex-col space-y-4">
		<div>
			<h5 class="text-xl text-secondary-200">{$t('shared', 'for')} windows</h5>
			<button on:click={gotoKineHelperbeWindows}>{$t('printerSetup', 'explainations')}</button>
		</div>
		<div>
			<h5 class="text-xl text-secondary-200">{$t('shared', 'for')} macOs</h5>
			<button on:click={gotoKineHelperbeMacOs}>{$t('printerSetup', 'explainations')}</button>
		</div>
		<div>
			<h5 class="text-xl text-secondary-200">{$t('shared', 'for')} Linux</h5>
			<button on:click={gotoKineHelperbeLinux}>{$t('printerSetup', 'explainations')}</button>
		</div>
	</div>
	<div class="">
		<FormWrapper
			class="group/form mt-4 flex max-w-sm flex-col items-start justify-start space-y-4"
			{formSchema}>
			<TextFieldV2
				class="min-w-[24rem] max-w-sm"
				label={$t('printerSetup', 'label.printer')}
				name="printer"
				bind:value={printer} />
			<div class="flex w-full justify-between">
				<SubmitButton class="!self-start" />
				<button on:click={() => modalStore.trigger(modal)} class="variant-outline-secondary btn"
					>{$t('printerSetup', 'ignore')}</button>
			</div>
		</FormWrapper>
	</div>
</main>
