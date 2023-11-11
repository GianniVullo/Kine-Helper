<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';

	export let required = undefined;
	export let name;
	export let id = undefined;
	export let label = '';
	export let parentClass = 'flex items-center space-y-0';
	export let labelClass = 'text-surface-500 dark:text-surface-300 ml-2 select-none';
	let clazz = '';
	export { clazz as class };
	export let placeholder = '';
	export let value;
</script>

<DefaultFieldWrapper class={parentClass}>
	<input
		id={id ?? name}
		type="checkbox"
		{required}
		{name}
		{placeholder}
		bind:checked={value}
		on:change
		class="checkbox group-[.has-error]/field:border-error-500 {clazz}"
		data-pristine-required-message={required ? 'Ce champ est requis' : undefined} />
	<label class={labelClass} for={id ?? name}>{label}</label>
</DefaultFieldWrapper>
