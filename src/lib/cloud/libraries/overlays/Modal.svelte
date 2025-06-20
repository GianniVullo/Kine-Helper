<script>
	import { warningOutlineIcon } from '$lib/ui/svgs/IconSnippets.svelte';
	import { t } from '../../../i18n';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';

	let {
		opened,
		leading,
		leadingCSS,
		iconDivCss,
		header,
		footer,
		children,
		onAccepted,
		buttonTextConfirm = $t('shared', 'confirm'),
		buttonTextConfirmCSS,
		buttonTextCancel = $t('shared', 'cancel'),
		buttonTextCancelCSS,
		title,
		body,
		className = 'sm:max-w-lg'
	} = $props();
</script>

<div class="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	{#if opened}
		<!--
        Background backdrop, show/hide based on modal state.
    
        Entering: "ease-out duration-300"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100"
          To: "opacity-0"
      -->
		<div
			class="fixed inset-0 bg-gray-500/50 transition-opacity"
			in:fade={{ duration: 300, easing: cubicOut }}
			out:fade={{ duration: 200, easing: cubicIn }}>
		</div>

		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<!--
            Modal panel, show/hide based on modal state.
    
            Entering: "ease-out duration-300"
              From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              To: "opacity-100 translate-y-0 sm:scale-100"
            Leaving: "ease-in duration-200"
              From: "opacity-100 translate-y-0 sm:scale-100"
              To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          -->
				<div
					class={[
						'relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6',
						className
					]}
					in:scale={{ duration: 300, easing: cubicOut, start: 0.95 }}
					out:fly={{ duration: 200, easing: cubicIn, y: 16 }}>
					<div class="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
						<button
							onclick={() => history.back()}
							type="button"
							class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
							<span class="sr-only">Close</span>
							<svg
								class="size-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
								data-slot="icon">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div class="sm:flex sm:items-start">
						{#if !children}
							<div
								class={[
									'mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10',
									iconDivCss || 'bg-red-100'
								]}>
								{#if leading}
									{@render leading(leadingCSS)}
								{:else}
									{@render warningOutlineIcon('size-6 text-red-600')}
								{/if}
							</div>
						{/if}
						<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
							<h3 class="text-base font-semibold text-gray-900" id="modal-title">
								{title}
							</h3>
							<div class="mt-2">
								<p class="text-sm text-gray-500">{@html body}</p>
							</div>
							{@render children?.()}
						</div>
					</div>
					{#if footer && !children}
						{@render footer()}
					{:else if children}{:else}
						<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
							<button
								onclick={() => {
									console.log('onAccepted', onAccepted);
									if (onAccepted) {
										onAccepted();
									} else {
										history.back();
									}
								}}
								type="button"
								class={[
									'inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-xs  sm:ml-3 sm:w-auto',
									buttonTextConfirmCSS || 'bg-red-600 hover:bg-red-500'
								]}>{buttonTextConfirm}</button>
							{#if buttonTextCancel !== 'none'}
								<button
									onclick={() => history.back()}
									type="button"
									class={[
										'mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1  ring-inset  sm:mt-0 sm:w-auto',
										buttonTextCancelCSS || 'ring-gray-300 hover:bg-gray-50'
									]}>{buttonTextCancel}</button>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
