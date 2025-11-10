<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { Form, Field, SubmitButton } from './blocks';
	import PrinterFineTunerSectionField from './blocks/PrinterFineTunerSectionField.svelte';
	import { validateurs, FineTuningRawPrinterSchema } from './schemas/FineTuningRawPrinterSchema';
	import { PrinterFineTuner } from './utils/PrinterFineTuner.svelte.js';
	import Database from '@tauri-apps/plugin-sql';
	import { invoke } from '@tauri-apps/api/core';
	import { appState } from '../../managers/AppState.svelte';
	import { toRustInfo } from '../../utils/rawPrinting';

	let sections = new PrinterFineTuner();
	let formHandler = new Formulaire({
		validateurs,
		schema: FineTuningRawPrinterSchema,
		initialValues: sections.defaultValues,
		async onValid(data) {
			console.log(data);
			// await invoke('test_document_generation', { custom_spacing: data });
			appState.db.setItem('profilCustom-1', JSON.stringify(data));
		}
	});
	let buildingForm = new Promise(async (resolve) => {
		let db = await Database.load('sqlite:kinehelper2.db');

		let res = await db.select(`SELECT value FROM key_value WHERE key = $1`, ['profilCustom-1']);
		console.log(res);
		if (Array.isArray(res) && res.length > 0) {
			try {
				res = JSON.parse(res[0]?.value);
				console.log(res);

				// make it the initial value of the form
				formHandler.form = res;
			} catch (error) {
				// Profile couldn't be retrieved
				resolve();
			}
		}
	});

	let printCalibrationPage = async () => {
		// D'abord on ssauvergarde le profil dans un profil intermédiaire
		const data = $state.snapshot(formHandler.form);
		console.log('The data = ', data);
		let formData = {
			is_nine_pin: true,
			patient: {
				nom: 'Morningstar',
				prenom: 'Lucifer',
				mutualite: '666',
				niss: '12345432',
				adresse: 'Avenue du boulevard',
				cp: '6000',
				localite: 'Charleking'
			},
			prescription: {
				prescripteur: { nom: 'John', prenom: 'snow', inami: 'nightswatch' },
				date: '12-12-12',
				jointe_a: ''
			},
			attestation: {
				porte_prescr: true,
				date: '12-12-12',
				seances: [
					{
						date: '01/01/24',
						code_reference: '560011'
					},
					{
						date: '02/01/24',
						code_reference: '560011'
					}
				],
				total_recu: '1000'
			},
			kine: {
				nom: appState.user.nom,
				prenom: appState.user.prenom,
				inami: appState.user.inami,
				adresse: appState.user.adresse,
				cp: `${appState.user.cp}`,
				localite: appState.user.localite,
				numero_bce: appState.user.bce
			},
			situation_pathologique: {
				numero_etablissement: '42',
				service: 'Vangogh'
			}
		};
		console.log('formData in RawPrinter ==', formData);
		// Add the eventual custom spacings
		const { data: imprimante, error: NoPrinter } = await appState.db.getRawPrinter();
		if (NoPrinter) {
			return { error: NoPrinter };
		}
		console.log('formData', formData);
		let _res = await invoke('print_attestation', {
			printerName: imprimante.name,
			formData,
			spacings: toRustInfo(formHandler.form),
			leftMargin: formHandler.form.left_margin
		});

		// This shouldn't be placed there as it would systematically loose the previous profile before it had a chance to be validated
		// let db = await Database.load('sqlite:kinehelper2.db');
		// await db.execute(
		// 	`INSERT OR REPLACE
		// 		INTO key_value (key, value)
		// 		VALUES ($1, $2);`,
		// 	['profilCustom-1', JSON.stringify(data)]
		// );
	};
</script>

{#await buildingForm}{/await}
<Form
	title="Réglages fins de votre imprimante matricielle"
	description="Ajustez ici chaque déplacement de la tête de votre imprimante matricielle">
	<Field
		field={{
			name: 'initial_spacing',
			titre: 'Position initiale',
			inputType: 'number',
			help: 'Distance depuis le haut du formulaire'
		}}
		bind:value={formHandler.form['initial_spacing']}
		error={formHandler.errors?.['initial_spacing']} />

	<Field
		field={{
			name: 'left_margin',
			titre: 'Décalage gauche-droite',
			inputType: 'number',
			help: "Définissez une marge négative pour décaler l'entièreté du texte sur la gauche et positive pour la droite"
		}}
		bind:value={formHandler.form['left_margin']}
		error={formHandler.errors?.['left_margin']} />

	{#each Object.entries(sections.sectionFields) as [section, fields]}
		<PrinterFineTunerSectionField
			bind:formHandler
			bind:open={sections.expandedSections[section]}
			{fields}
			name={section} />
	{/each}

	<!-- Tools section -->
	<div class="col-span-full rounded-lg bg-gray-50 p-4 dark:bg-gray-950">
		<h4 class="mb-3 font-medium dark:text-gray-300">Outils de calibration</h4>

		<div class="flex flex-wrap gap-3">
			<button
				type="button"
				class="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
				onclick={printCalibrationPage}>
				📄 Imprimer page de test
			</button>

			<!-- <button
				type="button"
				class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
				onclick={saveProfile}>
				💾 Sauvegarder ce profil
			</button>

			<button
				type="button"
				class="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				onclick={loadProfile}>
				📂 Charger un profil
			</button>
 -->
			<!-- <button
				type="button"
				class="rounded border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
				onclick={resetAllToDefaults}>
				↺ Tout réinitialiser
			</button> -->
		</div>

		<!-- <div class="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3">
			<p class="text-sm text-yellow-800">
				<strong>Conseil:</strong> Imprimez une page de test après chaque modification pour vérifier l'alignement.
				Les valeurs sont en points d'impression (dots). Pour les imprimantes 9 aiguilles: 1mm ≈ 3 dots.
				Pour les 24 aiguilles: 1mm ≈ 7 dots.
			</p>
		</div> -->
	</div>

	<SubmitButton />
</Form>

<!-- <FormSection
		titre="Ajustement rapides des espacements"
		description="Ici, vous pouvez ajustez rapidement et globalement les zones d'impressions. Pour ajuster ligne par ligne voir section suivante.">
		 Global adjustments 
		<div class="col-span-full mb-4 rounded-lg p-4">
			* Quick controls 
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Field
					field={{
						name: 'spacing_scale',
						label: 'Échelle globale (%)',
						inputType: 'range',
						min: 70,
						max: 130,
						step: 1,
						help: 'Applique un facteur à tous les espacements'
					}}
					bind:value={formHandler.form['spacing_scale']}
					error={formHandler.errors?.['spacing_scale']} />
			</div>

			* PRESETS 
			! not ready 
			 <div class="mt-3 flex gap-2">
				<button
					type="button"
					class="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
					onclick={() => applyPreset('epsonLQ')}>
					Preset Epson LQ
				</button>
				<button
					type="button"
					class="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
					onclick={() => applyPreset('oki')}>
					Preset OKI
				</button>
				<button
					type="button"
					class="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
					onclick={() => applyPreset('default')}>
					Valeurs par défaut
				</button>
			</div> 
		</div>
	</FormSection> -->
