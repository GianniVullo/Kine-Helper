import { trace } from '@tauri-apps/plugin-log';
import { onMount } from 'svelte';
import { safeParse, safeParseAsync } from 'valibot';
import { cloneDeep, isEqual } from 'lodash';
import { info } from './logging';
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
	loading = $state(false);
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
		scrollable,
		delaySetup = false
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
		this.scrollable = scrollable;
		if (!delaySetup) {
			$effect(() => {
				this.evaluateAndValidate();
			});
			onMount(() => {
				this.setup();
			});
		}
		info('this.initialValues', this.initialValues);
	}

	reset() {
		info('resetting the form');
		for (const fieldName of Object.keys(this.validateurs)) {
			trace('Registering ' + fieldName);
			this.errors[fieldName] = false;
			this.initialValues[fieldName] = this.form?.[fieldName] ?? null;
		}
	}

	setup() {
		let submitButton = document.querySelector(this.submiter);
		let formEl = document.querySelector(this.formElement);
		formEl.onsubmit = async (e) => {
			e.preventDefault();
			info('Form submitted with id', e.submitter.id);

			if (e.submitter.id !== document.querySelector(this.submiter).id) {
				return;
			}
			this.loading = true;
			info('Submitting form with id', e.submitter.id);
			await this.validateAndTerminate();
			this.loading = false;
		};

		submitButton.onclick = async (e) => {
			e.preventDefault();
			this.loading = true;
			await this.validateAndTerminate();
			this.loading = false;
		};
	}

	async validateAndTerminate() {
		info('Validating form');
		let validData;
		if (this.isAsynchronous) {
			trace('Asynchronous validation');
			info('Asynchronous validation with schema', this.schema);
			validData = await safeParseAsync(this.schema, this.form);
		} else {
			info('Synchronous validation with schema');
			info(typeof this.schema);
			try {
				validData = safeParse(this.schema, this.form);
			} catch (error) {
				console.error('Validation error:', this.schema['~run']);
				validData = safeParse(this.schema, this.form);
			}
		}
		if (validData.success) {
			try {
				await this.onValid(validData.output);
			} catch (error) {
				info(error);
			}
		} else {
			await this.onError(validData);
		}
	}

	async validateAsync() {
		trace('Asynchronous validation');
		return await safeParseAsync(this.schema, this.form);
	}

	validate() {
		return safeParse(this.schema, this.form);
	}

	evaluateAndValidate() {
		info('in evaluateAndValidate with', $state.snapshot(this.form));
		for (const field of Object.keys(this.form)) {
			if (this.touched[field]) {
				trace(field + ' is touched');
				let valFun = this.validateurs[field];
				let val = this.form[field];
				let parsedError = safeParse(valFun, val);
				this.errors[field] = extractErrorForField(parsedError);
			}
		}
	}

	defaultOnError(data) {
		info('in onError with ', data);
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

	extractErrorForField(validationState) {
		if (validationState.issues && validationState.issues.length > 0) {
			for (const issue of validationState.issues) {
				info('issue', issue);
				const fieldName = issue.path?.[0]?.key;
				info('fieldName', fieldName);
				this.errors[fieldName] = issue.message;
			}
		}
	}

	filtrerLesChampsAUpdater(formData) {
		// Here we first create a deep copy of the form data using lodash to not risk hurt the UX
		let data;
		if (!formData) {
			data = cloneDeep($state.snapshot(this.form));
		} else {
			data = cloneDeep(formData);
		}
		for (const field of Object.keys(this.touched)) {
			const isTouched = this.touched[field];
			info('isTouched', isTouched, 'for field', field);
			if (!isTouched) {
				delete data[field];
			}
		}
		return data;
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
