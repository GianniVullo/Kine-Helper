<script>
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import dayjs from 'dayjs';
	import { t } from '../i18n';
	import { page } from '$app/state';
	import { ManipulateurDeSeances } from '../utils/manipulateurDeSeances';
	import { FormWrapper, DateField, TextFieldV2, TimeField } from '../forms';
	import PrescriptionField from '../forms/situation-pathologique/fields/PrescriptionField.svelte';
	import { user } from '../stores/UserStore';
	import { get } from 'svelte/store';
	import { LocalDatabase } from '../stores/databaseInitializer';

	export let parent;

	let { patient, sp } = page.data;
	const event = $modalStore[0]?.meta.event;
	console.log(event);
	const formSchema = {
		isValid
	};

	async function isValid({ formData, submitter }) {
		let seance_id = crypto.randomUUID();
		let newDate = dayjs(`${date} ${heure}`).format('YYYY-MM-DD HH:mm');
		const seance = {
			seance_id,
			sp_id: sp.sp_id,
			date: newDate,
			description,
			prescription_id: formData.prescriptionId,
			patient_id: patient.patient_id,
			user_id: get(user).user.id,
			created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
		};
		let mPSs = new ManipulateurDeSeances(patient, sp);
		await mPSs.ajouter(seance);
		// Ajouter la séance au composant calendrier
		if ($modalStore[0]?.meta.component) {
			// Fetch le code
			let db = new LocalDatabase();
			let duree = await db.select(
				'SELECT duree from codes WHERE code_id = (SELECT code_id from seances WHERE seance_id = $1)',
				[seance_id]
			);
			console.log(duree);
			const durees = [15, 20, 30, 45, 60, 120];
			const evennement = {
				id: seance_id,
				start: newDate,
				end: dayjs(newDate).add(durees[duree[0].duree], 'minute').format('YYYY-MM-DD HH:mm'),
				title: patient.nom + ' ' + patient.prenom,
				editable: false,
				startEditable: false,
				durationEditable: false,
				backgroundColor: 'rgb(168,85,247)',
				textColor: '#dbdee9',
				extendedProps: {
					seance
				}
			};
			console.log('evenement', evennement);
			$modalStore[0]?.meta.component.addEvent(evennement);
		}
		parent.onClose();
	}
	let date = event ? dayjs(event.dateStr).format('YYYY-MM-DD') : undefined;
	let heure = event ? dayjs(event.dateStr).format('HH:mm') : undefined;
	let description;
	let prescription = sp.prescriptions[0].prescription_id;
</script>

{#if $modalStore[0]}
	<div
		class="card w-modal flex flex-col border border-surface-500 p-4 shadow-xl dark:border-surface-300">
		<!--* Titre -->

		<header class="mb-1 flex items-center justify-start">
			<div class="flex w-full items-baseline justify-between">
				<div class="flex items-center justify-start">
					<h1 class="mr-4 text-2xl">
						{$t(
							'otherModal',
							'newSession',
							{
								patientFullName: `${patient.nom} ${patient.prenom}`
							},
							'Session Creation'
						)}
					</h1>
				</div>
			</div>
		</header>
		<!--* BODY SECTION -->
		<!--? Formulaire de création -->
		<FormWrapper {formSchema} class="group/form flex flex-col items-start space-y-2 px-4">
			<DateField name="date" label={$t('shared', 'date')} bind:value={date} />
			<TimeField label={$t('shared', 'hour')} name="heure" bind:value={heure} />
			<TextFieldV2
				name="description"
				label={$t('otherModal', 'calendar.description')}
				bind:value={description} />
			<PrescriptionField bind:value={prescription} />
			<button class="variant-filled-primary btn mt-5" type="submit">
				{$t('shared', 'save')}
			</button>
		</FormWrapper>
		<!--? Changement de la date et de l'heure -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{$t('shared', 'cancel')}</button>
		</footer>
	</div>
{/if}
