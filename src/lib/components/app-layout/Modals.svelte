<script>
	import { supabase } from '../../stores/supabaseClient';
	import { page } from '$app/state';
	import { t, locale } from '$lib/i18n/index';
	import { get } from 'svelte/store';
	import { open } from '@tauri-apps/plugin-shell';
	import Modal from '../../cloud/libraries/overlays/Modal.svelte';
	import { goto } from '$app/navigation';
	import BugReportForm from '../forms/BugReportForm.svelte';
</script>

<Modal
	opened={page.state?.modal?.name === 'signout'}
	title="Déconnexion"
	body={get(t)('sidebar', 'logout.confirm')}
	buttonTextCancel={get(t)('shared', 'cancel')}
	buttonTextConfirm={get(t)('shared', 'confirm')}
	onAccepted={async () => {
		await supabase.auth.signOut();
		goto('/');
	}} />
<Modal
	opened={page.state?.modal?.name === 'bugReport'}
	title={get(t)('sidebar', 'bugReport')}
	body={$t('bugModal', 'description')}>
	<BugReportForm />
</Modal>
<Modal
	opened={page.state?.modal?.name === 'docModal'}
	title="Attention, vous allez être redirigé"
	body={$t(
		'sidebar',
		'docModal.body',
		null,
		'Attention vous allez être redirigé vers le site de la documentation'
	)}
	buttonTextCancel={$t('shared', 'cancel')}
	buttonTextConfirm="Consulter la documentation"
	onAccepted={async () => {
		await open(
			$locale === 'FR' ? 'https://kine-helper.be/tutoriels' : 'https://kine-helper.be/nl/tutorials'
		);
		history.back();
	}} />
