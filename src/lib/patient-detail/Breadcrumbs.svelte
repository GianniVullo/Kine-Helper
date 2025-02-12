<script>
	import { page } from '$app/stores';
	import { t } from '../i18n';
	let { currentSp, patient } = $props();
	
	let boutonRetour = $derived(
		$page.params.spId ? '/dashboard/patients/' + patient.patient_id : '/dashboard/patients/'
	);
</script>

{#snippet chevronRight()}
	<svg
		class="size-5 shrink-0 text-gray-400"
		viewBox="0 0 20 20"
		fill="currentColor"
		aria-hidden="true"
		data-slot="icon">
		<path
			fill-rule="evenodd"
			d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
			clip-rule="evenodd" />
	</svg>
{/snippet}

<div>
	<nav class="sm:hidden" aria-label="Back">
		<a
			href={boutonRetour}
			class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
			<svg
				class="-ml-1 mr-1 size-5 shrink-0 text-gray-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
					clip-rule="evenodd" />
			</svg>
			Retour
		</a>
	</nav>
	<nav class="hidden sm:flex" aria-label="Breadcrumb">
		<ol role="list" class="flex items-center space-x-4">
			<li>
				<div class="flex">
					<a
						href="/dashboard/patients"
						class="text-sm font-medium text-gray-500 hover:text-gray-700">Patients</a>
				</div>
			</li>
			<li>
				<div class="flex items-center">
					{@render chevronRight()}
					<a
						href={'/dashboard/patients/' + patient.patient_id}
						class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">{patient.nom}</a>
				</div>
			</li>
			{#if currentSp}
				<li>
					<div class="flex items-center">
						{@render chevronRight()}
						<a
							href={'/dashboard/patients/' +
								patient.patient_id +
								'/situation-pathologique/' +
								currentSp.sp_id}
							aria-current="page"
							class="ml-4 max-w-44 truncate text-sm font-medium text-gray-500 hover:text-gray-700"
							>{currentSp.motif}</a>
					</div>
				</li>
			{/if}
		</ol>
	</nav>
</div>
