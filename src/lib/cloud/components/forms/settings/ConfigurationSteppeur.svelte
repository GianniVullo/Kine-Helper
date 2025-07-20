<script>
	import Stepper from '../../../libraries/stepper/Stepper.svelte';
	import PageTitle from '../../layout/PageTitle.svelte';
	import { buildUserDataFormHandler } from '../authentication/UserDataSchema.svelte';
	import { UserDataForm, PeriphericForm, TarifsFormStep } from './Steps.svelte';
	import { StepperController } from '../../../libraries/stepper/StepperController.svelte';
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';
	import { buildPrinterFormHandler } from './PrinterSetupSchema.svelte';
	import { buildTarifsFormHandler } from '../finances/TarifsSchema.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { tick } from 'svelte';
	import { on } from 'svelte/events';
	import { goto } from '$app/navigation';

	let stepperController = new StepperController([]);

	let submitAll;

	let setFormsup = new Promise(async (resolve) => {
		if (!appState.db) {
			await appState.init({});
		}
		let userDataFormHandler = buildUserDataFormHandler({ delaySetup: true });
		console.log('UserDataFormHandler:', userDataFormHandler);
		const { data: rawPrinter, error } = await appState.db.getRawPrinter();
		let periphericFormHandler = buildPrinterFormHandler({
			printer: rawPrinter?.name,
			delaySetup: true
		});
		console.log('PeriphericFormHandler:', periphericFormHandler);
		/**
		 * TODO Here the implementation of the Modal overlay Limits us for the tarifsForm as it needs the callback system to manage the supplements. The problem is that the Modal component is css:relative and this, combined with the stepper mecanic, puts the modal in the wrong place.
		 ** To fix this, we need to refactor the Modal component so it is always opened in the center of the screen, regardless of the stepper or any component it might be instantiated in.
		 */
		// let tarifsFormHandler = await buildTarifsFormHandler({
		// 	form_id: '#tarifs-form',
		// 	delaySetup: true
		// });
		// console.log('TarifsFormHandler:', tarifsFormHandler);
		const steps = [
			{
				title: 'Données métier',
				step: UserDataForm,
				stepArgs: { formHandler: userDataFormHandler },
				description:
					'Configurez les détails de votre activité. Étape obligatoire pour que KH fonctionne correctement.',
				validation: () => {
					let valid = userDataFormHandler.validate();
					console.log('Validating user data form', valid);
					Object.keys(userDataFormHandler.form).forEach((key) => {
						userDataFormHandler.touched[key] = true;
					});
					userDataFormHandler.evaluateAndValidate();
					return valid.success;
				}
			},
			{
				title: 'Périphériques',
				step: PeriphericForm,
				stepArgs: { formHandler: periphericFormHandler },
				description: 'Configurez votre compte pour une meilleure expérience',
				validation: () => {
					let valid = periphericFormHandler.validate();
					console.log('Validating peripheric form', valid);
					Object.keys(periphericFormHandler.form).forEach((key) => {
						periphericFormHandler.touched[key] = true;
					});
					periphericFormHandler.evaluateAndValidate();
					return valid.success;
				}
			}
			// {
			// 	title: 'Tarifs et suppléments',
			// 	step: TarifsFormStep,
			// 	stepArgs: { formHandler: tarifsFormHandler },
			// 	description: 'Terminez la configuration de votre compte'
			// }
		];
		stepperController.steps = steps;
		submitAll = async () => {
			// tarifsSubmiter?.click();
			const { data: rawPrinter, error } = await appState.db.getRawPrinter();

			if (userDataFormHandler.validate().success) {
				await userDataFormHandler.validateAndTerminate();
				if (periphericFormHandler.validate().success) {
					await periphericFormHandler.validateAndTerminate();
				}
				goto('/dashboard');
			} else {
				// If the user data form is not valid, we don't proceed to the next step
				stepperController.goToStep(0);
				return;
			}

			// TODO : Ajouter une step Tarifs
			// if (!rawPrinter) {
			// 	goToStep(1);
			// } else {
			// 	if (
			// 		!formData.conventionne &&
			// 		// remplacer par un call supabase ou cache pour le cloud
			// 		!(await appState.db.select(
			// 			'SELECT * FROM tarifs WHERE json_extract(metadata, $.t_s) = $1'
			// 		),
			// 		[true])
			// 	) {
			// 		goToStep(2);
			// 	} else {
			// 		goto('/dashboard');
			// 	}
			// }
		};
		resolve();
	});

	let stepperHandle = $state();

	let userDataSubmiter;
	let periphericSubmiter;
	// let tarifsSubmiter;

	$effect(() => {
		if (stepperHandle) {
			tick().then(() => {
				for (const step of stepperController.steps) {
					step.stepArgs.formHandler.setup();
				}
			});
			stepperController.steps[0].stepArgs.formHandler.evaluateAndValidate();
			stepperController.steps[1].stepArgs.formHandler.evaluateAndValidate();
			// stepperController.steps[2].stepArgs.formHandler.evaluateAndValidate();
		}
	});
</script>

<PageTitle titre="Configuration de Kiné Helper" />
<p class="mt-1 text-sm/6 text-gray-600">
	Configurer Kiné Helper est essentiel pour une utilisation optimale. Veuillez suivre les étapes
	ci-dessous pour compléter la configuration de votre compte. <br /> Les étapes 2 et 3 peuvent être complétée
	par après dans la page "Paramètres".
</p>

{#await setFormsup then _}
	<div bind:this={stepperHandle} class="my-12">
		{#snippet finalButton()}
			<BoutonPrincipal id="submit-all" onclick={() => submitAll()} inner="Enregistrer" />
		{/snippet}
		<Stepper bind:stepperController {finalButton} />
		<button
			bind:this={userDataSubmiter}
			id="user-data-button"
			class="hidden"
			aria-label="Submit User Data Form"></button>
		<button
			bind:this={periphericSubmiter}
			id="peripheric-button"
			class="hidden"
			aria-label="Submit Peripheric Form"></button>
		<!-- <button
			bind:this={tarifsSubmiter}
			id="tarifs-button"
			class="hidden"
			aria-label="Submit Tarifs Form"></button> -->
	</div>
{/await}
