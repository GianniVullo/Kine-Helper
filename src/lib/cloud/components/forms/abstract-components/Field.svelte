<script>
	import TwUiField from '../fields/TwUIField.svelte';
	import TwUiFileField from '../fields/TwUIFileField.svelte';
	import TwUiRadioGroup from '../fields/TwUIRadioGroup.svelte';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	let { field, value = $bindable(), error, warning } = $props();
</script>

{#if field.inputType === 'radio'}
	<TwUiRadioGroup
		bind:group={value}
		label={field.label}
		description={field.description}
		outerCSS={field.outerCSS}
		options={field.options}
		{error} />
{:else if field.inputType === 'hidden'}
	<input type="hidden" name={field.name} bind:value />
{:else if field.inputType === 'select'}
	<div class={field.outerCSS}>
		<SimpleSelect {...field} bind:value />
	</div>
{:else if field.inputType === 'file'}
	<div class={field.outerCSS}>
		<label for={field.id} class="block text-sm/6 font-medium text-gray-900">{field.titre}</label>
		<TwUiFileField
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
			oninput={(e) => {
				value = Array.from(e.currentTarget.files ?? []);
			}}
			files={value}
			{error} />
	</div>
{:else}
	<div class={field.outerCSS}>
		<label for={field.id} class="block text-sm/6 font-medium text-gray-900 {field.labelCSS}"
			>{field.titre}</label>
		<TwUiField
			id={field.id}
			name={field.name}
			inputType={field.inputType}
			placeholder={field.placeholder}
			checkboxLabel={field.checkboxLabel}
			checkboxDescription={field.checkboxDescription}
			help={field.help}
			leading={field.leading}
			leadingCSS={field.leadingCSS}
			className={field.innerCSS}
			removeArrows={field.removeArrows}
			trailing={field.trailing}
			readonly={field.readonly}
			{warning}
			bind:value
			{error} />
	</div>
{/if}
