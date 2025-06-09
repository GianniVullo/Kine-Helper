<script>
	import BoutonSecondaireAvecIcone from '../../../components/BoutonSecondaireAvecIcone.svelte';
	import { chevronRightIcon } from '../../../ui/svgs/IconSnippets.svelte';

	let { steps, currentStep = $bindable(), validations } = $props();
</script>

{#key currentStep}
	<BoutonSecondaireAvecIcone
		rtl={currentStep === 0}
		iconCSS={currentStep > 0 ? 'rotate-180' : ''}
		icon={chevronRightIcon}
		onclick={(e) => {
			e.preventDefault();
			if (validations[currentStep] && !validations[currentStep]()) {
				console.warn('Validation failed for step', currentStep);
				return;
			}
			if (currentStep === 0) {
				currentStep = 1;
			} else {
				currentStep = 0;
			}
		}}>
		{currentStep === 0 ? 'Étape suivante' : 'Étape précédente'}
	</BoutonSecondaireAvecIcone>
{/key}

{@render steps[currentStep]?.()}
