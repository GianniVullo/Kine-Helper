<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';
	export let options;
	export let label = '';
	export let parentClass = '';
	export let labelClass = 'text-surface-500 dark:text-surface-300 select-none';
	export let requiredMessage = 'Ce champ est requis';
	export let selectClass = '';
	export let id;
	export let name;
	export let required = false;
	export let placeholder;
	export let value = undefined;
	export let multiple = false;
</script>

<DefaultFieldWrapper class={parentClass}>
	<p class={labelClass}>{label}</p>
	<select
		id={id ?? name}
		{required}
		class="select {selectClass}"
		{multiple}
		{name}
		{placeholder}
		{value}
		data-pristine-required-message={required ? requiredMessage : undefined}>
		{#each options as option}
			<option id={option.id} value={option.value}>{option.label}</option>
		{/each}
	</select>
</DefaultFieldWrapper>
