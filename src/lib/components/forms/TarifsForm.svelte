<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { TarifsSchema, validateurs } from './schemas/TarifsSchema.svelte.js';
	import { Form, FormSection, SubmitButton } from './blocks';
	import { appState } from '../../managers/AppState.svelte';
	import DefaultTarifField from './fields/DefaultTarifField.svelte';
	import dayjs from 'dayjs';
	import { onTarifsModification } from './onSubmits.svelte.js';
	import { t } from '../../i18n';
	import TarifsListField from './fields/TarifsListField.svelte';

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
		supplements,
		form_id,
		...rest
	} = $props();

	let formHandler = rest.formHandler;

	if (!formHandler) {
		formHandler = new Formulaire({
			validateurs,
			schema: TarifsSchema,
			submiter: rest.submiter ?? '#seance-submit',
			formElement: form_id,
			initialValues: {
				tarifs,
				supplements,
				tarif_seance: tarif_seance ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_seance',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_s: true })
				},
				tarif_indemnite: tarif_indemnite ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_indemnite',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_id: true })
				},
				tarif_rapport_ecrit: tarif_rapport_ecrit ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_rapport_ecrit',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_re: true })
				},
				tarif_consultatif: tarif_consultatif ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_consultatif',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_c: true })
				},
				tarif_seconde_seance: tarif_seconde_seance ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_seconde_seance',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_sec: true })
				},
				tarif_intake: tarif_intake ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_intake',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_in: true })
				},
				tarif_no_show: tarif_no_show ?? {
					id: null,
					user_id: appState.user.id,
					nom: 'tarif_no_show',
					valeur: null,
					created_at: now,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({ t_ns: true })
				},
				organization_id: appState.selectedOrg.id
			},
			onValid: onTarifsModification
		});
	}
</script>

<Form
	id={form_id}
	title={$t('tarifsForm', 'title', {}, 'Manage your rates')}
	message={formHandler.message}>
	{#if !appState.user.conventionne}
		<FormSection
			titre={$t('tarifsForm', 'sections.rates.title', {}, 'Your rates')}
			description={$t(
				'tarifsForm',
				'sections.rates.description',
				{},
				'You can define the value of your services and physio acts here. If you leave a box blank, the current convention rates will be taken by default.'
			)}>
			<!--* tarif_seance -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_seance}
				error={formHandler.errors.tarif_seance}
				id="tarif_seance"
				name="tarif_seance"
				label={$t('tarifsForm', 'fields.sessions', {}, 'Physiotherapy sessions')} />

			<!--* tarif_indemnite -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_indemnite}
				error={formHandler.errors.tarif_indemnite}
				id="tarif_indemnite"
				name="tarif_indemnite"
				label={$t('tarifsForm', 'fields.travelAllowance', {}, 'Travel allowances')} />

			<!--* tarif_rapport_ecrit -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_rapport_ecrit}
				error={formHandler.errors.tarif_rapport_ecrit}
				id="tarif_rapport_ecrit"
				name="tarif_rapport_ecrit"
				label={$t('tarifsForm', 'fields.writtenReports', {}, 'Written reports')} />

			<!--* tarif_consultatif -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_consultatif}
				error={formHandler.errors.tarif_consultatif}
				id="tarif_consultatif"
				name="tarif_consultatif"
				label={$t('tarifsForm', 'fields.consultativeSessions', {}, 'Consultative sessions')} />

			<!--* tarif_seconde_seance -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_seconde_seance}
				error={formHandler.errors.tarif_seconde_seance}
				id="tarif_seconde_seance"
				name="tarif_seconde_seance"
				label={$t('tarifsForm', 'fields.secondSessions', {}, 'Second sessions per day')} />

			<!--* tarif_intake -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-3 md:col-span-2"
				bind:value={formHandler.form.tarif_intake}
				error={formHandler.errors.tarif_intake}
				id="tarif_intake"
				name="tarif_intake"
				label={$t('tarifsForm', 'fields.intakes', {}, 'Intakes')} />

			<!--* tarif_no_show -->
			<DefaultTarifField
				outerCSS="col-span-full sm:col-span-4"
				bind:value={formHandler.form.tarif_no_show}
				error={formHandler.errors.tarif_no_show}
				id="tarif_no_show"
				name="tarif_no_show"
				label={$t('tarifsForm', 'fields.missedSession', {}, 'Missed session')}
				help={$t(
					'tarifsForm',
					'fields.missedSessionHelp',
					{},
					'If the patient did not show up or cancelled outside your acceptable deadlines'
				)} />

			<!--* tarifs -->
			<TarifsListField
				label={$t('tarifsForm', 'fields.customRates', {}, 'Custom rates')}
				key="tarifs_custom"
				bind:tarifList={formHandler.form.tarifs}
				tarifPrototype={() => ({
					id: crypto.randomUUID(),
					nom: null,
					valeur: null,
					created_at: now,
					user_id: appState.user.id,
					organization_id: appState.selectedOrg.id,
					metadata: JSON.stringify({
						custom: true
					})
				})}>
				<p class="mt-3 text-sm/6 text-gray-600">
					{$t(
						'tarifsForm',
						'fields.customRatesHelp',
						{},
						'Custom rates allow you to quickly define the prices of your physio acts in the pathological situation, session and attestation forms.'
					)}
				</p>
			</TarifsListField>
		</FormSection>
	{/if}
	<FormSection
		titre={$t('tarifsForm', 'sections.supplements.title', {}, 'Your supplements')}
		description={$t(
			'tarifsForm',
			'sections.supplements.description',
			{},
			'You can define your supplements here. For example, if you charge a supplement for sessions performed on weekends or if you had to use consumables for the care provided.'
		)}>
		<!--* supplements -->
		<TarifsListField
			label={$t('tarifsForm', 'fields.supplements', {}, 'Supplements')}
			key="supplement"
			bind:tarifList={formHandler.form.supplements} />
	</FormSection>
	<SubmitButton id="seance-submit" className="col-span-full" loading={formHandler.loading} />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
