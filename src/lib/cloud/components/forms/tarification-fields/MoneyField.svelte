<script>
	import TwUIField from '../fields/TwUIField.svelte';
	let {
		formField = $bindable(),
		name,
		id,
		error,
		label,
		help,
		outerCSS = 'sm:col-span-4',
		onchange
	} = $props();
</script>

{#snippet leadingMoney()}
	<span class="text-gray-500 sm:text-sm">€</span>
{/snippet}
{#snippet trailingMoney()}
	<span class="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
{/snippet}

<!--* Price -->
<div class={outerCSS}>
	<label for={id} class="block text-sm/6 font-medium text-gray-900">{label}</label>
	<TwUIField
		{id}
		{name}
		{onchange}
		inputType="text"
		placeholder="0,00"
		{help}
		leading={leadingMoney}
		trailing={trailingMoney}
		bind:value={formField}
		{error} />
</div>
