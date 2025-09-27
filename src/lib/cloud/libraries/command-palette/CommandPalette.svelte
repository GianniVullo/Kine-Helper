<script>
	import { userIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import { goto } from '$app/navigation';
	import { CommandPaletteController } from './commandPaletteController.svelte';
	import BackDrop from './BackDrop.svelte';
	import HelpPanel from './HelpPanel.svelte';
	import NotFoundPanel from './NotFoundPanel.svelte';
	import ActionRapidePanel from './ActionRapidePanel.svelte';
	import { t } from '$lib/i18n';
	import Kbd from '../../../components/KBD.svelte';

	let commandPalette = new CommandPaletteController();
	let patientPromise = $state(commandPalette.patientsPromise());
	$effect(() => {
		// We reset the patientPromise every time the command palette is opened so that the data are always up to date with the newly inserted patients.
		if (commandPalette.inner.opened) {
			console.log('Command palette opened, fetching patients');
			patientPromise = commandPalette.patientsPromise();
		}
	});
	function focusNode(node) {
		node.focus();
	}
</script>

<div
	class="relative z-30"
	class:pointer-events-none={!commandPalette.inner.opened}
	role="dialog"
	aria-modal="true">
	<!--
    Background backdrop, show/hide based on modal state.

    Entering: "ease-out duration-300"
      From: "opacity-0"
      To: "opacity-100"
    Leaving: "ease-in duration-200"
      From: "opacity-100"
      To: "opacity-0"
  -->
	<BackDrop display={commandPalette.inner.opened} />

	<div class="fixed inset-0 z-50 w-screen overflow-y-auto p-4 pt-20 sm:p-6 md:p-20">
		<!--
      Command palette, show/hide based on modal state.

      Entering: "ease-out duration-300"
        From: "opacity-0 scale-95"
        To: "opacity-100 scale-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100 scale-100"
        To: "opacity-0 scale-95"
    -->
		<div
			id="command-palette"
			class={[
				'mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all dark:divide-gray-700 dark:border dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-800/80',
				commandPalette.inner.opened && 'scale-100 opacity-100 duration-300 ease-out',
				!commandPalette.inner.opened && 'scale-95 opacity-0 duration-200 ease-in'
			]}>
			{#await patientPromise then _}
				<div class="grid grid-cols-1">
					<input
						{@attach focusNode}
						id="command-palette-input"
						type="text"
						class="col-start-1 row-start-1 block h-12 w-full rounded-md border-none bg-white px-3 py-1.5 pr-4 pl-11 text-base text-gray-900 outline-hidden outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:ring-0 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
						placeholder={$t('commandPalette', 'placeholder', {}, 'Search...')}
						bind:value={commandPalette.inner.search}
						role="combobox"
						aria-expanded="false"
						aria-controls="options" />
					<svg
						class="pointer-events-none col-start-1 row-start-1 ml-4 size-5 self-center text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon">
						<path
							fill-rule="evenodd"
							d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
							clip-rule="evenodd" />
					</svg>
				</div>

				<!-- Results, show/hide based on command palette state. -->
				{#if commandPalette.inner.search && commandPalette.inner.search !== '?' && commandPalette.filteredPatients.length > 0}
					<ul
						class="max-h-80 transform-gpu scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
						id="options"
						role="listbox">
						<li>
							<h2 class="text-xs font-semibold text-gray-900">
								{$t('commandPalette', 'patients', {}, 'Patients')}
							</h2>
							<div class="-mx-4 mt-2 text-sm text-gray-700">
								<!-- Active: "bg-indigo-600 text-white outline-hidden" -->
								{#each commandPalette.filteredPatients as patient}
									<button
										class="group flex cursor-default items-center px-4 py-2 select-none"
										id="option-2"
										onclick={(e) => {
											e.stopPropagation();
											commandPalette.resetCommandPalette();
											goto(`/dashboard/patients/${patient.patient_id}`);
										}}
										tabindex="-1">
										<div
											class="flex size-7 items-center justify-center rounded-full bg-gray-300 text-xs text-gray-500">
											{patient.nom?.substring(0, 1)}
											{patient.prenom?.substring(0, 1)}
										</div>
										<span class="ml-3 flex-auto truncate dark:text-gray-200"
											>{patient.nom} {patient.prenom}</span>
									</button>
								{/each}
							</div>
						</li>
					</ul>
				{/if}
				<!-- Help, show/hide based on command palette state. -->
				{#if commandPalette.inner.search === '?'}
					<HelpPanel />
				{/if}

				<!-- Empty state, show/hide based on command palette state. -->
				{#if commandPalette.inner.search && commandPalette.inner.search !== '?' && commandPalette.filteredPatients.length === 0}
					<NotFoundPanel />
				{/if}

				{#if commandPalette.inner.search === '' && commandPalette.filteredPatients.length === 0}
					<ActionRapidePanel
						actionRapides={[
							{
								icon: userIcon,
								titre: $t('commandPalette', 'newPatient', {}, 'New patient'),
								description: $t('commandPalette', 'newPatientDesc', {}, 'Create a new patient'),
								onclick: () => {
									commandPalette.resetCommandPalette();
									goto('/dashboard/patients/create');
								},
								className: 'bg-pink-500 text-white'
							}
							// TODO ici Il faudrait ajouter un lien vers les tarifs et suppléments
						]} />
				{/if}

				<!-- Footer -->
				<div
					class="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
					{$t('commandPalette', 'helpFooter', {}, 'Type')}

					<Kbd content="?" className="mx-1" />

					{$t('commandPalette', 'helpFooter2', {}, 'for help.')}
				</div>
			{/await}
		</div>
	</div>
</div>
