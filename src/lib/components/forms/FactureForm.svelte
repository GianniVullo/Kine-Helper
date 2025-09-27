<script>
	import { Form, SubmitButton, Field } from './blocks';
	import dayjs from 'dayjs';
	import { createFacture } from '../../user-ops-handlers/documents';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';
	import { invalidate } from '$app/navigation';
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { array, object, picklist, string, pipe, transform } from 'valibot';
	import { isoDateWithMessage } from './validators/baseValidators';
	import { page } from '$app/state';
	import { appState } from '../../managers/AppState.svelte';

	let { sp, patient } = page.data;

	let attestations = sp.attestations.map((att) => {
		console.log('Mapping attestation:', att);
		return {
			value: att.attestation_id,
			label: get(t)('attestation.detail', 'title', { date: dayjs(att.date).format('DD/MM/YYYY') }),
			id: att.attestation_id
		};
	});

	async function onValid({ factureType, dateFactu, attestationsIds }) {
		let valeurTotale = 0.0;
		let totalValeurRecue = 0.0;
		let totalRemboursement = 0.0;
		for (const attestation of sp.attestations) {
			if (attestationsIds.includes(attestation.attestation_id)) {
				console.log('attestation', attestation);
				const v_t =
					typeof attestation.valeur_totale === 'string'
						? parseFloat(attestation.valeur_totale.replace(',', '.'))
						: attestation.valeur_totale;
				const t_r =
					typeof attestation.total_recu === 'string'
						? parseFloat(attestation.total_recu.replace(',', '.'))
						: attestation.total_recu;
				valeurTotale += v_t;
				totalValeurRecue += t_r;
				totalRemboursement += v_t - t_r;
				console.log('valeurTotale', valeurTotale);
				console.log('totalValeurRecue', totalValeurRecue);
				console.log('totalRemboursement', totalRemboursement);
			}
		}
		let facture = {
			id: crypto.randomUUID(),
			user_id: sp.user_id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			date: $state.snapshot(dateFactu),
			type: $state.snapshot(factureType),
			organization_id: appState.selectedOrg.id,
			total:
				factureType === 'patient'
					? totalValeurRecue.toFixed(2).replace('.', ',')
					: totalRemboursement.toFixed(2).replace('.', ',')
		};
		console.log('Sending facture and AttestationIds to createFacture', facture, attestationsIds);
		let { data: createFactResp, error: createFactError } = await createFacture(
			facture,
			$state.snapshot(attestationsIds)
		);
		console.log('CREATION DONE!');
		if (createFactError) {
			console.log('ERROR HERE :: ', createFactError);
		}
		await invalidate('patient:layout');
		location.reload();
	}

	const validateurs = {
		factureType: picklist(['patient', 'mutuelle']),
		dateFactu: isoDateWithMessage(),
		attestationsIds: array(string())
	};
	let formHandler = new Formulaire({
		validateurs,
		schema: pipe(
			transform((input) => {
				console.log('Transforming input:', input);
				return {
					factureType: input.factureType,
					dateFactu: input.dateFactu,
					attestationsIds: input.attestationsIds
				};
			}),
			object(validateurs)
		),
		submiter: '#fcreate-submit',
		initialValues: {
			factureType: 'patient',
			dateFactu: dayjs().format('YYYY-MM-DD'),
			attestationsIds: []
		},
		onValid,
		formElement: '#fcreate-form'
	});

	const fieldSchema = [
		{
			id: 'factureType',
			name: 'factureType',
			label: get(t)('otherModal', 'doc.type'),
			inputType: 'select',
			options: [
				{
					value: 'patient',
					label: `${get(t)('otherModal', 'facture')} ${get(t)('otherModal', 'facture.patient')}`
				},
				{
					value: 'mutuelle',
					label: `${get(t)('otherModal', 'facture')} ${get(t)('otherModal', 'facture.mutuelle')}`
				}
			]
		},
		{
			id: 'attestationsIds',
			name: 'attestationsIds',
			label: get(t)('otherModal', 'fcreate.label'),
			inputType: 'select-multiple',
			options: attestations
		},
		{
			id: 'dateFactu',
			name: 'dateFactu',
			titre: get(t)('otherModal', 'fcreate.date'),
			inputType: 'date'
		}
	];
</script>

<div class="px-4 pb-6">
	<Form title={$t('otherModal', 'fcreate.title')} id="fcreate-form" message={formHandler.message}>
		<div class="grid grid-cols-1 gap-4">
			{#each fieldSchema as field}
				<Field {field} bind:value={formHandler.form[field.name]} />
			{/each}
		</div>
		<SubmitButton id="fcreate-submit" loading={formHandler.loading}
			>{$t('shared', 'confirm')}</SubmitButton>
	</Form>
</div>
