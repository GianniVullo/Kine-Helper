<script>
	import { object, pipe, string, transform } from 'valibot';
	import { Formulaire } from '../../../../lib/cloud/libraries/formHandler.svelte';
	import { Form, FormSection, SubmitButton } from '../../../../lib/components/forms/blocks';
	import ColorPicker from '../../../../lib/components/forms/fields/ColorPicker.svelte';
	import { terminal } from 'virtual:terminal';

	const colorSchema = {
		color: string()
	};

	let colorForm = new Formulaire({
		validateurs: colorSchema,
		schema: pipe(
			object(colorSchema),
			transform((value) => {
				return {
					color: JSON.parse(value.color)
				};
			})
		),
		async onValid(data) {
			terminal.log('Color changed:', data.color);
			const selectedColor = data.color;
			document.documentElement.style.setProperty('--color-sidebar-50', selectedColor['50']);
			document.documentElement.style.setProperty('--color-sidebar-100', selectedColor['100']);
			document.documentElement.style.setProperty('--color-sidebar-200', selectedColor['200']);
			document.documentElement.style.setProperty('--color-sidebar-300', selectedColor['300']);
			document.documentElement.style.setProperty('--color-sidebar-400', selectedColor['400']);
			document.documentElement.style.setProperty('--color-sidebar-500', selectedColor['500']);
			document.documentElement.style.setProperty('--color-sidebar-600', selectedColor['600']);
			document.documentElement.style.setProperty('--color-sidebar-700', selectedColor['700']);
			document.documentElement.style.setProperty('--color-sidebar-800', selectedColor['800']);
			document.documentElement.style.setProperty('--color-sidebar-900', selectedColor['900']);
		},
		formElement: '#color-form',
		submiter: '#color-btn'
	});
</script>

<Form id="color-form" message={colorForm.message}>
	<FormSection
		titre="Personnalisation des couleurs"
		description="Choisissez une couleur pour le tableau de bord.">
		<p class="mb-4 text-sm/6 text-gray-600">
			Sélectionnez une couleur pour personnaliser l'apparence de votre tableau de bord.
		</p>
		<ColorPicker bind:value={colorForm.form.color} />
	</FormSection>
	<SubmitButton id="color-btn" />
</Form>
