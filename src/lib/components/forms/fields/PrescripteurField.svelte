<script>
	import { get } from 'svelte/store';
	import Field from '../blocks/Field.svelte';
	import { t } from '../../../i18n';
	import { onMount } from 'svelte';

	let { formHandler = $bindable() } = $props();

	const prescripteurFields = [
		{
			id: 'prescripteurNom',
			name: 'prescripteurNom',
			inputType: 'text',
			placeholder: 'Maison',
			titre: get(t)('form.prescription', 'prescripteurfield.name'),
			help: null,
			outerCSS: 'col-span-full md:col-span-3',
			innerCSS: ''
		},
		{
			id: 'prescripteurPrenom',
			name: 'prescripteurPrenom',
			inputType: 'text',
			placeholder: 'Grégory',
			titre: get(t)('form.prescription', 'prescripteurfield.surname'),
			help: null,
			outerCSS: 'col-span-full md:col-span-3',
			innerCSS: ''
		},
		{
			id: 'prescripteurInami',
			name: 'prescripteurInami',
			inputType: 'text',
			placeholder: get(t)('form.prescription', 'prescripteurfield.inami'),
			titre: get(t)('form.prescription', 'prescripteurfield.inami'),
			help: "Les prescripteurs terminant par '000' ne sont pas autorisés à faire des demandes d'accord",
			outerCSS: 'col-span-full',
			innerCSS: ''
		}
	];

	let queryMedecins = $state(Promise.resolve([]));
	let selected = $state('auto');
	onMount(() => {
		let input = document.querySelector('#combobox');
		if (input) {
			console.log('Input found:', input.oninput);
			input.oninput = async (e) => {
				console.log('Input event:', input.oninput);

				console.log('Input changed:', e.target.value);
				const value = e.target.value;
				if (value.length < 3) {
					queryMedecins = Promise.resolve([]);
					return;
				}
				console.log('Querying medecins with value:', value);

				queryMedecins = new Promise((resolve) => {
					setTimeout(() => {
						console.log('after setTimeout:', value);
						input.oninput();
						resolve([
							{ nom: 'Dupont', prenom: 'Jean', inami: '123456789' },
							{ nom: 'Martin', prenom: 'Sophie', inami: '987654321' }
						]);
					}, 1000);
				});
			};
		}
	});
</script>

<el-tab-group>
	<el-tab-list>
		<button
			onclick={() => {
				selected = 'auto';
			}}
			class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
			>Auto</button>
		<button
			onclick={() => {
				selected = 'manuel';
			}}
			class="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
			>Manuel</button>
	</el-tab-list>
	<el-tab-panels>
		<div>
			<!-- Include this script tag or install `@tailwindplus/elements` via npm: -->
			<!-- <script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script> -->
			<label for="combobox" class="block text-sm/6 font-medium text-gray-900"
				>Recherche d'un.e médecin</label>
			<el-autocomplete class="relative mt-2 block">
				<input
					id="combobox"
					type="text"
					class="block w-full rounded-md bg-white py-1.5 pr-12 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
				<button
					type="button"
					class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
					<svg
						viewBox="0 0 20 20"
						fill="currentColor"
						data-slot="icon"
						aria-hidden="true"
						class="size-5 text-gray-400">
						<path
							d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd"
							fill-rule="evenodd" />
					</svg>
				</button>

				<el-options
					anchor="bottom end"
					popover
					class="max-h-60 w-(--input-width) overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 transition-discrete [--anchor-gap:--spacing(1)] focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm">
					{#key queryMedecins}
						{#await queryMedecins}
							{console.log('Awaiting medecins:', queryMedecins)}
						{:then medecins}
							{console.log('Medecins:', medecins)}
							{#each medecins as { nom, prenom, inami }, index}
								<el-option
									value={`${nom} ${prenom}`}
									aria-label={`${nom} ${prenom}`}
									class="block px-3 py-2 text-gray-900 select-none aria-selected:bg-indigo-600 aria-selected:text-white">
									<div class="flex flex-col">
										<span class="truncate">
											{nom}
											{prenom}
										</span>
										<span class="ml-2 truncate text-gray-500 in-aria-selected:text-white"
											>@{inami}</span>
									</div>
								</el-option>
							{/each}
						{/await}
					{/key}
				</el-options>
			</el-autocomplete>
		</div>
		<div hidden>
			{#each prescripteurFields as field}
				<Field
					{field}
					error={formHandler.errors[field.name]}
					bind:value={formHandler.form[field.name]} />
			{:else}
				Il n'y a aucun champs à afficher
			{/each}
		</div>
	</el-tab-panels>
</el-tab-group>

<div>
	<div class="grid grid-cols-1 sm:hidden">
		<!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
		<svg
			viewBox="0 0 16 16"
			fill="currentColor"
			data-slot="icon"
			aria-hidden="true"
			class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500">
			<path
				d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
				clip-rule="evenodd"
				fill-rule="evenodd" />
		</svg>
	</div>
</div>
