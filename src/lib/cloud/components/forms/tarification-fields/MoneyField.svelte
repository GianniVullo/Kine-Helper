<script>
	import TwUIField from '../fields/TwUIField.svelte';
	let { formField = $bindable(), errors } = $props();
</script>

{#snippet leadingMoney()}
	<span class="text-gray-500 sm:text-sm">€</span>
{/snippet}
{#snippet trailingMoney()}
	<span class="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
{/snippet}

<!--* Price -->
<div class="sm:col-span-4">
	<label for="price" class="block text-sm/6 font-medium text-gray-900">Prix</label>
	<TwUIField
		id="price"
		name="price"
		inputType="text"
		placeholder="0,00"
		leading={leadingMoney}
		trailing={trailingMoney}
		bind:value={formField}
		error={errors.price} />
</div>
