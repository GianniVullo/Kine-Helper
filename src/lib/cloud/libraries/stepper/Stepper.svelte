<script>
	import BoutonSecondaireAvecIcone from '../../../components/BoutonSecondaireAvecIcone.svelte';
	import SubmitButton from '../../../components/forms/blocks/SubmitButton.svelte';
	import { chevronRightIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import FilDAriane from './FilDAriane.svelte';

	let { stepperController = $bindable(), filDAriane = true, finalButton, ...rest } = $props();
</script>

<div
	class={{
		'pointer-events-none': stepperController.disabled,
		'opacity-50': stepperController.disabled,
		'duration-500': true
	}}>
	{#if filDAriane}
		<!--* Fil d'Ariane avec les steps -->
		<FilDAriane
			steps={stepperController.steps}
			currentStep={stepperController.currentStep}
			goToStep={stepperController.goToStep.bind(stepperController)} />
	{/if}

	<div class="w-full py-12">
		<div class="flex w-full shrink-0 overflow-x-hidden">
			<div
				id="stepper-container"
				style={`transform: translateX(-${stepperController.currentStep * 100}%)`}
				class="flex w-full shrink-0 items-start justify-start duration-500 ease-in-out">
				{#each stepperController.steps as { step, stepArgs }}
					<div class="flex w-full shrink-0 flex-col">
						<div class={['w-full shrink-0']}>
							{@render step(stepArgs)}
						</div>
						{#key stepperController.currentStep}
							<div class="flex items-center justify-start space-x-2">
								{#if stepperController.hasPrevious()}
									<!-- previous -->
									<BoutonSecondaireAvecIcone
										iconCSS={'rotate-180'}
										icon={chevronRightIcon}
										onclick={(e) => {
											e.preventDefault();
											stepperController.previous();
											console.log('Current step:', stepperController.currentStep);
										}}>
										{'Étape précédente'}
									</BoutonSecondaireAvecIcone>
									<!-- next -->
								{/if}
								{#if stepperController.hasNext()}
									<BoutonSecondaireAvecIcone
										rtl
										icon={chevronRightIcon}
										onclick={(e) => {
											e.preventDefault();
											console.log('Current step:', stepperController.currentStep);
											stepperController.next();
										}}>
										{'Étape suivante'}
									</BoutonSecondaireAvecIcone>
								{/if}
								<div class:hidden={!stepperController.isLastStep()}>
									{#if finalButton}
										{@render finalButton()}
									{:else}
										<SubmitButton id={rest.submit_id} />
									{/if}
								</div>
							</div>
						{/key}
					</div>
				{/each}
			</div>
		</div>
	</div>
	<!-- {@render steps[stepperController.currentStep]?.()} -->
</div>
