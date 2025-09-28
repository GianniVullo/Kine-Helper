<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { info } from '../cloud/libraries/logging';
	import { t } from '../i18n';
	import {
		chevronRightIcon,
		clipBoardDocIcon,
		userIdIcon,
		userMultipleIcon
	} from '../ui/svgs/IconSnippets.svelte';

	let { currentSp, patient } = $props();
	const regex =
		/^\/dashboard\/patients\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/situation-pathologique\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
	const patientRegex =
		/^\/dashboard\/patients\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
	let isSpDetailPage = $derived(regex.test(page.url.pathname));
	let isPatientDetailPage = $derived(patientRegex.test(page.url.pathname));
</script>

{#snippet breadcrumbsItem({ href, label, className, first, icon, isActive, bypass = false })}
	<li>
		<div class={['flex', first ? undefined : 'items-center']}>
			{#if !first}
				{@render chevronRightIcon('size-5 shrink-0 text-gray-400')}
			{/if}
			<button
				onclick={() => {
					info('breadcrumbsItem clicked', isActive);
					if (!isActive || bypass) {
						goto(href);
					}
				}}
				class={[
					'text-sm font-medium text-gray-400 hover:text-gray-700 sm:text-gray-500 dark:hover:text-gray-300 dark:sm:hover:text-gray-400',
					className,
					!first && 'ml-2 sm:ml-4',
					isActive && 'text-indigo-600 dark:text-indigo-300',
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
						isActive: true,
						bypass: true
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
						isActive: true,
						bypass: true
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
						isActive: true,
						bypass: true
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
						isActive: true,
						bypass: true
					})}
				{/if}
			{/if}
		</ol>
	</nav>
</div>
