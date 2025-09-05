<script>
	import Form from '../../../lib/components/forms/blocks/Form.svelte';
	import FormSection from '../../../lib/components/forms/blocks/FormSection.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<Form title="Mes cabinets">
    <FormSection titre="Informations du cabinet" description="Modifiez les informations de votre cabinet.">
        <p class="text-sm/6 text-gray-600 mb-4">Vous pouvez modifier les informations de votre cabinet, telles que le nom, l'adresse, le téléphone, etc.</p>


    </FormSection>
    <FormSection titre="Rôles et permissions des collègues" description="Gérez les rôles et permissions de vos collègues.">
        <p class="text-sm/6 text-gray-600 mb-4">Vous pouvez ajouter ou supprimer des collègues, ainsi que gérer leurs rôles et permissions.</p>
    </FormSection>
</Form>