<script>
	import {
		lightningIcon,
		magnifyingGlassIcon,
		userIcon,
		warningOutlineIcon
	} from '../../../ui/svgs/IconSnippets.svelte';
	import { goto } from '$app/navigation';
	import ActionRapide from '../../components/layout/ActionRapide.svelte';
	import { CommandPaletteController } from './commandPaletteController.svelte';
	import BackDrop from './BackDrop.svelte';
	import HelpPanel from './HelpPanel.svelte';
	import NotFoundPanel from './NotFoundPanel.svelte';
	import ActionRapidePanel from './ActionRapidePanel.svelte';

	let commandPalette = new CommandPaletteController();
	let patientPromise = commandPalette.patientsPromise();
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

	<div class="fixed inset-0 z-50 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
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
				'mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all',
				commandPalette.inner.opened && 'scale-100 opacity-100 duration-300 ease-out',
				!commandPalette.inner.opened && 'scale-95 opacity-0 duration-200 ease-in'
			]}>
			{#await patientPromise then _}
				<div class="grid grid-cols-1">
					<input
						bind:this={commandPalette.searchInput}
						type="text"
						class="col-start-1 row-start-1 h-12 w-full border-none pr-4 pl-11 text-base text-gray-900 outline-hidden placeholder:text-gray-400 focus:ring-0 sm:text-sm"
						placeholder="Search..."
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
						<!-- <li>
							<h2 class="text-xs font-semibold text-gray-900">Projects</h2>
							<ul class="-mx-4 mt-2 text-sm text-gray-700">
								Active: "bg-indigo-600 text-white outline-hidden" 
								<li
									class="group flex cursor-default items-center px-4 py-2 select-none"
									id="option-1"
									role="option"
									tabindex="-1">
									Active: "text-white forced-colors:text-[Highlight]", Not Active: "text-gray-400"
									<svg
										class="size-6 flex-none text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										aria-hidden="true"
										data-slot="icon">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
									</svg>
									<span class="ml-3 flex-auto truncate">Workflow Inc. / Website Redesign</span>
								</li>
							</ul>
						</li> -->
						<li>
							<h2 class="text-xs font-semibold text-gray-900">Patients</h2>
							<div class="-mx-4 mt-2 text-sm text-gray-700">
								<!-- Active: "bg-indigo-600 text-white outline-hidden" -->
								{#each commandPalette.filteredPatients as patient}
									<button
										class="group flex cursor-default items-center px-4 py-2 select-none"
										id="option-2"
										onclick={() => {
											this.resetCommandPalette();
											goto(`/dashboard/patients/${patient.patient_id}`);
										}}
										tabindex="-1">
										<div
											class="flex size-7 items-center justify-center rounded-full bg-gray-300 text-xs text-gray-500">
											{patient.nom?.substring(0, 1)}
											{patient.prenom?.substring(0, 1)}
										</div>
										<span class="ml-3 flex-auto truncate">{patient.nom} {patient.prenom}</span>
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
								titre: 'Nouveau patient',
								description: 'Créez un nouveau patient',
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
				<div class="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
					Tapez
					<kbd
						class="mx-1 flex size-5 items-center justify-center rounded-sm border border-gray-400 bg-white font-semibold text-gray-900 sm:mx-2"
						>?</kbd> pour obtenir de l'aide.
				</div>
			{/await}
		</div>
	</div>
</div>
