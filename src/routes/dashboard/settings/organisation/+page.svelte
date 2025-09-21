<script>
	import OrganisationUpsertForm from './OrganisationUpsertForm.svelte';
	import InvitationForm from './InvitationForm.svelte';
	import MyInvitations from './MyInvitations.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<OrganisationUpsertForm />

<InvitationForm />

<MyInvitations />
