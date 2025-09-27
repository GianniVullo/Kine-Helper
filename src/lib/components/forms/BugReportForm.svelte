<script>
	import { supabase } from '../../stores/supabaseClient';
	import { SubmitButton, Form, Field, FormSection } from './blocks';
	import { t } from '../../i18n';
	import { appState } from '../../managers/AppState.svelte';
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { maxLength, minLength, object, pipe, boolean, string } from 'valibot';
	import { emailVal } from './validators/baseValidators';
	import BoutonPrincipal from '../BoutonPrincipal.svelte';

	const validateurs = {
		message: pipe(string(), minLength(5), maxLength(2000)),
		titre: pipe(string(), minLength(2), maxLength(100)),
		fullName: pipe(string(), minLength(2), maxLength(100)),
		email: pipe(string(), emailVal()),
		accord: boolean()
	};

	let formHandler = new Formulaire({
		initialValues: {
			message: null,
			titre: null,
			fullName: appState.user.nom + ' ' + appState.user.prenom,
			email: appState.user.email,
			accord: true
		},
		validateurs,
		schema: object(validateurs),
		onValid: async (form) => {
			let { data, error } = await supabase.from('user_messages').insert({
				titre: form.titre,
				message: `from <${appState.user.nom + ' ' + appState.user.prenom}> ${
					appState.user.email
				} : \n ${form.message}`,
				user_id: appState.user.id
			});
			console.log('Form submitted successfully:', data);
			history.back();
		}
	});

	const fieldSchema = [
		{
			id: 'fullName',
			name: 'fullName',
			titre: $t('bugModal', 'label.name'),
			inputType: 'text',
			readonly: true,
			outerCSS: 'col-span-full'
		},
		{
			id: 'email',
			name: 'email',
			titre: $t('form.patient', 'cardLabel.contact'),
			inputType: 'email',
			readonly: true,
			outerCSS: 'col-span-full'
		},
		{
			id: 'titre',
			name: 'titre',
			titre: $t('bugModal', 'title'),
			inputType: 'text',
			outerCSS: 'col-span-full'
		},
		{
			id: 'message',
			name: 'message',
			titre: $t('bugModal', 'label.message'),
			inputType: 'textarea',
			outerCSS: 'col-span-full'
		},
		{
			id: 'accord',
			name: 'accord',
			checkboxLabel: $t('bugModal', 'label.consent'),
			inputType: 'checkbox',
			outerCSS: 'col-span-full'
		}
	];
</script>

<Form className="py-6 px-4" message={formHandler.message}>
	<FormSection titre={$t('sidebar', 'bugReport')} description={$t('bugModal', 'description')}>
		{#each fieldSchema as field}
			<Field
				{field}
				bind:value={formHandler.form[field.name]}
				error={formHandler.errors[field.name]} />
		{/each}
	</FormSection>
	<div class="col-span-full flex items-center justify-around pt-4">
		<BoutonPrincipal
			color="secondary"
			onclick={() => {
				history.back();
			}}>
			{$t('shared', 'cancel')}
		</BoutonPrincipal>
		<SubmitButton />
	</div>
</Form>
