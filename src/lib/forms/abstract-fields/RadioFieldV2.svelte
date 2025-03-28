<script>
	import SimpleSelect from '$lib/cloud/components/forms/fields/SimpleSelect.svelte';
	import DefaultFieldWrapper from './DefaultFieldWrapper.svelte';
	
	let { options, name, label, value = $bindable(), change, required, inline = false, readOnly } = $props();

</script>

<DefaultFieldWrapper>
		<div class:pointer-events-none={readOnly}>
			<SimpleSelect bind:value={value} {label} {name} {options} onchange={change} />
		</div>
</DefaultFieldWrapper>
