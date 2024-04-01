<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';

	export let required = undefined;
	export let requiredMessage = 'Ce champ est requis';
	export let name;
	export let autocomplete = undefined;
	export let id = undefined;
	export let label = '';
	export let parentClass = '';
	export let labelClass = 'text-surface-500 dark:text-surface-300 select-none';
	let clazz = '';
	export { clazz as class };
	export let placeholder = '';
	export let pattern = undefined;
	export let patternMessage = undefined;
	export let value;
	export let readOnly = false;
</script>

<DefaultFieldWrapper class={parentClass}>
	<p class={labelClass}>{label}</p>
	<input
		id={id ?? name}
		type="date"
		readonly={readOnly}
		{required}
		{name}
		{placeholder}
		{autocomplete}
		bind:value={value}
		class="input group-[.has-error]/field:border-error-500 {clazz}"
		{pattern}
		data-pristine-pattern-message={patternMessage}
		data-pristine-required-message={required ? requiredMessage : undefined}
		on:input />
</DefaultFieldWrapper>
