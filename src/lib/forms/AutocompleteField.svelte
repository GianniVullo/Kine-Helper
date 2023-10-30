<script>
	import { Autocomplete, popup } from '@skeletonlabs/skeleton';
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';
	export let query = '';
	export let required = undefined;
	export let name;
	// export let type = 'text';
	export let id = undefined;
	export let label = '';
	export let parentClass = '';
	export let labelClass = 'text-surface-500 dark:text-surface-300 select-none';
	let clazz = '';
	export { clazz as class };
	export let placeholder = 'Recherche...';
	export let pristineValidators = undefined;
	export let options;
	export let onOptionSelection;
	let popupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'bottom'
	};
</script>

<DefaultFieldWrapper class={parentClass}>
	<label class={labelClass} for={id ?? name}>{label}</label>
	<input
		id={id ?? name}
		type="search"
		{required}
		{name}
		{placeholder}
		class="autocomplete input cursor-pointer group-[.has-error]/field:border-error-500 {clazz}"
		{pristineValidators}
		data-pristine-required-message={required ? 'Ce champ est requis' : undefined}
		bind:value={query}
		use:popup={popupSettings} />

	<div
		data-popup="popupAutocomplete"
		class="card hide-scrollbar max-h-48 w-full max-w-sm overflow-scroll bg-surface-300 p-4 shadow-lg dark:bg-surface-700"
		tabindex="-1">
		<Autocomplete bind:input={query} {options} on:selection={onOptionSelection} />
	</div>
</DefaultFieldWrapper>
