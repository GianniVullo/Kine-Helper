<script>
	import { FormSection } from '../../../../lib/components/forms/blocks';
	import { appState } from '../../../../lib/managers/AppState.svelte';
	import { supabase } from '../../../../lib/stores/supabaseClient';

	let invitationsLoading = new Promise(async (resolve, reject) => {
		try {
			resolve(
				await supabase
					.from('organization_invitations')
					.select('email, status')
					.eq('organization_id', appState.selectedOrg.id)
			);
		} catch (error) {}
	});
</script>

<FormSection titre="Mes invitations">
	<div class="col-span-full">
		{#await invitationsLoading}
			<!-- invitationsLoading is pending -->
			Loading...
		{:then invitations}
			<!-- invitationsLoading was fulfilled -->
			{#each invitations as invite}
				{invite.email}, {invite.status}
			{:else}
				No invitations pending
			{/each}
		{:catch error}
			<!-- invitationsLoading was rejected -->
			ERROR : {error}
		{/await}
	</div>
</FormSection>
