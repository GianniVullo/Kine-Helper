<script>
	import { page } from '$app/state';
	import dayjs from 'dayjs';
	import { PromiseQueue } from '../../../managers/HistoryManager.svelte';
	import {
		ArrowCircle,
		errorIcon,
		openOutsideIcon,
		successIcon
	} from '../../../ui/svgs/IconSnippets.svelte';
	import Modal from '../../libraries/overlays/Modal.svelte';
	import { openModal } from '../../libraries/overlays/modalUtilities.svelte';
	import BoutonPrincipal from '../../../components/BoutonPrincipal.svelte';

	const promiseQueue = new PromiseQueue();
</script>

<!-- <button
	class="fixed top-0 right-0 m-2 rounded bg-blue-500 p-2 text-white"
	onclick={() => {
		promiseQueue.add({
			table: 'Patients',
			action: 'Update',
			date: dayjs().format('HH:mm'),
			async promesse() {
				return new Promise((resolve) => {
					console.log('resolving');
					setTimeout(() => {
						resolve('done');
					}, 2000);
				}).catch((error) => {
					console.error('Error:', error);
				});
			}
		});
	}}>
	TEST
</button>
<button
	class="fixed top-0 right-20 m-2 rounded bg-red-500 p-2 text-white"
	onclick={() => {
		promiseQueue.add({
			table: 'Séances',
			action: 'Delete',
			date: dayjs().format('HH:mm'),
			promesse: () => {
				return new Promise((_, reject) => {
					setTimeout(() => {
						console.log('rejecting');
						reject('failed');
					}, 2000);
				});
			}
		});
	}}>
	TEST failed
</button> -->

<Modal
	opened={page.state.modal?.name === 'cloudModal'}
	title="Cloud Synchronisation"
	body={'<p>État des opérations de synchronisation avec votre Cloud.' +
		`<br />Opération(s) en cours : ${promiseQueue.operations.filter((p) => p.status === 'pending').length}<br/>Opération(s) terminé(es) avec succès : ${promiseQueue.operations.filter((p) => p.status === 'fulfilled').length}</p>`}>
	<div class="mt-5 mb-3 flow-root">
		<ul role="list" class="mb-3 max-h-96 overflow-y-scroll">
			{#each promiseQueue.operations as { id, table, action, date, status }, index}
				<li>
					<div class="relative pb-8">
						{#if index + 1 !== promiseQueue.operations.length}
							<span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"
							></span>
						{/if}
						<div class="relative flex space-x-3">
							<div>
								<span
									class={[
										'flex size-8 items-center justify-center rounded-full ring-8 ring-white',
										' bg-white'
									]}>
									<!-- promise is pending -->
									{#if status === 'pending'}
										{@render ArrowCircle('size-5 stroke-gray-400 animate-spin')}
									{:else if status === 'fulfilled'}
										{@render successIcon('size-5 stroke-green-400')}
									{:else}
										{@render errorIcon('size-5 stroke-red-400 fill-transparent')}
									{/if}
								</span>
							</div>
							<div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
								<div>
									<p class="text-sm text-gray-500">
										{action} sur <span class="font-medium text-gray-900">{table}</span>
									</p>
								</div>
								<div class="text-right text-sm whitespace-nowrap text-gray-500">
									<time datetime="2020-09-22">{date}</time>
								</div>
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>
	<BoutonPrincipal
		onclick={() => {
			history.back();
		}}
		inner="Ok" />
</Modal>
{#snippet bottomHtml(message, type)}
	{#if type === 'pending'}
		{@render ArrowCircle('size-5 stroke-gray-400 animate-spin')}
	{:else if type === 'completed'}
		{@render successIcon('size-5 stroke-green-400')}
	{:else}
		{@render errorIcon('size-5 stroke-red-400 fill-transparent')}
	{/if}
	<p class="mx-1 mr-2">{message}</p>
	<button class="flex space-x-1" onclick={() => openModal({ name: 'cloudModal' })}>
		<p class="text-sm text-gray-300">voir les détails</p>
		{@render openOutsideIcon('size-5 stroke-gray-400')}
	</button>
{/snippet}

<div class="fixed right-0 bottom-0 h-8 rounded-tl-lg bg-black/80 px-2 py-1 text-white md:w-96">
	<div class="flex items-center text-sm">
		{#if promiseQueue.running}
			{@render bottomHtml('Synchronisation Cloud...', 'pending')}
		{:else if promiseQueue.operations.some((op) => op.status === 'rejected')}
			{@render bottomHtml('Erreur de synchronisation Cloud', 'error')}
		{:else}
			{@render bottomHtml('Cloud synchronisé!', 'completed')}
		{/if}
	</div>
</div>
