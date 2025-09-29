<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { Form, FormSection, Field, SubmitButton } from './blocks';
	import PrinterFineTunerSectionField from './blocks/PrinterFineTunerSectionField.svelte';
	import { validateurs, FineTuningRawPrinterSchema } from './schemas/FineTuningRawPrinterSchema';
	import { PrinterFineTuner } from './utils/PrinterFineTuner.svelte.js';

	let sections = new PrinterFineTuner();
	let formHandler = new Formulaire({
		validateurs,
		schema: FineTuningRawPrinterSchema,
		initialValues: sections.defaultValues,
		async onValid(data) {
			console.log(data);
		}
	});

	let showAdvanced = $state(false);
</script>

<Form>
	<!-- Main printer settings -->
	<FormSection titre="Configuration de base">
		<!-- Existing printer selection and is_nine_pin fields -->

		<button
			type="button"
			class="col-span-full flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
			onclick={() => (showAdvanced = !showAdvanced)}>
			<svg
				class="h-4 w-4 transition-transform {showAdvanced ? 'rotate-90' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
			Configuration avancée des espacements
		</button>
	</FormSection>

	{#if showAdvanced}
		<FormSection
			titre="Ajustement rapides des espacements"
			description="Ici, vous pouvez ajustez rapidement et globalement les zones d'impressions. Pour ajuster ligne par ligne voir section suivante.">
			<!-- Global adjustments -->
			<div class="col-span-full mb-4 rounded-lg bg-blue-50 p-4">
				<h4 class="mb-3 font-medium text-blue-900">Ajustements globaux</h4>

				<!--* Quick controls -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Field
						field={{
							name: 'initial_spacing_mm',
							label: 'Position initiale (mm)',
							inputType: 'number',
							step: 0.5,
							min: 0,
							max: 30,
							help: 'Distance depuis le haut du formulaire'
						}}
						bind:value={formHandler.form['initial_spacing_mm']}
						error={formHandler.errors?.['initial_spacing_mm']} />

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

				<!--* PRESETS -->
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
		</FormSection>
		<FormSection
			titre="Réglages fins"
			description="Ajustez ici chaque déplacement de la tête de votre imprimante matricielle">
			{#each Object.entries(sections.sectionFields) as [section, fields]}
				<PrinterFineTunerSectionField
					bind:formHandler
					bind:open={sections.expandedSections[section]}
					{fields}
					name={section} />
			{/each}

			<!-- Tools section -->
			<div class="col-span-full rounded-lg bg-gray-50 p-4">
				<h4 class="mb-3 font-medium">Outils de calibration</h4>

				<div class="flex flex-wrap gap-3">
					<button
						type="button"
						class="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
						onclick={printCalibrationPage}>
						📄 Imprimer page de test
					</button>

					<button
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

					<button
						type="button"
						class="rounded border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
						onclick={resetAllToDefaults}>
						↺ Tout réinitialiser
					</button>
				</div>

				<div class="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3">
					<p class="text-sm text-yellow-800">
						<strong>Conseil:</strong> Imprimez une page de test après chaque modification pour vérifier
						l'alignement. Les valeurs sont en points d'impression (dots). Pour les imprimantes 9 aiguilles:
						1mm ≈ 3 dots. Pour les 24 aiguilles: 1mm ≈ 7 dots.
					</p>
				</div>
			</div>
		</FormSection>
	{/if}
	<SubmitButton />
</Form>
