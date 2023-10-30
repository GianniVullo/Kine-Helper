<script>
    import DefaultFieldWrapper from "./DefaultFieldWrapper.svelte";
	export let options;
	export let name;
    export let required = undefined;
    let clazz = '';
    export { clazz as class}
    let labelClass = 'text-surface-500 dark:text-surface-300';
    export let label;
    export let nameClass = 'text-surface-500 dark:text-surface-300';
	export let pristineValidators = undefined;
	export let onChangeHandler = undefined;

	function changeHandlerSetup(node, fn) {
		if (fn) {
			node.addEventListener('change', fn);
		}
		return {
			destroy() {
				node.removeEventListener('change', fn);
			}
		};
	}
</script>

<DefaultFieldWrapper>
    <div class={clazz ? clazz : 'space-2 flex flex-col flex-wrap justify-between select-none'}>
        <p class={nameClass}>{label}</p>
        <div class="flex justify-start items-start flex-wrap p-2">
            {#each options as option, i (i)}
                <label class="flex mr-4 last:mr-0 mb-2 last:mb-0 sm:mb-0 items-start space-x-2">
                    <input
                        id={option.id ?? name}
                        class="radio"
                        type="radio"
                        checked={option.checked}
                        {name}
                        value={option.value}
                            {pristineValidators}
                            {required}
                            data-pristine-required-message={required ? 'Ce champ est requis' : undefined}
                        use:changeHandlerSetup={onChangeHandler} />
                    <p class={labelClass}>{option.label ?? name}</p>
                </label>
            {/each}
        </div>
    </div>
</DefaultFieldWrapper>
