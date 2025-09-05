<script>
	import Stepper from '$lib/cloud/libraries/stepper/Stepper.svelte';
	import PageTitle from '$lib/cloud/components/layout/PageTitle.svelte';
	import { KineSchema, validateurs } from './schemas/settingsConfigSchema';
	import { UserDataForm, PeriphericForm } from './fields/SettingsSteps.svelte';
	import { StepperController } from '$lib/cloud/libraries/stepper/StepperController.svelte';
	import BoutonPrincipal from '$lib/components/BoutonPrincipal.svelte';
	import { appState } from '$lib/managers/AppState.svelte';
	import { onDestroy, onMount, tick, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { onKineUpsert } from './onSubmits.svelte';
	import { boolean, object } from 'valibot';
	import { stringLengthMoreThan1ButCanBeNull } from './validators/baseValidators';

	let stepperController = new StepperController([], true);

	let submitAll;

	let setFormsup = new Promise(async (resolve) => {
		if (!appState.db) {
			await appState.init({});
		}
		// building the Formulaire for Kiné Data
		let userDataFormHandler = new Formulaire({
			schema: KineSchema,
			validateurs,
			initialValues: {
				...appState.user,
				conventionne: appState.user?.conventionne ?? false
			},
			onValid: onKineUpsert,
			submiter: '#user-data-button',
			formElement: '#user-data-form',
			delaySetup: true
		});

		const { data: rawPrinter, error } = await appState.db.getRawPrinter();
		let periphericValidators = {
			printer: stringLengthMoreThan1ButCanBeNull(),
			is_nine_pin: boolean()
		};
		let periphericFormHandler = new Formulaire({
			validateurs: periphericValidators,
			schema: object(periphericValidators),
			async onValid(formData) {
				if (!appState.db) {
					await appState.init({});
				}
				// it'es enough to store these in local db
				await appState.db.execute(
					'INSERT INTO appareils (id, name, role, metadata) VALUES ($1, $2, $3, $4)',
					[
						crypto.randomUUID(),
						formData.printer,
						'raw_printer',
						JSON.stringify({ is_nine_pin: formData.is_nine_pin })
					]
				);
			},
			submiter: '#peripheric-button',
			formElement: '#peripheric-form',
			initialValues: { is_nine_pin: true, printer: rawPrinter?.name },
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

	onMount(() => {
		tick().then(() => {
			for (const step of stepperController.steps) {
				console.log('Setting up step', step.title);
				step.stepArgs.formHandler.setup();
			}
		});
	});
	$effect(() => {
		stepperController.steps?.[0]?.stepArgs?.formHandler?.evaluateAndValidate();
		stepperController.steps?.[1]?.stepArgs?.formHandler?.evaluateAndValidate();
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
