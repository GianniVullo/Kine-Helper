<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { t } from '../i18n';
	import {
		clipBoardDocIcon,
		homeIcon,
		userIcon,
		userIdIcon,
		userMultipleIcon
	} from '../ui/svgs/IconSnippets.svelte';
	import { terminal } from 'virtual:terminal';

	let { currentSp, patient } = $props();
	const regex =
		/^\/dashboard\/patients\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/situation-pathologique\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
	const patientRegex =
		/^\/dashboard\/patients\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
	let isSpDetailPage = $derived(regex.test(page.url.pathname));
	let isPatientDetailPage = $derived(patientRegex.test(page.url.pathname));
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
{#snippet breadcrumbsItem({ href, label, className, first, icon, isActive })}
	<li>
		<div class={['flex', first ? undefined : 'items-center']}>
			{#if !first}
				{@render chevronRight()}
			{/if}
			<button
				onclick={() => {
					terminal.log('breadcrumbsItem clicked', isActive);
					if (!isActive) {
						goto(href);
					}
				}}
				class={[
					'text-sm font-medium text-gray-500 hover:text-gray-700',
					className,
					!first && 'ml-2 sm:ml-4',
					isActive && 'text-indigo-600',
					!isActive && 'hover:underline'
				]}>
				{#if icon}
					<div class={{ 'hidden sm:block': icon, 'stroke-indigo-600': isActive }}>
						{label}
					</div>
					<div class="block sm:hidden">{@render icon('size-5')}</div>
				{:else}
					{label}
				{/if}
			</button>
		</div>
	</li>
{/snippet}

<div>
	<!-- <nav class="sm:hidden" aria-label="Back">
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
	</nav> -->
	<nav class="flex" aria-label="Breadcrumb">
		<ol role="list" class="flex items-center space-x-2 sm:space-x-4">
			{@render breadcrumbsItem({
				href: '/dashboard/patients',
				label: $t('sidebar', 'patients', {}, 'Patients'),
				first: true,
				icon: userMultipleIcon
			})}
			{@render breadcrumbsItem({
				href: '/dashboard/patients/' + patient.patient_id,
				label: patient.nom,
				icon: userIdIcon,
				isActive: isPatientDetailPage
			})}
			{#if currentSp}
				{@render breadcrumbsItem({
					href:
						'/dashboard/patients/' +
						patient.patient_id +
						'/situation-pathologique/' +
						currentSp.sp_id,
					label: currentSp.motif,
					className: 'max-w-44 truncate',
					first: false,
					icon: clipBoardDocIcon,
					isActive: isSpDetailPage
				})}
				{#if page.route.id.includes('attestations')}
					{@render breadcrumbsItem({
						href:
							'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/attestations',
						label: 'Tarification',
						isActive: true
					})}
				{:else if page.route.id.includes('seances')}
					{@render breadcrumbsItem({
						href:
							'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/seances',
						label: $t('patients.detail', 'prestations', {}, 'Sessions'),
						isActive: true
					})}
				{:else if page.route.id.includes('prescriptions')}
					{@render breadcrumbsItem({
						href:
							'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/prescriptions',
						label: $t('sp.detail', 'prescriptions', {}, 'Prescriptions'),
						isActive: true
					})}
				{:else if page.route.id.includes('documents')}
					{@render breadcrumbsItem({
						href:
							'/dashboard/patients/' +
							patient.patient_id +
							'/situation-pathologique/' +
							currentSp.sp_id +
							'/documents',
						label: $t('sp.detail', 'documents', {}, 'Documents'),
						isActive: true
					})}
				{/if}
			{/if}
		</ol>
	</nav>
</div>
