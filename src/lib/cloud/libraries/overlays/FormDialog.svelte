<script>
	import { Field } from '../../../components/forms/blocks';

	let { actionId, fields, className } = $props();
</script>

<form id={`${actionId}-form`} class={[className, 'grid grid-cols-6 px-10 py-6']}>
	{#each fields as field}
		<Field {field} />
	{/each}
</form>
