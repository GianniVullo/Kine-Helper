<script>
	import SimpleSelect from '$lib/cloud/components/forms/fields/SimpleSelect.svelte';
import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';
let { options, name, label, value = $bindable(), onChangeHandler } = $props();
	// export let required = undefined;
	// let clazz = '';
	// export { clazz as class };
	let labelClass = 'text-surface-500 dark:text-surface-300';
</script>

<DefaultFieldWrapper>
	<SimpleSelect bind:value={value} {label} {name} {options} onchange={onChangeHandler} />
</DefaultFieldWrapper>
