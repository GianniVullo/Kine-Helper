<script>
	import BoutonPrincipal from '../../BoutonPrincipal.svelte';
	import BoutonSecondaireAvecIcone from '../../BoutonSecondaireAvecIcone.svelte';
	import Field from '../blocks/Field.svelte';
	import TwUiField from './TwUIField.svelte';
	import { t } from '../../../i18n';
	import { onDestroy } from 'svelte';
	import { on } from 'svelte/events';
	import { pushState } from '$app/navigation';
	import { appState } from '../../../managers/AppState.svelte';
	import { deleteIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import dayjs from 'dayjs';

	let {
		key,
		label,
		tarifList = $bindable(),
		outerCSS = 'col-span-full',
		tarifPrototype = () => ({
			id: crypto.randomUUID(),
			nom: null,
			valeur: null,
			created_at: dayjs().format('YYYY-MM-DD'),
			user_id: appState.user.id,
			organization_id: appState.selectedOrg.id
		}),
		children
	} = $props();

	const eventName = `Remove${key}`;
	let removeEventHandler = on(window, `${eventName}:Confirmed`, (e) => {
		e.preventDefault();
		tarifList = tarifList.filter((tarif) => tarif.id !== e.detail?.id);
	});
	onDestroy(() => {
		removeEventHandler();
	});
</script>

<div class={outerCSS}>
	<label
		class="mb-4 flex flex-col items-start space-y-2 space-x-0 text-sm/6 font-medium text-gray-900 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 dark:text-white"
		><p>{label}</p>
		<BoutonPrincipal
			inner={$t('shared', 'add', null, 'Add')}
			size="sm"
			onclick={(e) => {
				e.preventDefault();
				tarifList = [...tarifList, tarifPrototype()];
			}} />
	</label>

	<div class=" flex flex-col space-y-4">
		{#each tarifList as custom_tarif, index}
			{@const identifiant = `${key}${index}`}
			<div
				class="relative flex flex-col rounded-xl bg-white p-4 shadow-md sm:w-3/4 dark:bg-gray-950">
				<BoutonSecondaireAvecIcone
					size="sm"
					className="inline-flex -top-2 -right-2 absolute items-center bg-white dark:bg-gray-800 dark:hover:bg-red-950 text-sm rounded-full font-medium text-red-900 shadow-md ring-1 ring-inset ring-red-300 hover:bg-red-50 self-end"
					onclick={(e) => {
						e.preventDefault();
						pushState('', {
							modal: {
								action: 'signalConfirmation',
								actionId: eventName,
								id: custom_tarif.id,
								title: $t('tarifsForm', 'body', key, 'Delete From'),
								description: $t(
									'tarifsForm',
									'body',
									label,
									'Are you sure you want to delete this item ?'
								),
								buttonTextConfirm: $t('shared', 'confirm', null, 'Delete'),
							}
						});
					}}
					icon={deleteIcon}
					overiddeIconCSS="size-5 text-red-400" />

				<input type="hidden" name={identifiant} id={identifiant} value={custom_tarif.id} />
				<Field
					field={{ inputType: 'text', titre: `Nom de votre ${key}`, labelCSS: '!text-xs' }}
					bind:value={tarifList[index].nom} />

				{#snippet leadingMoney()}
					<span class="text-gray-500 sm:text-sm">€</span>
				{/snippet}
				{#snippet trailingMoney()}
					<span class="text-gray-500 sm:text-sm" id="price-currency">EUR</span>
				{/snippet}

				<!--* valeur -->
				<div class="mt-4 sm:col-span-4">
					<label
						for={identifiant + 'val'}
						class="block text-xs font-medium text-gray-900 dark:text-white"
						>Valeur de votre {key}</label>
					<TwUiField
						id={identifiant + 'val'}
						name={identifiant + 'val'}
						inputType="text"
						placeholder="0,00"
						leading={leadingMoney}
						trailing={trailingMoney}
						bind:value={tarifList[index].valeur} />
				</div>
			</div>
		{:else}
			<p class="text-gray-700 text-xs">Vous n'avez pas encore de {key}s</p>
		{/each}
	</div>
	{@render children?.()}
</div>
