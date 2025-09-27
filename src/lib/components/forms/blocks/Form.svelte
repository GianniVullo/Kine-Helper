<script>
	import RequiresExitConfirmation from '../../../cloud/components/pages/RequiresExitConfirmation.svelte';
	import FormTitle from './FormTitle.svelte';

	let {
		id = 'default-form',
		title,
		action = undefined,
		multipart,
		children,
		message,
		className,
		isDirty
	} = $props();
</script>

{#if title}
	<FormTitle titre={title} />
{/if}

{#if message}
	<p class="mt-2 text-sm text-red-600">
		{message}
	</p>
{/if}

<RequiresExitConfirmation {isDirty}>
	<form
		{id}
		{action}
		class={className || 'mt-10 flex w-full flex-col items-start'}
		method="POST"
		enctype={multipart ? undefined : 'multipart/form-data'}>
		<div class="w-full space-y-12">
			{@render children()}
		</div>
	</form>
</RequiresExitConfirmation>
