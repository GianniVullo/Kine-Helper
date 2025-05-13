<script>
	import BoutonPrincipal from '../../../components/BoutonPrincipal.svelte';
	import { appState } from '../../../managers/AppState.svelte';
	import { ArrowCircle, clock, errorIcon, successIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import Modal from '../overlays/Modal.svelte';
	import { page } from '$app/state';

	let historyManager = appState.queue;
	$effect(() => {
		console.log('historyManager', $state.snapshot(historyManager.promiseQueue.operations));
	});
</script>

<Modal
	opened={page.state.modal?.name === 'cloudModal'}
	title="Cloud Synchronisation"
	body={'<p>État des opérations de synchronisation avec votre Cloud.' +
		`<br />Opération(s) en cours : ${historyManager.promiseQueue.operations.filter((p) => p.status === 'pending').length}<br/>Opération(s) terminé(es) avec succès : ${historyManager.promiseQueue.operations.filter((p) => p.status === 'fulfilled').length}</p>`}>
	<div class="mt-5 mb-3 flow-root">
		<ul role="list" class="mb-3 max-h-96 overflow-y-scroll">
			{#each historyManager.promiseQueue.operations as { label, date, status }, index}
				<li>
					<div class="relative pb-8">
						{#if index + 1 !== historyManager.promiseQueue.operations.length}
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
										{@render clock('size-5 stroke-gray-400')}
									{:else if status === 'running'}
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
										{label}
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
