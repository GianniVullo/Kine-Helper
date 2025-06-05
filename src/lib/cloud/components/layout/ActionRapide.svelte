<script>
	import { calendarIcon, cogIcon, euroIcon, userIcon } from '../../../ui/svgs/IconSnippets.svelte';

	let { actionRapides, label } = $props();
</script>

{#if !label}
	<h2 class="mt-20 text-base font-semibold text-gray-900">Actions rapides</h2>
	<p class="mt-1 text-sm text-gray-500">
		Utilisez les actions rapides ci-dessous pour démarrer rapidement votre session.
	</p>
{:else}
	{@render label()}
{/if}
<ul role="list" class:mt-6={label} class="divide-y divide-gray-200 border-t border-b border-gray-200">
	{#each actionRapides as { icon, titre, description, href, onclick, className }}
		<li>
			<div class="group relative flex items-start space-x-3 py-4">
				<div class="shrink-0">
					<span class={['inline-flex size-10 items-center justify-center rounded-lg', className]}>
						{@render icon('size-6 text-white')}
					</span>
				</div>
				<div class="min-w-0 flex-1">
					<div class="text-sm font-medium text-gray-900">
						{#if onclick}
							<button {onclick}>{titre}</button>
						{:else}
							<a {href}>
								<span class="absolute inset-0" aria-hidden="true"></span>
								{titre}
							</a>
						{/if}
					</div>
					<p class="text-sm text-gray-500">{description}</p>
				</div>
				<div class="shrink-0 self-center">
					<svg
						class="size-5 text-gray-400 group-hover:text-gray-500"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon">
						<path
							fill-rule="evenodd"
							d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd" />
					</svg>
				</div>
			</div>
		</li>
	{/each}
</ul>
