<script>
	import AutocompleteField from '../AutocompleteField.svelte';
	let query;
	let mutualite = [
		// Chretienne
		{
			label: '100 - Alliance nationale des Mutualités chrétiennes',
			value: 100,
			keywords: 'chrétiennes, 100',
			meta: {}
		},
		{
			label: '120 - Christelijke Mutualiteit Vlaanderen',
			value: 120,
			keywords: 'christelijke, 120',
			meta: {}
		},
		{ label: '134 - Mutualité chrétienne', value: 134, keywords: 'chrétiennes, 134', meta: {} },
		// Neutre
		{
			label: '200 - Union nationale des mutualités neutres',
			value: 200,
			keywords: 'neutre, 200, neutrale',
			meta: {}
		},
		{
			label: '203 - Vlaams & Neutraal Ziekenfonds',
			value: 203,
			keywords: 'neutraal, 203',
			meta: {}
		},
		{ label: '216 - La Mutualité neutre', value: 216, keywords: 'neutre, 216', meta: {} },
		{
			label: '228 - Mutualia - Mutualité neutre',
			value: 228,
			keywords: 'mutualia, neutre, 228',
			meta: {}
		},
		{
			label: '235 - Neutraal ziekenfonds Vlaanderen',
			value: 235,
			keywords: 'neutraal, 235',
			meta: {}
		},
		// Solidaris
		{
			label: '300 - Solidaris, union nationale/nationaal verbond',
			value: 300,
			keywords: 'solidaris, socialiste, 300',
			meta: {}
		},
		{
			label: '304 - Solidaris, socialistische mutualiteit van de provincie Antwerpen',
			value: 304,
			keywords: 'solidaris, socialistische, antwerpen, 304',
			meta: {}
		},
		{
			label: '306 - Solidaris, mutualité socialiste du Brabant',
			value: 306,
			keywords: 'solidaris, socialiste, socialistische, brabant, 306',
			meta: {}
		},
		{
			label: '309 - Solidaris, socialistische mutualiteit van de provincie West-Vlaanderen',
			value: 309,
			keywords: 'socialistische, west-vlaanderen, 309',
			meta: {}
		},
		{
			label: '311 - Solidaris, socialistische mutualiteit van de provincie Oost-Vlaanderen',
			value: 311,
			keywords: 'socialistische, west-vlaanderen, 309',
			meta: {}
		},
		{
			label: '319 - Mutualité Solidaris Wallonie',
			value: 319,
			keywords: 'wallonie, socialiste, solidaris, 319',
			meta: {}
		},
		{
			label: '322 - Solidaris, socialistische mutualiteit van de provincie Limburg',
			value: 322,
			keywords: 'socialistische, solidaris, limburg, 322',
			meta: {}
		},
		{
			label: '323 - Mutualité socialiste du Luxembourg',
			value: 323,
			keywords: 'socialiste, solidaris, luxembourg',
			meta: {}
		},
		// Libérale
		{
			label: '400 - Union nationale des Mutualités Libérales',
			value: 400,
			keywords: 'libérale, 400',
			meta: {}
		},
		{ label: '403 - ML / LM MUTPLUS.be', value: 403, keywords: 'liberale, 403, mutplus', meta: {} },
		{
			label: '407 - Liberale Mutualiteit van Oost-Vlaanderen',
			value: 407,
			keywords: 'oost-vlaanderen, liberale 407',
			meta: {}
		},
		{
			label: '409 - Mutualité Libérale Hainaut-Namur',
			value: 409,
			keywords: 'liberale, 409',
			meta: {}
		},
		{
			label: '411 - Mutualité Libérale Liège - Luxembourg',
			value: 411,
			keywords: 'liberale, 411',
			meta: {}
		},
		{
			label: '417 - Liberale Mutualiteit Plus',
			value: 417,
			keywords: 'liberale, 417, plus',
			meta: {}
		},
		// Libre
		{
			label: '500 - Union nationale des mutualités libres',
			value: 500,
			keywords: 'libres, 500',
			meta: {}
		},
		{
			label: '509 - Partena – Mutualité Libre "Partenamut',
			value: 509,
			keywords: 'partena, libre, 509',
			meta: {}
		},
		{ label: '515 - Freie Krankenkasse', value: 515, keywords: 'freie, 515', meta: {} },
		{
			label: '526 - Helan Onafhankelijk Ziekenfonds',
			value: 526,
			keywords: 'helan, onafhankelijk, 526',
			meta: {}
		},
		// CAAMI
		{
			label: "600 - Caisse auxiliaire d'assurance maladie-invalidité",
			value: 600,
			keywords: 'caami, 600',
			meta: {}
		},
		{
			label: '600 - Gewestelijke dienst Antwerpen',
			value: 600,
			keywords: 'antwerpen, 600',
			meta: {}
		},
		{ label: '675 - Zeevarenden - Marins', value: 675, keywords: 'zeevarenden, 675', meta: {} },
		{
			label: '602 - Office régional de Bruxelles-Capitale',
			value: 602,
			keywords: 'caami, bruxelles, 602',
			meta: {}
		},
		{
			label: '603 - Gewestelijke dienst West-Vlaanderen',
			value: 603,
			keywords: 'west-vlaanderen, 603',
			meta: {}
		},
		{
			label: '604 - Gewestelijke dienst Oost-Vlaanderen',
			value: 604,
			keywords: 'oost-vlaanderen, 604',
			meta: {}
		},
		{ label: '605 - Office régional de Mons', value: 605, keywords: 'caami, mons, 605', meta: {} },
		{
			label: '606 - Office régional de Liège',
			value: 606,
			keywords: 'caami, liege, 606',
			meta: {}
		},
		{ label: '607 - Gewestelijke dienst Limburg', value: 607, keywords: 'limburg, 607', meta: {} },
		{
			label: '608 - Office régional du Luxembourg',
			value: 608,
			keywords: 'caami, luxembourg, 608',
			meta: {}
		},
		{
			label: '609 - Office régional de Namur',
			value: 609,
			keywords: 'caami, namur, 609',
			meta: {}
		},
		{ label: "610 - Office régional d'Eupen", value: 610, keywords: 'caami, eupen, 610', meta: {} },
		{
			label: '612 - Gewestelijke dienst Vlaams Brabant',
			value: 612,
			keywords: 'vlaams braban, 612',
			meta: {}
		},
		{
			label: '615 - Office régional de Charleroi',
			value: 615,
			keywords: 'caami, charleroi, 615',
			meta: {}
		},
		{ label: '620 - Bureau de Malmedy', value: 620, keywords: 'caami, malmedy, 620', meta: {} },
		{
			label: '622 - Office régional du Brabant wallon',
			value: 622,
			keywords: 'caami, brabant wallon, 622',
			meta: {}
		},
		{ label: '675 - Marins', value: 675, keywords: 'marins, 675', meta: {} },
		// HR Rail
		{
			label: '900 - Caisse des Soins de santé de HR Rail',
			value: 900,
			keywords: 'hr, 900',
			meta: {}
		},
		{
			label: '910 - CSS - Centre Médical Régional Bruxelles',
			value: 910,
			keywords: 'css, hr, bruxelles, 910',
			meta: {}
		},
		{
			label: '920 - KGV - Gewestelijk geneeskundig centrum Hasselt',
			value: 920,
			keywords: 'kgv, hasselt, 920',
			meta: {}
		},
		{
			label: '921 - KGV - Gewestelijk geneeskundig centrum Hasselt',
			value: 921,
			keywords: 'kgv, hasselt, 921',
			meta: {}
		},
		{
			label: '922 - KGV - Gewestelijk geneeskundig centrum Hasselt',
			value: 922,
			keywords: 'kgv, hasselt, 922',
			meta: {}
		},
		{
			label: '930 - KGV - Gewestelijk geneeskundig centrum Brugge',
			value: 930,
			keywords: 'kgv, brugge, 930',
			meta: {}
		},
		{
			label: '931 - KGV - Gewestelijk geneeskundig centrum Brugge',
			value: 931,
			keywords: 'kgv, brugge, 931',
			meta: {}
		},
		{
			label: '940 - CSS - Centre médical régional Namur',
			value: 940,
			keywords: 'css, namur, hr, 940',
			meta: {}
		},
		{
			label: '941 - CSS - Centre médical régional Namur',
			value: 941,
			keywords: 'css, namur, hr, 941',
			meta: {}
		},
		{
			label: '942 - CSS - Centre médical régional Namur',
			value: 942,
			keywords: 'css, namur, hr, 942',
			meta: {}
		}
	];

	function onOptionSelection(event) {
		console.log(event);
		query = event.detail.value;
	}
</script>

<AutocompleteField label="Mutualité" {query} name="mutualite" {onOptionSelection} options={mutualite} required />
