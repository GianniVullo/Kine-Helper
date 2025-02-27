<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { TarifsSchema, onValid, validateurs, fieldSchema } from './TarifsSchema.svelte';
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';
	import BoutonSecondaireAvecIcone from '../../../../components/BoutonSecondaireAvecIcone.svelte';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount, tick } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import MoneyField from '../tarification-fields/MoneyField.svelte';
	import DefaultTarifField from './DefaultTarifField.svelte';
	import Field from '../abstract-components/Field.svelte';
	import dayjs from 'dayjs';
	import TwUiField from '../fields/TwUIField.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { get } from 'svelte/store';
	import { t } from '../../../../i18n';

	let now = dayjs().format('YYYY-MM-DD');

	let {
		tarif_seance,
		tarif_indemnite_dplcmt,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarifs_custom,
		supplements
	} = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: TarifsSchema,
		submiter: '#seance-submit',
		initialValues: {
			user_id: appState.user.id,
			tarifs_custom,
			supplements,
			tarif_seance: tarif_seance ?? {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				nom: 'tarif_seance',
				valeur: null,
				created_at: now
			},
			tarif_indemnite_dplcmt: tarif_indemnite_dplcmt ?? {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				nom: 'tarif_indemnite_dplcmt',
				valeur: null,
				created_at: now
			},
			tarif_rapport_ecrit: tarif_rapport_ecrit ?? {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				nom: 'tarif_rapport_ecrit',
				valeur: null,
				created_at: now
			},
			tarif_consultatif: tarif_consultatif ?? {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				nom: 'tarif_consultatif',
				valeur: null,
				created_at: now
			},
			tarif_seconde_seance: tarif_seconde_seance ?? {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				nom: 'tarif_seconde_seance',
				valeur: null,
				created_at: now
			},
			tarif_intake: tarif_intake ?? {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				nom: 'tarif_intake',
				valeur: null,
				created_at: now
			}
		},
		onValid
	});

	const modalStore = getModalStore();
	const modal = (element, elementType) => ({
		type: 'confirm',
		title: 'Confirmation',
		body: `Voulez-vous vraiment supprimer ${element.nom} ?`,
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel'),
		modalClasses: {
			buttonPositive: 'isModal'
		},
		response: async (r) => {
			console.log('the element = ', element);

			if (r) {
				formHandler.form[elementType] = formHandler.form[elementType].filter(
					(s) => s.id != element.id
				);
			}
		}
	});

	//! attention, que se passe-t-il lorsque l'utilisateur change son tarifs au cours de l'année ? Il faut par exemple que le tarifs qui était considéré comme le tarifs par défaut pour séance devienne un tarif custom. Ou alors il faut que chaque séance porte une valeure définitive non liée à l'objet tarif por ne pas que les valeurs monétaires soient toutes faussées lors du changement. Une fois la séance tarifée elle ne doit plus pouvoir changer de tarif.

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form title="Gérer vos tarifs" message={formHandler.message}>
	{#if !appState.user.conventionne}
		<FormSection
			titre="Vos tarifs"
			description="Vous pouvez définir la valeur de vos prestations et actes kinés ici. Si vous laissez une case vierge, le tarifs de la convention en cours sera pris par défaut.">
			<!--* Id fields -->
			{#each fieldSchema as idField}
				<Field
					field={idField}
					error={formHandler.errors?.[idField.name]}
					bind:value={formHandler.form[idField.name]} />
			{/each}

			<!--* tarif_seance -->
			<DefaultTarifField
				outerCSS="span-col-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_seance}
				error={formHandler.errors.tarif_seance}
				id="tarif_seance"
				name="tarif_seance"
				label="Séances de kinésithérapie" />

			<!--* tarif_indemnite_dplcmt -->
			<DefaultTarifField
				outerCSS="span-col-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_indemnite_dplcmt}
				error={formHandler.errors.tarif_indemnite_dplcmt}
				id="tarif_indemnite_dplcmt"
				name="tarif_indemnite_dplcmt"
				label="Indemnités de déplacment" />

			<!--* tarif_rapport_ecrit -->
			<DefaultTarifField
				outerCSS="span-col-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_rapport_ecrit}
				error={formHandler.errors.tarif_rapport_ecrit}
				id="tarif_rapport_ecrit"
				name="tarif_rapport_ecrit"
				label="Rapports écrits" />

			<!--* tarif_consultatif -->
			<DefaultTarifField
				outerCSS="span-col-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_consultatif}
				error={formHandler.errors.tarif_consultatif}
				id="tarif_consultatif"
				name="tarif_consultatif"
				label="Séances à titre consultatif" />

			<!--* tarif_seconde_seance -->
			<DefaultTarifField
				outerCSS="span-col-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_seconde_seance}
				error={formHandler.errors.tarif_seconde_seance}
				id="tarif_seconde_seance"
				name="tarif_seconde_seance"
				label="Secondes séances/jour" />

			<!--* tarif_intake -->
			<DefaultTarifField
				outerCSS="span-col-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_intake}
				error={formHandler.errors.tarif_intake}
				id="tarif_intake"
				name="tarif_intake"
				label="Intakes" />

			<!--* tarifs_custom -->
			<div class="col-span-full">
				<label
					class="mb-4 flex flex-col items-start space-x-0 space-y-2 text-sm/6 font-medium text-gray-900 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
					><p>Tarifs personalisés</p>
					<BoutonPrincipal
						inner="Ajouter un tarif personnalisé"
						size="sm"
						onclick={async (e) => {
							e.preventDefault();
							formHandler.form.tarifs_custom = [
								...formHandler.form.tarifs_custom,
								{
									id: crypto.randomUUID(),
									nom: null,
									valeur: null,
									created_at: now,
									user_id: appState.user.id
								}
							];
						}} />
				</label>

				<div class="ml-4 flex flex-col space-y-4">
					{#each formHandler.form.tarifs_custom as custom_tarif, index}
						<BoutonSecondaireAvecIcone
							size="sm"
							className="inline-flex items-center bg-red-200 text-sm font-semibold text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-100 self-end"
							onclick={(e) => {
								e.preventDefault();
								modalStore.trigger(modal(custom_tarif, 'tarifs_custom'));
							}}
							inner="Supprimer">
							{#snippet icon(cls)}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="3.5"
									stroke="currentColor"
									class="-ml-0.5 mr-1.5 size-5 text-red-400">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
								</svg>
							{/snippet}
						</BoutonSecondaireAvecIcone>

						{@const identifiant = `tarifs_custom${index}`}
						<div class="flex flex-col space-y-2 rounded border border-indigo-500 p-2 sm:w-3/4">
							<input type="hidden" name={identifiant} id={identifiant} value={custom_tarif.id} />
							<Field
								field={{ inputType: 'text', titre: 'Nom de votre tarif', labelCSS: '!text-xs' }}
								error={formHandler.errors?.tarifs_custom?.[index]?.nom}
								bind:value={formHandler.form.tarifs_custom[index].nom} />

							{#snippet leadingMoney()}
								<span class="text-gray-500 sm:text-sm">€</span>
							{/snippet}
							{#snippet trailingMoney()}
								<span class="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
							{/snippet}

							<!--* valeur -->
							<div class="sm:col-span-4">
								<label for={identifiant + 'val'} class="block text-xs font-medium text-gray-900"
									>Valeur de votre tarif</label>
								<TwUiField
									id={identifiant + 'val'}
									name={identifiant + 'val'}
									inputType="text"
									placeholder="0,00"
									leading={leadingMoney}
									trailing={trailingMoney}
									error={formHandler.errors?.tarifs_custom?.[index]?.nom}
									bind:value={formHandler.form.tarifs_custom[index].valeur} />
							</div>
						</div>
					{:else}
						<p class="text-gray-700 text-xs">Vous n'avez pas encore de tarifs personalisés</p>
					{/each}
				</div>
				<p class="mt-3 text-sm/6 text-gray-600">
					Les tarifs personnalisés vous permettent de définir rapidement les prixs de vos actes
					kinés dans les formulaires situation pathologique, séance et attestation.
				</p>
			</div>
		</FormSection>
	{/if}
	<FormSection
		titre="Vos suppléments"
		description="Vous pouvez définir vos suppléments ici. Par exemple si vous compter un supplément pour les séances effectuées les weekend ou bien si vous avez dû utiliser des consommables pour les soins prodigués.">
		<!--* supplements -->
		<div class="col-span-full">
			<label
				class="mb-4 flex flex-col items-start space-x-0 space-y-2 text-sm/6 font-medium text-gray-900 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
				><p>Suppléments</p>
				<BoutonPrincipal
					inner="Ajouter un supplément"
					size="sm"
					onclick={async (e) => {
						e.preventDefault();
						formHandler.form.supplements = [
							...formHandler.form.supplements,
							{
								id: crypto.randomUUID(),
								nom: null,
								valeur: null,
								created_at: now,
								user_id: appState.user.id
							}
						];
					}} />
			</label>

			<div class="ml-4 flex flex-col space-y-4">
				{#each formHandler.form.supplements as custom_tarif, index}
					{@const identifiant = `supplements${index}`}
					<div class="flex flex-col space-y-2 rounded border border-indigo-500 p-2 sm:w-3/4">
						<BoutonSecondaireAvecIcone
							size="sm"
							className="inline-flex items-center bg-red-200 text-sm font-semibold text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-100 self-end"
							onclick={(e) => {
								e.preventDefault();
								modalStore.trigger(modal(custom_tarif, 'supplements'));
							}}
							inner="Supprimer">
							{#snippet icon(cls)}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="3.5"
									stroke="currentColor"
									class="-ml-0.5 mr-1.5 size-5 text-red-400">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
								</svg>
							{/snippet}
						</BoutonSecondaireAvecIcone>

						<input type="hidden" name={identifiant} id={identifiant} value={custom_tarif.id} />
						<Field
							field={{ inputType: 'text', titre: 'Nom de votre supplément', labelCSS: '!text-xs' }}
							error={formHandler.errors?.supplements?.[index]?.nom}
							bind:value={formHandler.form.supplements[index].nom} />

						{#snippet leadingMoney()}
							<span class="text-gray-500 sm:text-sm">€</span>
						{/snippet}
						{#snippet trailingMoney()}
							<span class="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
						{/snippet}

						<!--* valeur -->
						<div class="sm:col-span-4">
							<label for={identifiant + 'val'} class="block text-xs font-medium text-gray-900"
								>Valeur de votre supplément</label>
							<TwUiField
								id={identifiant + 'val'}
								name={identifiant + 'val'}
								inputType="text"
								placeholder="0,00"
								leading={leadingMoney}
								trailing={trailingMoney}
								error={formHandler.errors?.supplements?.[index]?.nom}
								bind:value={formHandler.form.supplements[index].valeur} />
						</div>
					</div>
				{:else}
					<p class="text-gray-700 text-xs">Vous n'avez pas encore de suppléments</p>
				{/each}
			</div>
		</div>
	</FormSection>
	<SubmitButton id="seance-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
