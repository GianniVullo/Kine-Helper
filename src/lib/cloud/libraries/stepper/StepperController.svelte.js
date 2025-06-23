import { goto } from '$app/navigation';

export class StepperController {
	currentStep = $state(0);
	disabled = $state(false);
	// this should be reactive to have stepState update to signal that step isn't valid venusien
	steps = $state();
	constructor(steps, dev = false) {
		this.steps = steps;
	}
	next() {
		if (this.currentStep < this.steps.length - 1) {
			if (
				(this.steps[this.currentStep].validation && this.steps[this.currentStep].validation()) ||
				!this.steps[this.currentStep].validation ||
				this.dev
			) {
				this.steps[this.currentStep].invalid = false;
				this.currentStep += 1;
				window.scroll({
					top: 0,
					behavior: 'instant'
				});
			} else {
				this.steps[this.currentStep].invalid = true;
				return;
			}
		}
	}
	previous() {
		if (this.currentStep > 0) {
			this.currentStep -= 1;
			window.scroll({
				top: 0,
				behavior: 'instant'
			});
		}
	}

	goToStep(stepIndex) {
		// if the stepIndex is > than currentIndex it needs every step in between to be valid
		// if the stepIndex is < than currentIndex it doesn't need validation
		console.log('going to step', stepIndex, 'from', this.currentStep);
		let valid;
		if (stepIndex > this.currentStep) {
			console.log('going to step', stepIndex);
			for (let i = this.currentStep; i <= stepIndex; i++) {
				console.log('checking step', i);
				if (
					(this.steps[i].validation && this.steps[i].validation()) ||
					!this.steps[i].validation ||
					this.dev
				) {
					console.log('valid step', i);
					valid = i;
					continue;
				} else {
					this.steps[i].invalid = true;
					valid = i;
					console.log('invalid step', i);
					break;
				}
			}
		}
		console.log('valid step', valid, 'current step', this.currentStep);
		if (typeof valid === 'number') {
			console.log('setting current step to', valid);
			this.currentStep = valid;
			console.log('the step is valid', this.steps[this.currentStep]);
			return;
		} else if (stepIndex < this.currentStep) {
			console.log('setting current step to', stepIndex);
			this.currentStep = stepIndex;
		}
	}
	hasNext() {
		return this.currentStep < this.steps.length - 1;
	}
	hasPrevious() {
		return this.currentStep > 0;
	}
	isLastStep() {
		return this.currentStep === this.steps.length - 1;
	}
}
