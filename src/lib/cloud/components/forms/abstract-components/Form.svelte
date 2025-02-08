<script>
	import { extractErrorForField } from '../../../libraries/formHandler.svelte';
	import FormTitle from './FormTitle.svelte';

	let { title, action = undefined, multipart, inner, validationState } = $props();
	console.log('End of form.svelte');
	console.log(validationState);
</script>

{#if title}
	<FormTitle titre={title} />
{/if}

{#if validationState?.issues?.length > 0}
	<p class="mt-2 text-sm text-red-600">
		Le formulaire comporte une erreur sur le ou les champs suivants : {extractErrorForField(
			'*',
			validationState
		).errorFields}
	</p>
{/if}
<form
	{action}
	onsubmit={(e) => e.preventDefault()}
	class="mt-10 flex flex-col items-start"
	method="POST"
	enctype={multipart ? undefined : 'multipart/form-data'}>
	<div class="space-y-12">
		{@render inner()}
	</div>
</form>
