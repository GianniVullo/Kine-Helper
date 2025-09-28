<script>
	import { t } from '../../../../../../lib/i18n';
	import { goto } from '$app/navigation';
	import EmptyState from '../../../../../../lib/components/EmptyState.svelte';

	let { data } = $props();
	let { patient, sp } = data;
</script>

<div class="flex w-full flex-col">
	<!--* Add the first prescription -->
	{#if sp.prescriptions.length === 0}
		<EmptyState
			className="!text-start"
			titre={$t('sp.detail', 'content.start') + ' ' + $t('sp.detail', 'button.start').toLowerCase()}
			buttonText={'New Prescription'}
			onclick={() => {
				goto(
					`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`
				);
			}}>
			{#snippet icon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-12 text-gray-400">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
				</svg>
			{/snippet}
		</EmptyState>
	{/if}

	{#if sp.prescriptions.length > 0 && sp.seances.length === 0}
		<EmptyState
			className="!text-start"
			titre={$t('sp.detail', 'content.start') +
				' ' +
				$t('sp.detail', 'button.start2').toLowerCase()}
			buttonText={'Créez votre première séance'}
			onclick={() => {
				goto(
					`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create`
				);
			}}>
			{#snippet icon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-12 text-gray-400">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
				</svg>
			{/snippet}
		</EmptyState>
	{/if}

	<!-- Je pense que ce serait une bonne idée d'avoir un objet qui gère les différents type de situation pathologique pour pouvoir afficher différentes notes comme, par exemple, la suggestion de Marc Leflot de prévenir l'utilisateur de si la demande d'accord arrive à échéance. 

	Ajouter des overview de la situation pathologique : Où on en est dans le traitement, dans la
	facturation etc (bref toutes les données que je pensais compiler dans l'object sp) -->
</div>
