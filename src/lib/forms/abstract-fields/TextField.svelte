<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';

	export let required = undefined;
	export let requiredMessage = 'Ce champ est requis';
	export let name;
	export let autocomplete = undefined;
	export let type = 'text';
	export let id = undefined;
	export let label = '';
	export let parentClass = '';
	export let labelClass = 'text-surface-500 dark:text-surface-300 select-none';
	let clazz = '';
	export { clazz as class };
	export let placeholder = '';
	export let pattern = undefined;
	export let patternMessage = undefined;
	export let onChangeHandler = undefined;
	export let value = null;

	function changeHandlerSetup(node, fn) {
		if (fn) {
			node.addEventListener('input', fn);
		}
		return {
			destroy() {
				if (fn) {
					node.removeEventListener('input', fn);
				}
			}
		};
	}
</script>

<DefaultFieldWrapper class={parentClass}>
	<p class={labelClass}>{label}</p>
	<input
		id={id ?? name}
		{type}
		{required}
		{name}
		{placeholder}
		{autocomplete}
		value={value ? value : null}
		class="input group-[.has-error]/field:border-error-500 {clazz}"
		{pattern}
		data-pristine-pattern-message={patternMessage}
		data-pristine-email-message={type == 'email' ? 'Veuillez saisir un e-mail valide' : undefined}
		data-pristine-required-message={required ? requiredMessage : undefined}
		use:changeHandlerSetup={onChangeHandler} />
</DefaultFieldWrapper>
