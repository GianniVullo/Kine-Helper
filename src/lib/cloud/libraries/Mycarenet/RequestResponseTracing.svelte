<script>
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/xcode.css';
	import xml from 'highlight.js/lib/languages/xml';
	import Modal from '../../libraries/overlays/Modal.svelte';
	import BoutonSecondaireAvecIcone from '../../../components/BoutonSecondaireAvecIcone.svelte';
	import { openModal } from '../../libraries/overlays/modalUtilities.svelte.js';
	import { page } from '$app/state';
	import { listIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import SimpleSelect from '../../../components/forms/fields/SimpleSelect.svelte';

	hljs.registerLanguage('xml', xml);

	let { feedbackController } = $props();
</script>

{#snippet reqResEl(reqs, titre = 'Requêtes')}
	<div class="col-span-1 space-y-2 py-2">
		<h3 class="text-lg font-medium text-gray-900 mb-3">{titre}</h3>
		{#each reqs ?? [] as req}
			<button
				class="rounded border border-black px-1 py-2 text-left shadow"
				onclick={async () => {
					await feedbackController.setRequestResponseById(req.id);
					history.back();
				}}>
				<h3 class="text-base font-semibold text-gray-900">
					{req.metadata?.scenario ?? 'Scenario 1'}
				</h3>
				<span class="text-xs break-all">{req.endpoint}</span><br />
				{#if req.status}
					<strong class="text-xs text-gray-700">Status:</strong>
					<span class="font-medium">{req.status}</span><br />
				{/if}
				<span class="text-sm font-medium">{req.created_at}</span>
			</button>
		{/each}
	</div>
{/snippet}

<Modal
	className="sm:max-w-4xl"
	opened={page.state.modal?.name === 'requestresponseList'}
	title="Historique des requêtes Mycarenet">
	<div class="grid w-full grid-cols-2 gap-x-2 py-4">
		<!-- <SimpleSelect
			options={[
				{ label: 'Requêtes', value: 'request' },
				{ label: 'Réponses', value: 'response' }
			]} /> -->
		{@render reqResEl(page.state.modal?.requests)}
		{@render reqResEl(page.state.modal?.responses, 'Réponses')}
	</div>
</Modal>

<div class="col-span-full mb-5">
	<BoutonSecondaireAvecIcone
		onclick={async () =>
			openModal({
				name: 'requestresponseList',
				requests: await feedbackController.requests(),
				responses: await feedbackController.responses()
			})}
		icon={listIcon}
		iconCSS="w-5 h-5">Consulter l'historique</BoutonSecondaireAvecIcone>
</div>

<div class="col-span-full rounded-lg bg-white lg:col-span-3">
	<h2 class="mb-4 text-xl font-bold text-blue-700">Last Request</h2>
	<ul class="space-y-4">
		{#if feedbackController.request}
			<li class="rounded-lg border border-gray-200 bg-gray-50 p-4">
				<div class="mb-2">
					<strong class="text-gray-700">Endpoint:</strong>
					<span class="break-all">{feedbackController.request.endpoint}</span><br />
					<strong class="text-gray-700">Created At:</strong>
					{feedbackController.request.created_at}
				</div>
				<details class="mt-2">
					<summary class="cursor-pointer text-blue-600 hover:underline">Headers</summary>
					<pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs">{feedbackController.request
							.soapAction}</pre>
				</details>

				<details class="mt-2">
					<summary class="cursor-pointer text-blue-600 hover:underline">XML</summary>
					<pre
						class="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs shadow-inner">{@html hljs.highlight(
							feedbackController.prettify('request'),
							{ language: 'xml' }
						).value}</pre>
				</details>
			</li>
		{:else}
			<li class="text-gray-500">No requests made yet.</li>
		{/if}
	</ul>
</div>
<div class="col-span-full rounded-lg bg-white lg:col-span-3">
	<h2 class="mb-4 text-xl font-bold text-green-700">Last Response</h2>
	<ul class="space-y-4">
		{#if feedbackController.response}
			<li class="rounded-lg border border-gray-200 bg-gray-50 p-4">
				<div class="mb-2">
					<strong class="text-gray-700">Endpoint:</strong>
					<span class="break-all">{feedbackController.response.endpoint}</span><br />
					<strong class="text-gray-700">Status:</strong>
					<span class="font-medium">{feedbackController.response.status}</span><br />
					<strong class="text-gray-700">Created At:</strong>
					{feedbackController.response.created_at}
				</div>
				<details class="mt-2">
					<summary class="cursor-pointer text-blue-600 hover:underline">Headers</summary>
					<pre class="overflow-x-auto rounded bg-gray-100 p-2 text-xs">{feedbackController.response
							.headers}</pre>
				</details>
				<details class="mt-2">
					<summary class="cursor-pointer text-blue-600 hover:underline">XML</summary>
					<pre
						class="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs shadow-inner">{@html hljs.highlight(
							feedbackController.prettify('response'),
							{ language: 'xml' }
						).value}</pre>
				</details>
			</li>
		{:else}
			<li class="text-gray-500">No responses received yet.</li>
		{/if}
	</ul>
</div>
