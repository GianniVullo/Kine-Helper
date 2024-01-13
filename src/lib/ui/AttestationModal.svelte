<script>
	import { ListBox, ListBoxItem, getModalStore } from '@skeletonlabs/skeleton';
	import { NomenclatureManager } from '../utils/nomenclatureManager';
	import CheckboxFieldV2 from '../forms/abstract-fields/CheckboxFieldV2.svelte';
	import dayjs from 'dayjs';
	import { derived, writable } from 'svelte/store';

	const modalStore = getModalStore();
	// <!--*--> IDÉE GÉNÉRALE
	// Ici l'idée est de proposer à l'utilisateur de créer une attestation jusqu'à aujourd'hui (ou jusqu'à la date spécifiée). Si jusqu'à aujourd'hui il y a plus de 20 lignes alors il faut pouvoir créer plusieurs attestations automatiquement.

	// <!--*--> ÉTAPE 1 : SÉLECTIONNER LES SÉANCES PAR DATE
	// Il nous faut avoir uniquement les séances précédentes ou égale à aujourd'hui.
	// Cette étape devrait être préalable et le champ meta.seances devrait déjà contenir les séances sélectionnées

	let seances = writable($modalStore[0].meta.seances);

	// <!--*--> ÉTAPE 2 : RÉPARTIR LES SÉANCES PAR ATTESTATION
	// Cette propriété doit être réactive et se recalculer à chaque fois que l'utilisateur coche ou décoche une séance ou le champ with_indemnity

	// <!--?--> Trouver le lieu_id

	let seanceGuesser = new NomenclatureManager();
	// Future Int ou List<int>
	let lieu_id = seanceGuesser.lieu_idAggregator($seances);

	// <!--?--> Construire un store qui garde la valeur with_indemnity pour être utilisé dans le derivedStore du point 3

	let with_indemnity = writable($modalStore[0].meta.sp.with_indemnity);

	// <!--?--> Faire une déclaration réactive pour répartir les séances par attestation au travers d'un derived store
	// Ici Il faut pouvoir diviser les séances dans des attestation par 10 ou 20 lignes + par prescription

	function extraireSeanceParPrescriptions() {
		let seanceParPrescription = {};
		for (const seance of $seances) {
			if (!seanceParPrescription[seance.prescription_id]) {
				seanceParPrescription[seance.prescription_id] = [];
			}
			seanceParPrescription[seance.prescription_id].push(seance);
		}
		return seanceParPrescription;
	}
	//<!--!--> Ici on a un objet avec une liste de séances par prescription. Donc Potentiellement plus de 20 séances dans chaque propriété de l'Objet
	let seanceParPrescription = extraireSeanceParPrescriptions();
	console.log('seanceParPrescription', seanceParPrescription);

	function injecterSeanceParAttestationParPrescription() {
		let seanceParAParP = lieu_id.then((lieu) => {
			//<!--!--> Ici, la liste de séances par prescription est convertie en objet dont les clés sont les futures attestations et les valeurs des listes de 10 ou 20 séances, selon le lieu Id (voir moins 1 si une des attestation doit aussi contenir)
			let seanceParAttestationParPrescription = Object.keys(seanceParPrescription).reduce(
				(o, key) => ({ ...o, [key]: {} }),
				{}
			);
			console.log('seanceParAttestationParPrescription', seanceParAttestationParPrescription, lieu);
			// Une id pour les attestations pour qu'elles puissent être identifiable dans nos itérateurs
			let attestationId = 1;
			for (const prescription of Object.keys(seanceParPrescription)) {
				let seanceInPrescr = seanceParPrescription[prescription];

				for (const seance of seanceInPrescr) {
					// d'abord vérifier que la clé existe sinon l'ajouter
					if (!seanceParAttestationParPrescription[prescription][attestationId]) {
						seanceParAttestationParPrescription[prescription][attestationId] = [];
					}

					if (
						seanceParAttestationParPrescription[prescription][attestationId].length <
						(lieu === 3 ? 10 : 20)
					) {
						seanceParAttestationParPrescription[prescription][attestationId].push({
							state: true,
							obj: seance
						});
					} else {
						attestationId++;
						seanceParAttestationParPrescription[prescription][attestationId] = [
							{ state: true, obj: seance }
						];
					}
				}
			}
			return seanceParAttestationParPrescription;
		});
		return seanceParAParP;
	}

	// l'objet Clé
	let repartition = derived(
		[seances, with_indemnity],
		([$seances, $with_indemnity], set) => {
			injecterSeanceParAttestationParPrescription().then((val) => {
				console.log('val in injecterSeanceParAttestationParPrescription', val);
				set(val);
			});
		},
		{}
	);

	console.log('repartition', $repartition);
	// <!--*--> ÉTAPE 3 : VALIDATION ET ENVOI VERS LE COMPOSANT AttestationForm
	// Avec les searchparams on va envoyer les informations collectées par ce widget

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	let generateurDeSeance = $modalStore[0].meta.sp.generateurs_de_seances.find(
		(p) => p.gen_id === $modalStore[0].meta.seances[0].gen_id
	);

	let rapport_ecrit = $modalStore[0].meta.sp.rapport_ecrit;
	let rapport_ecrit_date = $modalStore[0].meta.sp.rapport_ecrit_date;
	let rapport_ecrit_custom_date = $modalStore[0].meta.sp.rapport_ecrit_custom_date;

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4 border border-surface-500 dark:border-surface-300';
	const cHeader = 'text-2xl font-bold';

	// Si l'utilisateur arrive ici en ayant choisi "Facturer jusqu'ici" sur l'agenda des séances l'Id de la séances sera dans meta.untill
	let seanceLimit = $modalStore[0].meta.untill
		? $modalStore[0].meta.seances.find((s) => s.seance_id === $modalStore[0].meta.untill)
		: null;
	// On filtre les séances ici pour ne garder que les 10 ou 20 premières OU BIEN celles qui sont avant la date limite
	let selectedSeances = $modalStore[0].meta.untill
		? $modalStore[0].meta.seances
				.filter((seance, idx) => {
					let seanceLimitDate = dayjs(dayjs(seanceLimit.date).format('YYYY-MM-DD'));
					let seanceAdjustedDate = dayjs(dayjs(seance.date).format('YYYY-MM-DD'));
					if (seanceLimitDate.isValid()) {
						if (
							(seanceLimitDate.isAfter(seanceAdjustedDate) ||
								seanceLimitDate.isSame(seanceAdjustedDate)) &&
							(with_indemnity ? idx < 10 : idx < 20)
						) {
							return seance;
						}
					}
				})
				.reduce((o, seance) => ({ ...o, [seance.seance_id]: true }), {})
		: $modalStore[0].meta.seances.reduce((o, seance) => ({ ...o, [seance.seance_id]: false }), {});

	let message = null;

	function groupByPrescriptionAndAttestation() {
		// Un object qui répartit les séances par attestation. cela veut dire qu'elle doive être retriée à chaque fois
		let seancesTriee = {};
		for (let idx = 0; idx < $modalStore[0].meta.seances.length; idx++) {
			const seance = $modalStore[0].meta.seances[idx];
		}
	}
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Créer une Attestation</header>
		<article>
			Choisissez jusqu'à {with_indemnity ? 10 : 20} séances à ajouter à votre attestation
		</article>

		<div class="space-y-2">
			<p class="text-error-500">{message ?? ''}</p>
			{#each Object.keys($repartition) as prescription}
				<div class="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth p-4">
					{#each Object.keys($repartition[prescription]) as attestation}
						<div class="card w-40 shrink-0 snap-start p-8 text-center md:w-80">
							<h5 class="text-left text-lg">Attestation {attestation}</h5>
							<p class="text-left text-base mb-2 text-surface-500 dark:text-surface-300">liée à la prescription du {prescription}</p>
							{#each $repartition[prescription][attestation] as seance}
								<label class="flex items-center space-x-2 space-y-1">
									<input
										class="checkbox"
										type="checkbox"
										bind:checked={seance.state} />
									<p class="text-left text-base text-surface-500 dark:text-surface-300">{dayjs(seance.obj.date).format('DD-MM-YYYY')}</p>
								</label>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</div>

		<CheckboxFieldV2
			name="with_indemnity"
			label="Avec indemnités de déplacements"
			bind:value={$with_indemnity} />

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={console.log('test')}
				>Select Flavors</button>
		</footer>
	</div>
{/if}
