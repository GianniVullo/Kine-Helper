<script>
	import { FormSection } from '../../../../lib/components/forms/blocks';
	import { appState } from '../../../../lib/managers/AppState.svelte';
	import MembreForm from './MembreForm.svelte';
	import { supabase } from '../../../../lib/stores/supabaseClient';
	import { merge } from 'lodash';
	import { info } from '../../../../lib/cloud/libraries/logging';

	let membersPromise = new Promise(async (resolve, reject) => {
		const { data: roles, error: rolesError } = await supabase
			.from('roles')
			.select()
			.eq('organization_id', appState.selectedOrg.id);

		const { data: members, error: membersError } = await supabase
			.from('organization_members')
			.select('*, user_roles(role:roles(name))')
			.eq('organization_id', appState.selectedOrg.id);
		// .neq('user_id', appState.user.id);

		const { data: therapists, error } = await supabase
			.from('kinesitherapeutes')
			.select('id, email, nom, prenom')
			.in(
				'id',
				members.map((m) => m.user_id)
			);
		const mergedInfoMember = members.map((m) => {
			return merge(
				m,
				therapists.find((t) => t.id === m.user_id)
			);
		});
		if (error) {
			return reject(error);
		}
		resolve({ members: mergedInfoMember, roles });
	});
</script>

{#await membersPromise then { members, roles }}
	{console.log('in the each loop with', members)}
	<FormSection titre="Membres">
		{#each members as membre}
			<svelte:boundary onerror={info}>
				<MembreForm {membre} {roles} />
			</svelte:boundary>
		{/each}
	</FormSection>
{/await}
