<script>
	import { page } from '$app/state';
	import { t } from '../i18n';

	let { currentSp, patient } = $props();
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
{#snippet breadcrumbsItem(href, label, className, first)}
	<li>
		<div class={['flex', first ? undefined : 'items-center']}>
			{#if !first}
				{@render chevronRight()}
			{/if}
			<a
				{href}
				class={[
					'text-sm font-medium text-gray-500 hover:text-gray-700',
					className,
					!first && 'ml-4'
				]}>{label}</a>
		</div>
	</li>
{/snippet}

<div>
	<nav class="sm:hidden" aria-label="Back">
		<button
			onclick={() => {
				history.back();
			}}
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
		</button>
	</nav>
	<nav class="hidden sm:flex" aria-label="Breadcrumb">
		<ol role="list" class="flex items-center space-x-4">
			{@render breadcrumbsItem('/dashboard/patients', 'Patients', null, true)}
			{@render breadcrumbsItem('/dashboard/patients/' + patient.patient_id, patient.nom)}
			{#if currentSp}
				{@render breadcrumbsItem(
					'/dashboard/patients/' +
						patient.patient_id +
						'/situation-pathologique/' +
						currentSp.sp_id,
					currentSp.motif,
					'max-w-44 truncate'
				)}
				{#if page.route.id.includes('attestations')}
					{@render breadcrumbsItem(
						'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/attestations',
						'Tarification'
					)}
				{:else if page.route.id.includes('seances')}
					{@render breadcrumbsItem(
						'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/seances',
						'Séances'
					)}
				{:else if page.route.id.includes('prescriptions')}
					{@render breadcrumbsItem(
						'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/prescriptions',
						'Prescriptions'
					)}
				{:else if page.route.id.includes('documents')}
					{@render breadcrumbsItem(
						'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/documents',
						'Documents'
					)}
				{/if}
			{/if}
		</ol>
	</nav>
</div>
