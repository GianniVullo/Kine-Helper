<script>
	import { RadioFieldV2 } from '../../index';

	let options = [
		{ value: 1, label: 'Niveau 1 : Marche sans restriction des mouvements' },
		{ value: 2, label: 'Niveau 2 : Marche avec restriction des mouvements' },
		{ value: 3, label: 'Niveau 3 : Marche avec aide technique à la marche' },
		{
			value: 4,
			label:
				'Niveau 4 : Mobilité autonome avec restriction des mouvements ; peut utiliser une aide motorisée.'
		},
		{ value: 5, label: 'Niveau 5 : Déplacement en fauteuil roulant manuel, poussé par un adulte.' }
	];
	export let value;
</script>

<RadioFieldV2 bind:value name="gmfcs" {options} label="Score GMFCS" />
