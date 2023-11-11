<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';
	export let options;
	export let label = '';
	export let parentClass = '';
	export let labelClass = 'text-surface-500 dark:text-surface-300 select-none';
	export let requiredMessage = 'Ce champ est requis';
	export let selectClass = '';
	export let id = null;
	export let name;
	export let required = false;
	export let placeholder = undefined;
	export let value;
</script>

<DefaultFieldWrapper class={parentClass}>
	<p class={labelClass}>{label}</p>
	<select
		id={id ?? name}
		{required}
		class="select rounded-lg {selectClass}"
		{name}
		{placeholder}
		bind:value={value}
		data-pristine-required-message={required ? requiredMessage : undefined}
		on:input>
		{#if placeholder}
			<option value="undefined" disabled selected>{placeholder}</option>
		{/if}
		{#each options as option}
			<option id={option.id} value={option.value}>{option.label}</option>
		{/each}
	</select>
</DefaultFieldWrapper>
