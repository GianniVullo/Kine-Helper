<script>
	import MoneyField from './MoneyField.svelte';
	let { value = $bindable(), id, name, label, error, outerCSS, help } = $props();	
</script>

<input type="hidden" name={name + 'id'} value={value.id} />
<input type="hidden" name={name + 'nom'} value={value.nom} />
<input type="hidden" name={name + 'created_at'} value={value.created_at} />
<input type="hidden" name={name + 'user_id'} value={value.user_id} />
<MoneyField
	{outerCSS}
	bind:formField={value.valeur}
	{error}
	{id}
	{name}
	{help}
	{label} />
