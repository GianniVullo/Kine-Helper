import { trace } from '@tauri-apps/plugin-log';
import { isEqual } from 'lodash';
import { safeParse, safeParseAsync } from 'valibot';

//* API de validation de formulaire
/**
 ** les features nécessaires :
 **     - fournir un context au formulaire :
 **         - Touched : est-ce que le formulaire a été touché par l'utilisateur
 **			- isDirty : doit servir pour le truc qui empêche de quitter la page. Si isDirty => are you sure you want to leave the page ?
 **     - contrôle du submiter : désactiver la soumission du formulaire pendant la validation
 **     - Validation grâce à Valibot
 **     - Exécution de fonctions "life cycle hook"
 **          - onSubmit
 **          - onError : de base : scroller en haut du form où il y aura un message avec tous les champs fautifs + validation avec affichage de message d'erreur
 **          - onResult
 */

export class Formulaire {
	form = $state({});
	touched = $derived(
		Object.keys(this.form).reduce((acc, key) => {
			acc[key] = !isEqual(this.form[key], this.initialValues[key]);
			return acc;
		}, {})
	);
	errors = $state({});
	isDirty = $derived(Object.values(this.touched).some(Boolean));
	message = $state();
	initialValues = {};
	mode;
	validateurs;
	formElement;
	submiter;
	schema;
	onError;
	onValid;
	isAsynchronous;
	// Scrollable : l'id de l'élément scrollable si c'est null ça window.scrollToTop
	scrollable;

	constructor({
		schema,
		validateurs,
		submiter = '#submit-button',
		formElement = '#default-form',
		initialValues,
		onValid,
		onError,
		mode = 'create',
		isAsynchronous = false,
		scrollable
	}) {
		trace('Constructing the Formulaire instance with ' + Object.keys(validateurs).join(', '));
		this.submiter = submiter;
		this.validateurs = validateurs;
		this.formElement = formElement;
		this.mode = mode;
		this.isAsynchronous = isAsynchronous;
		for (const fieldName of Object.keys(validateurs)) {
			trace('Registering ' + fieldName);
			this.form[fieldName] = initialValues?.[fieldName] ?? validateurs[fieldName].default ?? null;
			this.errors[fieldName] = false;
			this.initialValues[fieldName] = initialValues?.[fieldName] ?? null;
		}
		this.schema = schema;
		this.onValid = onValid.bind(this);
		if (onError) {
			this.onError = onError.bind(this);
		} else {
			this.onError = this.defaultOnError.bind(this);
		}
		trace('Setting $effect up');
		$effect(() => {
			this.evaluateAndValidate(this.form);
		});
		this.scrollable = scrollable;
		console.log('initialValues', this.initialValues);
	}

	setup() {
		let submitButton = document.querySelector(this.submiter);
		let formEl = document.querySelector(this.formElement);
		formEl.onsubmit = async (e) => {
			e.preventDefault();
			submitButton.disabled = true;
			await this.validateAndTerminate();
			submitButton.disabled = false;
		};

		submitButton.onclick = async (e) => {
			e.preventDefault();
			e.target.disabled = true;
			await this.validateAndTerminate();
			e.target.disabled = false;
		};
	}

	async validateAndTerminate() {
		let validData;
		if (this.isAsynchronous) {
			trace('Asynchronous validation');
			validData = await safeParseAsync(this.schema, this.form);
		} else {
			validData = safeParse(this.schema, this.form);
		}
		if (validData.success) {
			await this.onValid(validData.output);
		} else {
			await this.onError(validData);
		}
	}

	evaluateAndValidate(form) {
		console.log('in evaluateAndValidate with', $state.snapshot(form));
		for (const field of Object.keys(form)) {
			if (this.touched[field]) {
				trace(field + ' is touched');
				this.errors[field] = extractErrorForField(
					safeParse(this.validateurs[field], this.form[field])
				);
			}
		}
	}

	defaultOnError(data) {
		console.log('in onError with ', data);
		this.extractErrorForSchema(data);
		if (this.scrollable) {
			document.getElementById(this.scrollable).scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	extractErrorForSchema(validationState) {
		let errorFields = new Set();
		if (validationState.issues && validationState.issues.length > 0) {
			for (const issue of validationState.issues) {
				errorFields.add(issue.path?.[0]?.key);
				this.errors[issue.path?.[0]?.key] = this.errors[issue.path?.[0]?.key]
					? this.errors[issue.path?.[0]?.key] + '<br />'
					: '' + issue.message;
			}
		}

		this.message =
			'Le formulaire contient une error sur le ou les champs suivant : ' +
			Array.from(errorFields.values()).join(', ');
	}
}

export function extractErrorForField(validationState) {
	let errors = [];
	let errorFields = [];
	if (validationState.issues && validationState.issues.length > 0) {
		for (const issue of validationState.issues) {
			errorFields.push(issue.path?.[0]?.key);
			errors.push(issue.message);
		}
	}
	return errors.join('<br />');
}
