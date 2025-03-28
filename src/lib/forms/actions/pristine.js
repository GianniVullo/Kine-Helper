import Pristine from 'pristinejs';
import { onMount } from 'svelte';

export function pristine(form_element, { isValid, isValidSync, validators }) {
	// the node has been mounted in the DOM
	console.log('Setting UP Prestine for form', form_element);
	let config = {
		// class of the parent element where the error/success class is added
		classTo: 'form-group',
		errorClass: 'has-error',
		successClass: 'success',
		// class of the parent element where error text element is appended
		errorTextParent: 'form-group',
		// type of element to create for the error text
		errorTextTag: 'p',
		// class of the error text element
		errorTextClass: 'text-error-500'
	};

	let pristine = new Pristine(form_element, config);

	onMount(() => {
		if (validators) {
			for (const key of Object.keys(validators)) {
				console.log('adding validators in Pristine with ', key);
				if (Array.isArray(validators[key])) {
					for (const validator of validators[key]) {
						pristine.addValidator(document.getElementById(key), validator.fn, validator.errorMessage);
					}
				} else {
					let validator = validators[key];
					console.log("validator is not an Array it is ", validator, document.getElementById(key));
					pristine.addValidator(key, validator.fn, validator.errorMessage);
				}
			}
		}
	})

	function validationFlow(e) {
		e.preventDefault();
		e.target.classList.add('isLoading');
		let submitter = e.submitter;
		submitter.disabled = true;
		const form_data = new FormData(e.target);
		// console.log('now validating in Pristine Action with ', pristine, Array.from(form_data.entries()));
		// check if the form is valid
		let valid = pristine.validate();
		console.log('is it valid ?', valid);
		if (valid) {
			if (isValid) {
				return isValid({
					formData: Object.fromEntries(form_data.entries()),
					submitter
				})
					.then((value) => {
						console.log('after isValid', value);
						form_element.classList.remove('isLoading');
					})
					.catch((err) => {
						console.log('after isNotValid', err);
						submitter.disabled = false;
						form_element.classList.remove('isLoading');
					});
			}
			if (isValidSync) {
				isValidSync({
					formData: Object.fromEntries(form_data.entries()),
					submitter
				});
				return form_element.classList.remove('isLoading');
			}
		}
		submitter.disabled = false;
		e.target.classList.remove('isLoading');
	}

	form_element.addEventListener('submit', validationFlow);

	return {
		destroy() {
			form_element.removeEventListener('submit', validationFlow);
			pristine.destroy();
		}
	};
}
