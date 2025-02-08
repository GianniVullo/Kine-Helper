import * as v from 'valibot';

//* API de validation de formulaire
/**
 ** les features nécessaires :
 **     - fournir un context au formulaire :
 **         - Touched : est-ce que le formulaire a été touché par l'utilisateur
 **     - contrôle du submiter : désactiver la soumission du formulaire pendant la validation
 **     - Validation grâce à Valibot
 **     - Exécution de fonctions "life cycle hook"
 **          - onSubmit
 **          - onError : de base : scroller en haut du form où il y aura un message avec tous les champs fautifs
 **          - onResult
 */

function defaultOnError(data) {
	console.log('in onError with ', data);
	window.scrollTo({ top: 0, behavior: 'smooth' });
}
export class Formulaire {
	form = $state({});
	submiter;
	schema;
	onError;
	onValid;
	isAsynchronous = false;

	constructor({ schema, submiter = '#submit-button', initialValues, onValid, onError }) {
		console.log('IN Formulaire constructor');

		this.submiter = submiter;
		console.log('Assigned submiter');
		for (const fieldName of Object.keys(schema.entries)) {
			this.form[fieldName] =
				initialValues?.[fieldName] ?? schema.entries[fieldName].default ?? null;
		}
		this.schema = schema;
		this.onValid = onValid.bind(this);
		if (onError) {
			this.onError = onError.bind(this);
		} else {
			this.onError = defaultOnError.bind(this);
		}
	}

	setup() {
		console.log('In Formulaire.setup with');

		let submitButton = document.querySelector(this.submiter);

		submitButton.onclick = async (e) => {
			e.preventDefault();
			e.target.disabled = true;
			let validData;
			if (this.isAsynchronous) {
				validData = await v.safeParseAsync(this.schema, this.form);
			} else {
				validData = v.safeParse(this.schema, this.form);
			}
			if (validData.success) {
				await this.onValid(validData.output);
			} else {
				await this.onError(validData.output);
			}
			e.target.disabled = false;
		};
	}
}

export function extractErrorForField(fieldName, validationState) {
	let errors = [];
	let errorFields = [];
	if (validationState.issues && validationState.issues.length > 0) {
		for (const issue of validationState.issues) {
			errorFields.push(issue.path?.[0]?.key);
			if (issue.path?.[0]?.key === fieldName || fieldName === '*') {
				errors.push(issue.message);
			}
		}
	}
	return { errorString: errors.join('<br />'), errorFields: errorFields.join(', ') };
}
