<script>
	import SimpleSelect from '../../../../lib/components/forms/fields/SimpleSelect.svelte';
	import ColorForm from './ColorForm.svelte';
	import OrganisationUpsertForm from './OrganisationUpsertForm.svelte';
	import { terminal } from 'virtual:terminal';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<OrganisationUpsertForm />

<ColorForm />
