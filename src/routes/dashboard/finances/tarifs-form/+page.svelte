<script>
	import TarifsForm from '../../../../lib/cloud/components/forms/finances/TarifsForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<TarifsForm {...data} />
