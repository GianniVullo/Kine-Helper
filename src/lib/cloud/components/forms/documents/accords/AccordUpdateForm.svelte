<script>
	import { Formulaire } from '../../../../libraries/formHandler.svelte';
	import { t } from '../../../../../i18n';
	import Form from '../../abstract-components/Form.svelte';
	import FormSection from '../../abstract-components/FormSection.svelte';
	import SubmitButton from '../../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../../managers/AppState.svelte';
	import Field from '../../abstract-components/Field.svelte';
	import SituationPathologiqueSelector from '../../../../../forms/documents/SituationPathologiqueSelector.svelte';
	import dayjs from 'dayjs';
	import { isoDate, object, string, uuid } from 'valibot';
	import { arrowRightIcon, arrowBottomIcon } from '../../../../../ui/svgs/IconSnippets.svelte';
	import { filtrerLesChampsAUpdater } from '../../../../database';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { uuidVal } from '../../validators/commons';

	let { patient, sp, docType = 'A', mode = 'create', accord } = $props();

	const validateurs = {
		id: uuidVal,
		valid_from: isoDate(),
		valid_to: isoDate(),
		reference: string()
	};

	let formHandler = new Formulaire({
		validateurs,
		formElement: '#accord-update-form',
		schema: object(validateurs),
		submiter: '#accord-update-submit',
		async onValid(data) {
			let fields = filtrerLesChampsAUpdater(this.touched, data);
			console.log('AccordUpdateForm onValid', page.state.drawer?.accordId);
			const { data: _, error } = await appState.db.update(
				'accords',
				[['id', page.state.drawer?.accordId]],
				fields
			);
			if (error) {
				this.message = error;
			}
			for (const field of Object.keys(data)) {
				accord[field] = data[field];
			}
			history.back();
		},
		mode
	});

	const datefield = (name, titre, placeholder) => {
		return {
			id: name,
			name: name,
			inputType: 'date',
			placeholder: placeholder,
			titre: titre,
			help: null,
			outerCSS: 'col-span-full sm:col-span-2',
			innerCSS: ''
		};
	};

	const fields = {
		id: {
			id: 'id',
			name: 'id',
			inputType: 'hidden'
		},
		valid_from: datefield('valid_from', 'Début de la validité', 'Date de début'),
		valid_to: datefield('valid_to', 'Fin de la validité', 'Date de fin'),
		reference: {
			id: 'reference',
			name: 'reference',
			inputType: 'text',
			placeholder: 'Référence',
			titre: 'Référence',
			help: null,
			outerCSS: 'col-span-full sm:col-span-2',
			innerCSS: ''
		}
	};
	$effect(() => {
		if (accord) {
			untrack(() => {
				formHandler.form.id = accord.id ?? crypto.randomUUID();
				formHandler.form.valid_from = accord.valid_from;
				formHandler.form.valid_to = accord.valid_to;
				formHandler.form.reference = accord.reference ?? '';
			});
		}
	});
</script>

<Form id="accord-update-form" message={formHandler.message}>
	<FormSection
		titre="Informations générales"
		description="Veuillez sélectionner la date et situation pathologique.">
		<div class="col-span-full grid grid-cols-8 gap-4">
			<div class="col-span-full sm:col-span-3">
				<Field field={fields.valid_from} bind:value={formHandler.form.valid_from} />
			</div>
			<div class="hidden items-center justify-center sm:col-span-2 sm:flex">
				{@render arrowRightIcon('size-6')}
			</div>
			<div class="col-span-full flex w-full items-center justify-center sm:hidden">
				{@render arrowBottomIcon('size-6')}
			</div>
			<div class="col-span-full sm:col-span-3">
				<Field field={fields.valid_to} bind:value={formHandler.form.valid_to} />
			</div>
		</div>
		<div class="col-span-full">
			<Field field={fields.reference} bind:value={formHandler.form.reference} />
		</div>
	</FormSection>
	<SubmitButton id="accord-update-submit" className="col-span-full" loading={formHandler.loading} />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
