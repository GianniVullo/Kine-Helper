export class Stepper {
	currentStep = $state(0);
    // this should be reactive to have stepState update to signal that step isn't valid venusien
	steps = $state();
	constructor(steps, validations) {
		this.steps = steps;
		if (validations) {
			this.validations = validations;
		}
	}
	next() {
		if (this.currentStep < this.steps.length - 1) {
			if (
				(this.validations && this.validations[this.currentStep]) ||
				this.steps[this.currentStep].validation
			) {
				const isValid =
					this.validations[this.currentStep]() || this.steps[this.currentStep].validation();
				if (isValid) {
					this.currentStep += 1;
				}
			} else {
				this.currentStep += 1;
			}
		}
	}
}
