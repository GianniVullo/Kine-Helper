<script>
	import { ArrowCircle } from '../../../ui/svgs/IconSnippets.svelte';
	import { Field } from '../blocks';
	import FormSection from './FormSection.svelte';
	import FormSubSection from './FormSubSection.svelte';
	let { open = $bindable(), name, description, formHandler = $bindable(), fields } = $props();
</script>

<FormSection titre={name} className="col-span-full">
	{#each fields as field}
		<Field {field} bind:value={formHandler.form[field.name]} />
		<div class="flex h-full w-5 items-center justify-center">
			<button
				type="button"
				class="text-sm text-gray-600 hover:text-gray-800"
				onclick={() => {
					formHandler.form[field.name] = field.defaultValue;
				}}>
				{@render ArrowCircle('size-5 text-black dark:text-white')}
			</button>
		</div>
	{/each}
</FormSection>
