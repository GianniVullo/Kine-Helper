<script>
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';
	import BoutonSecondaireAvecIcone from '../../../../components/BoutonSecondaireAvecIcone.svelte';
	import Field from '../abstract-components/Field.svelte';
	import TwUiField from '../fields/TwUIField.svelte';

	let {
		key,
		label,
		addButtonLabel,
		addButtonHandler,
		removeButtonLabel,
		removeButtonHandler,
		tarifList = $bindable(),
		outerCSS = 'col-span-full',
		children
	} = $props();
</script>

<div class={outerCSS}>
	<label
		class="mb-4 flex flex-col items-start space-x-0 space-y-2 text-sm/6 font-medium text-gray-900 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0"
		><p>{label}</p>
		<BoutonPrincipal inner={addButtonLabel} size="sm" onclick={addButtonHandler} />
	</label>

	<div class="ml-4 flex flex-col space-y-4">
		{#each tarifList as custom_tarif, index}
			{@const identifiant = `${key}${index}`}
			<div class="flex flex-col space-y-2 rounded border border-indigo-500 p-2 sm:w-3/4">
				<BoutonSecondaireAvecIcone
					size="sm"
					className="inline-flex items-center bg-white text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 self-end"
					onclick={removeButtonHandler(custom_tarif)}
					inner={removeButtonLabel}>
					{#snippet icon(cls)}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="-ml-0.5 mr-1.5 size-5 text-red-400">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					{/snippet}
				</BoutonSecondaireAvecIcone>

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
				<div class="sm:col-span-4">
					<label for={identifiant + 'val'} class="block text-xs font-medium text-gray-900"
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
