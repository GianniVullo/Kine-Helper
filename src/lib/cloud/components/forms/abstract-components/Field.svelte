<script>
	import TwUiField from '../fields/TwUIField.svelte';
	import TwUiRadioGroup from '../fields/TwUIRadioGroup.svelte';
	let { field, value = $bindable(), error } = $props();
</script>

{#if field.inputType === 'radio'}
	<TwUiRadioGroup
		bind:group={value}
		label={field.label}
		description={field.description}
		outerCSS={field.outerCSS}
		options={field.options}
		{error} />
{:else}
	<div class={field.outerCSS}>
		<label for={field.id} class="block text-sm/6 font-medium text-gray-900">{field.titre}</label>
		<TwUiField
			id={field.id}
			name={field.name}
			inputType={field.inputType}
			placeholder={field.placeholder}
			help={field.help}
			leading={field.leading}
			leadingCSS={field.leadingCSS}
			className={field.innerCSS}
			removeArrows={field.removeArrows}
			trailing={field.trailing}
			readonly={field.readonly}
			bind:value
			{error} />
	</div>
{/if}
