<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';

	export let required = undefined;
	export let parentClass = '';
	export let labelClass = 'text-surface-500 dark:text-surface-300 ml-2 select-none';
	let clazz = '';
	export { clazz as class };
	export let value = false;
	export let options;

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

<DefaultFieldWrapper class="flex items-center space-y-0 {parentClass}">
	{#each options as option}
	<label class={option.labelClass ?? labelClass} for={option.id ?? option.name}>{option.label}
		<input
		id={option.id ?? option.name}
		type="checkbox"
		{required}
		name={option.name}
		value={option.checked ?? false}
		checked={option.checked}
		class="checkbox group-[.has-error]/field:border-error-500 {clazz}"
		data-pristine-required-message={required ? 'Ce champ est requis' : undefined}
		use:changeHandlerSetup />
	</label>
	{/each}
</DefaultFieldWrapper>
