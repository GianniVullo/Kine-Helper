<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import CodeField from '../forms/situation-pathologique/fields/CodeField.svelte';
	import dayjs from 'dayjs';
	import { DBInitializer } from '../stores/databaseInitializer';
	import FormWrapper from '../forms/ui/FormWrapper.svelte';

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	const modalStore = getModalStore();
	const db = new DBInitializer();

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';

	let codes;

	function onSelection(code) {
		if ($modalStore[0].response) $modalStore[0].response(code, $modalStore[0].meta.seance.obj);
		modalStore.close();
	}

	async function selectCode(code) {
		let conn = await db.openDBConnection();
		// d'abord il faut construire la query avec un select
		let query = 'SELECT * FROM codes WHERE ';
		let queryArgs = [];
		// ensuite on ajoute les conditions
		if (code.groupe_id) {
			queryArgs.push(code.groupe_id);
			query += `groupe = $${queryArgs.length}`;
		}
		if (code.lieu_id) {
			queryArgs.push(code.lieu_id);
			query += ` AND lieu = $${queryArgs.length}`;
		}
		if (code.type) {
			queryArgs.push(code.type);
			query += ` AND type = $${queryArgs.length}`;
		}
		if (code.duree) {
			queryArgs.push(code.duree);
			query += ` AND duree = $${queryArgs.length}`;
		}
		if (code.amb_hos) {
			queryArgs.push(code.amb_hos);
			query += ` AND amb_hos = $${queryArgs.length}`;
		}
		if (code.drainage) {
			queryArgs.push(code.drainage);
			query += ` AND drainage = $${queryArgs.length}`;
		}
		if (code.lourde_type) {
			queryArgs.push(code.lourde_type);
			query += ` AND lourde_type = $${queryArgs.length}`;
		}
		console.log('query', query, queryArgs);
		codes = await conn.select(query, queryArgs);
		await conn.close();
		console.log('codes', codes);
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<div class="flex">
			<div class="fllex flex-col">
				<header
					class="border-b border-r border-surface-300 pb-2 text-lg text-surface-600 dark:border-surface-600 dark:text-surface-400">
					Sélection du code de nomenclature
				</header>
				<div class="border-r border-surface-300 pr-4 pt-4 dark:border-surface-600">
					<article class="mb-4 text-surface-700/80 dark:text-surface-300/80">
						{`Vous pouvez ici modifier le code de la séance du ${dayjs(
							$modalStore[0].meta.seance.obj.date
						).format('DD/MM/YYYY')}`} <br />
						Le code actuel est le {$modalStore[0].meta.code.code_reference}
					</article>
						<CodeField codeActif={$modalStore[0].meta.code} onChangeCallback={selectCode} />
				</div>
			</div>
			<!--* Cache et Résultats -->
			<div class="flex flex-col">
				<dic class="flex flex-col">
					<header
						class="flex border-b border-surface-300 p-2 text-sm font-bold text-surface-600 dark:border-surface-600 dark:text-surface-300">
						<h5>Recherches précédentes</h5>
						<!-- <span class="transform transition-transform" id="arrow-icon-2">▼</span> -->
					</header>
					<div class="h-auto space-y-2 pl-2 pt-1">
						<!--! Ici le cache pour les résultats précédents each cachedCode as code -->
						<button class="variant-outline-surface btn btn-sm"> 567136 </button>
					</div>
				</dic>
				<div class="flex flex-col">
					<header
						class="flex border-b border-surface-300 p-2 text-sm font-bold text-surface-600 dark:border-surface-600 dark:text-surface-300">
						<h5>Résultat(s)</h5>
					</header>
					<div class="h-auto space-y-2 pl-2 pt-2">
						<!--! Ici les résultats de la recherche -->
						{#key codes}
							{#await codes}
								Chargement ...
							{:then codesQueried}
								{#if Array.isArray(codesQueried)}
									{#each codesQueried as code}
										<button class="variant-outline-success btn btn-sm" on:click={onSelection(code)}>
											{code.code_reference}
										</button>
									{/each}
								{/if}
							{/await}
						{/key}
					</div>
				</div>
			</div>
		</div>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>Annuler</button>
		</footer>
	</div>
{/if}
