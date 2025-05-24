<script>
	import dayjs from 'dayjs';
	import CardTable from '../../../../components/CardTable.svelte';

	let { lines } = $props();
</script>

<CardTable
	headerItems={['Ordre', 'type', 'Date', 'Code', 'Valeur totale', 'Part personnelle']}
	bodyItems={lines.map((s) => [
		{ content: s.id },
		{ content: s.description },
		{ content: dayjs(s.date).format('DD/MM/YYYY') },
		{ content: s.code.code_reference },
		{ content: s.valeur_totale?.toFixed(2).replace('.', ',') + '€' },
		{ content: s.total_recu?.toFixed(2).replace('.', ',') + '€' }
	])}
	onclick={() => {
		console.log('clicked');
	}} />
