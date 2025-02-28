<script>
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import MoneyField from './MoneyField.svelte';
	let {
		formField = $bindable(),
		value = $bindable(),
		options,
		id,
		name,
		label,
		label2,
		tarifs,
		errors
	} = $props();

	const getTarifs = (tarifId) => {
		return tarifs.find((t) => t.id === tarifId);
	};

	function onTarifChange(e) {
		const tarif = getTarifs($state.snapshot(value));
		if (formField !== tarif?.valeur) {
			formField = tarif?.valeur;
		}
	}

	function onTarifCustomChange(e) {
		const tarif = getTarifs(value?.id);
		if (formField !== tarif?.valeur) {
			value = undefined;
		}
	}
</script>

<div class="col-span-full flex flex-col space-x-0 space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
	<MoneyField bind:formField {errors} {id} {name} {label} onchange={onTarifCustomChange} />
	<SimpleSelect label={label2} bind:value {options} onchange={onTarifChange} />
</div>
