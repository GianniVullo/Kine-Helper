<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';

	export let required = undefined;
	export let name;
	export let checked = undefined;
	export let type = 'checkbox';
	export let id = undefined;
	export let label = '';
	export let parentClass = 'flex items-center space-y-0';
	export let labelClass = 'text-surface-500 dark:text-surface-300 ml-2 select-none';
	let clazz = '';
	export { clazz as class };
	export let placeholder = '';
	export let value = false;

	function changeHandlerSetup(node, fn) {
		node.addEventListener('click', function checkboxing(event) {
			if (node.checked) {
				value = true;
			} else {
				value = false;
			}
		});
		return {
			destroy() {
				node.removeEventListener('change', function checkboxing(event) {
					if (node.checked) {
						value = true;
					} else {
						value = false;
					}
				});
			}
		};
	}
</script>

<DefaultFieldWrapper class={parentClass}>
	<input
		id={id ?? name}
		{type}
		{required}
		{name}
		{placeholder}
		value={value ? value : null}
		{checked}
		class="checkbox group-[.has-error]/field:border-error-500 {clazz}"
		data-pristine-required-message={required ? 'Ce champ est requis' : undefined}
		use:changeHandlerSetup />
	<label class={labelClass} for={id ?? name}>{label}</label>
</DefaultFieldWrapper>
