<script>
	import { page } from '$app/state';
	import AlertDialog from './AlertDialog.svelte';
	import BugReportForm from '../../../components/forms/BugReportForm.svelte';
	import QueueStateDetailModal from '../History/QueueStateDetailModal.svelte';
	import FactureForm from '../../../components/forms/FactureForm.svelte';
	import DocumentSelectionModal from '../../../ui/DocumentSelectionModal.svelte';

	let dialog;
	$effect(() => {
		const modal = page.state.modal;
		if (modal) {
			dialog.open = true;
		} else {
			dialog.open = false;
		}
	});

	const checkComponentModal = (modalName) => {
		const isTrue = page.state.modal?.component && page.state.modal?.component === modalName;
		console.log(modalName, isTrue);
		return isTrue;
	};
</script>

<el-dialog bind:this={dialog}>
	<dialog
		id="dialog"
		aria-labelledby="dialog-title"
		class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent">
		<el-dialog-backdrop
			class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
		></el-dialog-backdrop>

		<div
			tabindex="-1"
			class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0">
			<el-dialog-panel
				class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10">
				{#if !page.state.modal?.component && page.state.modal}
					<AlertDialog {...page.state.modal} />
				{:else if checkComponentModal('factureCreationModal')}
					<FactureForm />
				{:else if checkComponentModal('bugReport')}
					<BugReportForm />
				{:else if checkComponentModal('cloudModal')}
					<QueueStateDetailModal />
				{:else if checkComponentModal('docSelection')}
					<DocumentSelectionModal />
				{/if}
			</el-dialog-panel>
		</div>
	</dialog>
</el-dialog>
