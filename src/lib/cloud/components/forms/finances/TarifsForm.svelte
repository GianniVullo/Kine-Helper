<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { TarifsSchema, validateurs, onValid } from './TarifsSchema.svelte';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { page } from '$app/state';
	import DefaultTarifField from './DefaultTarifField.svelte';
	import dayjs from 'dayjs';
	import { get } from 'svelte/store';
	import { t } from '../../../../i18n';
	import TarifsListField from './TarifsListField.svelte';
	import Modal from '../../../libraries/overlays/Modal.svelte';
	import { pushState } from '$app/navigation';
	import { openModal } from '../../../libraries/overlays/modalUtilities.svelte';

	let now = dayjs().format('YYYY-MM-DD');

	let {
		tarif_seance,
		tarif_indemnite,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarif_no_show,
		tarifs,
		supplements
	} = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: TarifsSchema,
		submiter: '#seance-submit',
		initialValues: {
			tarifs,
			supplements,
			tarif_seance: tarif_seance ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_seance',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_s: true })
			},
			tarif_indemnite: tarif_indemnite ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_indemnite',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_id: true })
			},
			tarif_rapport_ecrit: tarif_rapport_ecrit ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_rapport_ecrit',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_re: true })
			},
			tarif_consultatif: tarif_consultatif ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_consultatif',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_c: true })
			},
			tarif_seconde_seance: tarif_seconde_seance ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_seconde_seance',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_sec: true })
			},
			tarif_intake: tarif_intake ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_intake',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_in: true })
			},
			tarif_no_show: tarif_no_show ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_no_show',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_ns: true })
			}
		},
		onValid
	});

	onMount(() => {
		formHandler.setup();
	});
</script>

<Modal
	opened={page?.state?.modal?.name === 'tarifs' || page?.state?.modal?.name === 'supplements'}
	title={'Supprimer de ' + page?.state?.modal?.name}
	body={`Êtes-vous sûr de vouloir supprimer ${page?.state?.modal?.nom ? '"' + page.state.modal.nom + '"' : 'cet élément'} ?`}
	buttonTextConfirm="Supprimer"
	buttonTextCancel="Annuler"
	onAccepted={async () => {
		formHandler.form[page?.state?.modal?.name] = formHandler.form[page?.state?.modal?.name].filter(
			(tarif) => tarif.id !== page?.state?.modal?.id
		);
		history.back();
	}} />

<Form title="Gérer vos tarifs" message={formHandler.message}>
	{#if !appState.user.conventionne}
		<FormSection
			titre="Vos tarifs"
			description="Vous pouvez définir la valeur de vos prestations et actes kinés ici. Si vous laissez une case vierge, le tarifs de la convention en cours sera pris par défaut.">
			<!--* tarif_seance -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_seance}
				error={formHandler.errors.tarif_seance}
				id="tarif_seance"
				name="tarif_seance"
				label="Séances de kinésithérapie" />

			<!--* tarif_indemnite -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_indemnite}
				error={formHandler.errors.tarif_indemnite}
				id="tarif_indemnite"
				name="tarif_indemnite"
				label="Indemnités de déplacment" />

			<!--* tarif_rapport_ecrit -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_rapport_ecrit}
				error={formHandler.errors.tarif_rapport_ecrit}
				id="tarif_rapport_ecrit"
				name="tarif_rapport_ecrit"
				label="Rapports écrits" />

			<!--* tarif_consultatif -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_consultatif}
				error={formHandler.errors.tarif_consultatif}
				id="tarif_consultatif"
				name="tarif_consultatif"
				label="Séances à titre consultatif" />

			<!--* tarif_seconde_seance -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_seconde_seance}
				error={formHandler.errors.tarif_seconde_seance}
				id="tarif_seconde_seance"
				name="tarif_seconde_seance"
				label="Secondes séances/jour" />

			<!--* tarif_intake -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_intake}
				error={formHandler.errors.tarif_intake}
				id="tarif_intake"
				name="tarif_intake"
				label="Intakes" />

			<!--* tarif_no_show -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-4"
				bind:value={formHandler.form.tarif_no_show}
				error={formHandler.errors.tarif_no_show}
				id="tarif_no_show"
				name="tarif_no_show"
				label="Séance manquée"
				help="Si le patient ne s'est pas présenté ou a annulé hors de vos délais acceptables" />

			<!--* tarifs -->
			<TarifsListField
				label="Tarifs personalisés"
				key="tarifs_custom"
				bind:tarifList={formHandler.form.tarifs}
				addButtonLabel="Ajouter un tarif personnalisé"
				removeButtonLabel="Supprimer"
				addButtonHandler={async (e) => {
					e.preventDefault();
					formHandler.form.tarifs = [
						...formHandler.form.tarifs,
						{
							id: crypto.randomUUID(),
							nom: null,
							valeur: null,
							created_at: now,
							user_id: appState.user.id,
							metadata: JSON.stringify({
								custom: true
							})
						}
					];
				}}
				removeButtonHandler={(custom_tarif) => (e) => {
					e.preventDefault();
					console.log('custom_tarif', custom_tarif);
					openModal({ name: 'tarifs', id: custom_tarif.id, nom: custom_tarif.nom });
				}}>
				<p class="mt-3 text-sm/6 text-gray-600">
					Les tarifs personnalisés vous permettent de définir rapidement les prixs de vos actes
					kinés dans les formulaires situation pathologique, séance et attestation.
				</p>
			</TarifsListField>
		</FormSection>
	{/if}
	<FormSection
		titre="Vos suppléments"
		description="Vous pouvez définir vos suppléments ici. Par exemple si vous compter un supplément pour les séances effectuées les weekend ou bien si vous avez dû utiliser des consommables pour les soins prodigués.">
		<!--* supplements -->
		<TarifsListField
			label="Suppléments"
			key="supplement"
			bind:tarifList={formHandler.form.supplements}
			addButtonLabel="Ajouter un supplément"
			removeButtonLabel="Supprimer"
			addButtonHandler={async (e) => {
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
			}}
			removeButtonHandler={(custom_tarif) => (e) => {
				e.preventDefault();
				openModal({ name: 'supplements', id: custom_tarif.id, nom: custom_tarif.nom });
			}} />
	</FormSection>
	<SubmitButton id="seance-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
