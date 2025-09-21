<script>
	import { FormSection, SubmitButton, Field } from '../../../../lib/components/forms/blocks';
	import { appState } from '../../../../lib/managers/AppState.svelte';
</script>

<div class="mt-10">
	<FormSection titre={`Inviter un utilisateur dans ${appState.selectedOrg.name}`}>
		<Field
			field={{
				titre: "Adresse email de l'utilisateur à inviter",
				outerCSS: 'col-span-full',
				inputType: 'email',
				help: "Si l'utilisateur est déjà client chez Kiné Helper, veuillez insérer ici l'adresse email avec laquelle il a créé son compte."
			}} />
		<SubmitButton>Inviter</SubmitButton>
	</FormSection>
</div>
