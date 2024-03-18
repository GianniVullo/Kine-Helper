<script>
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	export let options;
	export let name;
	export let required = undefined;
	export let label;
	export let inline = false;
	export let value;
</script>

<DefaultFieldWrapper>
	<h3 class="select-none text-surface-500 dark:text-surface-300">{label}</h3>
	<RadioGroup display={inline ? undefined : 'flex-col'}>
		{#each options as option, i (i)}
			<RadioItem {required} on:change bind:group={value} {name} value={option.value}
				>{option.label}</RadioItem>
		{/each}
	</RadioGroup>
</DefaultFieldWrapper>
