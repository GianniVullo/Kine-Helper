<script>
	// import { extractErrorForField } from '../../../libraries/formHandler.svelte';
	import FormTitle from './FormTitle.svelte';

	let { id = 'default-form', title, action = undefined, multipart, children, message, className } = $props();
</script>

{#if title}
	<FormTitle titre={title} />
{/if}

{#if message}
	<p class="mt-2 text-sm text-red-600">
		{message}
	</p>
{/if}
<form
	{id}
	{action}
	class={className || "mt-10 flex flex-col items-start w-full"}
	method="POST"
	enctype={multipart ? undefined : 'multipart/form-data'}>
	<div class="space-y-12 w-full">
		{@render children()}
	</div>
</form>
