<script>
	import DefaultFieldWrapper from '../../abstract-fields/DefaultFieldWrapper.svelte';
	export let name;
	export let id = null;
	export let value;
	export let label = null;
    export let required = false;
</script>

<DefaultFieldWrapper class="flex flex-col items-start justify-start">
	{#if label}
		<h5 class="select-none text-surface-500 dark:text-surface-300">
			{label}
		</h5>
	{/if}
	<div>
		<input {required} type="time" {name} id={id ?? name} class="input" bind:value on:change />
	</div>
</DefaultFieldWrapper>
