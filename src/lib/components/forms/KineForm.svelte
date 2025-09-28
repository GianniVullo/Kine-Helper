<script>
	import { get } from 'svelte/store';
	import Form from './blocks/Form.svelte';
	import FormSection from './blocks/FormSection.svelte';
	import { t } from '../../i18n';

	let { formHandler = $bindable() } = $props();
	// if (!formHandler) {
	// 	formHandler = buildUserDataFormHandler({});
	// }
	export const fieldsSchema = [
		{
			id: 0,
			titre: 'Données Personnelles',
			description: '',
			fields: [
				{
					id: 'nom',
					name: 'nom',
					inputType: 'text',
					placeholder: get(t)('shared', 'name'),
					titre: get(t)('shared', 'name'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'prenom',
					name: 'prenom',
					inputType: 'text',
					placeholder: get(t)('shared', 'surname'),
					titre: get(t)('shared', 'surname'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'gsm',
					name: 'gsm',
					inputType: 'text',
					placeholder: 'Téléphone',
					titre: 'Téléphone',
					help: null,
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				}
			]
		},
		{
			id: 1,
			titre: 'Données professionnelles',
			description: '',
			fields: [
				{
					id: 'adresse',
					name: 'adresse',
					inputType: 'text',
					placeholder: get(t)('shared', 'address'),
					titre: get(t)('shared', 'address'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-full',
					innerCSS: ''
				},
				{
					id: 'cp',
					name: 'cp',
					inputType: 'text',
					removeArrows: true,
					placeholder: get(t)('form.postSignup', 'label.postCode'),
					titre: get(t)('form.postSignup', 'label.postCode'),
					help: null,
					outerCSS: 'col-span-2',
					innerCSS: ''
				},
				{
					id: 'localite',
					name: 'localite',
					inputType: 'text',
					placeholder: get(t)('form.postSignup', 'label.city'),
					titre: get(t)('form.postSignup', 'label.city'),
					help: null,
					outerCSS: 'col-span-4',
					innerCSS: ''
				},
				{
					id: 'inami',
					name: 'inami',
					inputType: 'text',
					placeholder: 'INAMI',
					titre: 'INAMI',
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'bce',
					name: 'bce',
					inputType: 'text',
					placeholder: get(t)('form.postSignup', 'label.bce'),
					titre: get(t)('form.postSignup', 'label.bce'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'iban',
					name: 'iban',
					inputType: 'text',
					placeholder: 'IBAN : BEXX XXXX XXXX XXXX',
					titre: get(t)('login', 'label.iban'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'conventionne',
					name: 'conventionne',
					inputType: 'checkbox',
					checkboxLabel: get(t)('form.postSignup', 'label.convention'),
					help: null,
					checkboxDescription: 'Cochez cette case si vous êtes conventionné.',
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				}
			]
		}
	];
</script>

<Form id="user-data-form" className="flex flex-col items-start w-full">
	{#each fieldsSchema as { titre, description, fields }}
		<FormSection
			{titre}
			{description}
			{fields}
			bind:form={formHandler.form}
			errors={formHandler.errors} />
	{:else}
		Error : no section!
	{/each}
</Form>

<!-- {JSON.stringify(formHandler.form)} -->

<!-- <FormWrapper class={'group/form flex flex-col space-y-2 px-4' + clazz} {formSchema}>
	<h1 class="text-surface-600">{$t('form.postSignup', 'title')}</h1>
	<p class="text-surface-500 dark:text-surface-400">
		{$t('form.postSignup', 'description')}
	</p>
	<div class:md:flex-row={!column} class="flex flex-col">
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<input type="hidden" name="user_id" value={appState.user.id} />
				<TextField
					name="nom"
					value={appState.user.nom ?? undefined}
					required
					label={$t('shared', 'name')}
					placeholder={$t('shared', 'name')} />
				<TextField
					name="prenom"
					value={appState.user.prenom ?? undefined}
					required
					label={$t('shared', 'surname')}
					placeholder={$t('shared', 'surname')} />
				<TextField
					name="adresse"
					value={appState.user.adresse ?? undefined}
					required
					placeholder={$t('shared', 'address')}
					label={$t('shared', 'address')} />
				<TextField
					name="cp"
					value={appState.user.cp ?? undefined}
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage={$t('form.postSignup', 'validation.postCode')}
					required
					placeholder={$t('form.postSignup', 'label.postCode')}
					label={$t('form.postSignup', 'label.postCode')} />
				<TextField
					name="localite"
					value={appState.user.localite ?? undefined}
					required
					placeholder={$t('form.postSignup', 'label.city')}
					label={$t('form.postSignup', 'label.city')} />
				<!-- <TextField
					name="gsm"
					value={appState.user.gsm ?? undefined}
					placeholder={$t('form.postSignup', 'label.cellPhone')}
					label={$t('form.postSignup', 'label.cellPhone')} /> 
			</SectionCard>
		</div>
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<TextField
					name="inami"
					value={appState.user.inami ?? undefined}
					required
					pattern={/^\d{11}$/}
					patternMessage={$t('form.postSignup', 'validation.inami')}
					label="INAMI"
					placeholder="INAMI" />
				<IbanField value={appState.user.iban ?? undefined} />
				<TextField
					name="bce"
					value={appState.user.bce ?? undefined}
					required
					pattern={/^\d{10}$/}
					patternMessage={$t('form.postSignup', 'validation.bce')}
					label={$t('form.postSignup', 'label.bce')}
					placeholder={$t('form.postSignup', 'label.bce')} />
				<CheckboxField
					name="conventionne"
					value={appState.user.conventionne ?? undefined ?? true}
					checked={appState.user.conventionne ?? undefined ?? true}
					label={$t('form.postSignup', 'label.convention')} />
			</SectionCard>
			<SubmitButton class="m-4 md:m-8" />
		</div>
	</div>
	<div class="font-semibold">{message}</div>
</FormWrapper> -->
