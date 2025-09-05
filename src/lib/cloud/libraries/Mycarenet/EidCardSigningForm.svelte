<script>
	import { Formulaire } from '../formHandler.svelte.js';
	import { string, pipe, object, length } from 'valibot';
	import { Form, FormSection, Field, SubmitButton } from '../../../components/forms/blocks';

	let { onSuccess } = $props();

	const validateurs = {
		pin: pipe(string(), length(4)),
		ssin: pipe(string(), length(11))
	};
	let formHandler = new Formulaire({
		validateurs,
		schema: object(validateurs),
        initialValues: {
            pin: '9137',
            ssin: '91060827778'
        },
		formElement: '#eid-signing-form',
		submiter: '#eid-signing-btn',
		async onValid(data) {
			console.log(data);
			await onSuccess(data);
		}
	});
	const pinField = {
		name: 'pin',
		inputType: 'text',
		outerCSS: 'col-span-full',
		help: 'Insérer les 4 chiffres de votre code PIN'
	};
	const ssinField = {
		name: 'ssin',
		inputType: 'text',
		outerCSS: 'col-span-full',
		help: 'Insérer votre numéro de registre national (11 chiffres)'
	};
</script>

<Form id="eid-signing-form">
	<FormSection
		titre="Authentification à Mycarenet"
		description="Veuillez insérer le vode PIN de votre carte eid pour signer le message.">
		<Field field={pinField} bind:value={formHandler.form.pin} error={formHandler.errors.pin} />
		<Field field={ssinField} bind:value={formHandler.form.ssin} error={formHandler.errors.ssin} />
	</FormSection>
	<SubmitButton id="eid-signing-btn" />
</Form>
