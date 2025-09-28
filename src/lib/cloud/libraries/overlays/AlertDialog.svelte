<script>
	import { goto, replaceState } from '$app/navigation';
	import { supabase } from '../../../stores/supabaseClient';
	import { open } from '@tauri-apps/plugin-shell';
	import { t, locale } from '../../../i18n';
	import { warningOutlineIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import FormDialog from './FormDialog.svelte';

	let {
		action,
		actionId,
		title,
		description,
		buttonTextConfirm = $t('shared', 'confirm'),
		href,
		buttonTextCancel = $t('shared', 'cancel'),
		src,
		form,
		...rest
	} = $props();

	const statelessActions = {
		signout: async () => {
			await supabase.auth.signOut();
		},
		gotoOnlineDoc: async () => {
			await open(
				$locale === 'FR'
					? 'https://kine-helper.be/tutoriels'
					: 'https://kine-helper.be/nl/tutorials'
			);
		},
		signalConfirmation: (detail) => {
			console.log('signalConfirmation called with detail:', detail);
			let confirmationEvent = new CustomEvent(`${actionId}:Confirmed`, {
				detail
			});
			console.log('About to dispatch Dialog:Confirmed event with detail:', detail);
			window.dispatchEvent(confirmationEvent);
		},
		formSubmission: () => {
			const form = document.getElementById(`${actionId}-form`);
			const data = Object.fromEntries(new FormData(form));
			console.log('formSubmission called with detail:', data);
			let confirmationEvent = new CustomEvent(`${actionId}:Submited`, {
				detail: data
			});
			console.log('About to dispatch <actionId>:Submited event with detail:', data);
			window.dispatchEvent(confirmationEvent);
			throw new Error('ERROR');
		}
	};
</script>

<!-- Include this script tag or install `@tailwindplus/elements` via npm: -->
<!-- <script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script> -->

<div class="flex h-full flex-col justify-between">
	<div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
		<div class="sm:flex sm:items-start">
			<div
				class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10 dark:bg-red-500/10">
				{@render warningOutlineIcon('size-6 text-red-600 dark:text-red-400')}
			</div>
			<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
				<h3 id="dialog-title" class="text-base font-semibold text-gray-900 dark:text-white">
					{title}
				</h3>
				<div class="mt-2">
					<p class="text-sm text-gray-500 dark:text-gray-400">
						{@html description}
					</p>
				</div>
			</div>
		</div>
	</div>
	{#if src}
		<img src={srcimg} alt="" />
	{/if}
	{#if form}
		<FormDialog {actionId} {...form} />
	{/if}
	<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700/25">
		<button
			type="button"
			onclick={(e) => {
				e.preventDefault();
				if (action) {
					try {
						statelessActions[action](rest);
					} catch (error) {
						return;
					}
				}
				if (href) {
					goto(href);
				} else {
					replaceState('', { modal: undefined });
				}
			}}
			class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto dark:bg-red-500 dark:shadow-none dark:hover:bg-red-400"
			>{buttonTextConfirm}</button>
		<button
			type="button"
			onclick={(e) => {
				e.preventDefault();
				replaceState('', { modal: undefined });
			}}
			class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
			>{buttonTextCancel}</button>
	</div>
</div>
