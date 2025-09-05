<script>
	import TarifsForm from '../../../../lib/components/forms/TarifsForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<TarifsForm {...data} />
