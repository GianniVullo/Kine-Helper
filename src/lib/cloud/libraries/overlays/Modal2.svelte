<script>
	import { warningOutlineIcon } from '$lib/ui/svgs/IconSnippets.svelte';
	import { t } from '../../../i18n';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { page } from '$app/state';

	let opened,
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
		className = 'sm:max-w-lg';
	$effect(() => {
		if (page.state.modal) {
			opened = page.state.modal.type;
			title = page.state.modal.title;
			body = page.state.modal.body;
			leading = page.state.modal.leading;
			leadingCSS = page.state.modal.leadingCSS;
			iconDivCss = page.state.modal.iconDivCss;
			onAccepted = page.state.modal.onAccepted;
			header = page.state.modal.header;
			footer = page.state.modal.footer;
			buttonTextConfirm = page.state.modal.buttonTextConfirm || buttonTextConfirm;
			buttonTextConfirmCSS = page.state.modal.buttonTextConfirmCSS || buttonTextConfirmCSS;
			buttonTextCancel = page.state.modal.buttonTextCancel || buttonTextCancel;
			buttonTextCancelCSS = page.state.modal.buttonTextCancelCSS || buttonTextCancelCSS;
		}
	});
</script>

<el-dialog open={opened === 'confirm' ? true : undefined}>
	<dialog
		id="dialog"
		aria-labelledby="dialog-title"
		class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent">
		<el-dialog-backdrop
			class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
		></el-dialog-backdrop>

		<div
			class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0">
			<el-dialog-panel
				class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95">
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
			</el-dialog-panel>
		</div>
	</dialog>
</el-dialog>
