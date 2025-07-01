import { integer, isoDate, maxValue, number, object, pipe, string } from 'valibot';

const validator = pipe(number('Ce champs est obligatoire'), integer(), maxValue(2));

export let validateurs = {
	id: string(),
	date: isoDate('La date est obligatoire'),
	form_data: object({
		1: validator,
		2: validator,
		3: validator,
		4: validator,
		5: validator,
		6: validator,
		7: validator,
		'8a': validator,
		'8b': validator,
		9: validator,
		10: validator,
		'11a1': validator,
		'11a2': validator,
		'11b1': validator,
		'11b2': validator,
		12: validator,
		13: validator,
		14: validator,
		15: validator,
		16: validator
	})
};

export const TinettiSchema = pipe(object(validateurs));

export const fields = {
	balance: [
		{
			id: '1',
			label: '1. Équilibre en position assise',
			options: [
				{ label: 'Penche ou s’affale', value: 0 },
				{ label: 'Position assise stable et sûre', value: 1 }
			]
		},
		{
			id: '2',
			label: '2. Se mettre debout',
			options: [
				{ label: 'Impossible sans aide', value: 0 },
				{ label: 'Possible à l’aide d’un appui des bras', value: 1 },
				{ label: 'Possible sans l’aide d’un appui des bras', value: 2 }
			]
		},
		{
			id: '3',
			label: '3. Tentatives pour se mettre debout',
			options: [
				{ label: 'Impossible sans aide', value: 0 },
				{ label: 'Possible > 1 tentative', value: 1 },
				{ label: 'Possible après 1 tentative', value: 2 }
			]
		},
		{
			id: '4',
			label: '4. Équilibre debout (5 premières sec.)',
			options: [
				{ label: 'Instable', value: 0 },
				{ label: 'Stable avec appui', value: 1 },
				{ label: 'Stable sans le moindre appui', value: 2 }
			]
		},
		{
			id: '5',
			label: '5. Équilibre debout',
			options: [
				{ label: 'Instable', value: 0 },
				{ label: 'Stable, écart entre les pieds > 10 cm ou appui des bras', value: 1 },
				{ label: 'Pieds joints, sans appui des bras', value: 2 }
			]
		},
		{
			id: '6',
			label: '6. Poussée sur le sternum (3x) (pieds joints)',
			options: [
				{ label: 'Commence à vaciller', value: 0 },
				{ label: 'Vacille mais se redresse', value: 1 },
				{ label: 'Stable', value: 2 }
			]
		},
		{
			id: '7',
			label: '7. Yeux fermés (pieds joints)',
			options: [
				{ label: 'Instable', value: 0 },
				{ label: 'Stable', value: 1 }
			]
		},
		{
			id: '8a',
			label: '8a. Rotation de 360° - Pas',
			options: [
				{ label: 'Petits pas irréguliers', value: 0 },
				{ label: 'Petits pas réguliers', value: 1 }
			]
		},
		{
			id: '8b',
			label: '8b. Rotation de 360° - Stabilité',
			options: [
				{ label: 'Instable (vacille)', value: 0 },
				{ label: 'Stable', value: 1 }
			]
		},
		{
			id: '9',
			label: '9. S’asseoir',
			options: [
				{ label: 'Peu sûr (tombe, calcule mal la distance)', value: 0 },
				{ label: 'Utilise les bras', value: 1 },
				{ label: 'Mouvements sûrs et aisés', value: 2 }
			]
		}
	],
	gait: [
		{
			id: '10',
			label: '10. Se mettre en marche au premier signal',
			options: [
				{ label: 'Hésitation ou diverses tentatives', value: 0 },
				{ label: 'Sans hésitation', value: 1 }
			]
		},
		{
			id: '11a1',
			label: '11a1. Longueur et hauteur du pas : Pied G en mouvement',

			options: [
				{ label: 'Ne dépasse pas le pied D au repos', value: 0 },
				{ label: 'Dépasse le pied D au repos', value: 1 }
			]
		},
		{
			id: '11a2',
			label: '11a2. Longueur et hauteur du pas : Pied G en mouvement',
			options: [
				{ label: 'Ne se détache pas du sol', value: 0 },
				{ label: 'Se détache du sol', value: 1 }
			]
		},
		{
			id: '11b1',
			label: '11b1. Longueur et hauteur du pas : Pied D en mouvement',
			options: [
				{ label: 'Ne dépasse pas le pied G au repos', value: 0 },
				{ label: 'Dépasse le pied G au repos', value: 1 }
			]
		},
		{
			id: '11b2',
			label: '11b2. Longueur et hauteur du pas : Pied G en mouvement',
			options: [
				{ label: 'ne se détache pas du sol', value: 0 },
				{ label: 'se détache du sol', value: 1 }
			]
		},
		{
			id: '12',
			label: '12. Symétrie du pas',
			options: [
				{ label: 'Inégalité des pas G et D', value: 0 },
				{ label: 'Égalité des pas G et D', value: 1 }
			]
		},
		{
			id: '13',
			label: '13. Continuité du pas',
			options: [
				{ label: 'Arrêts ou discontinuité des pas', value: 0 },
				{ label: 'Les pas semblent continus', value: 1 }
			]
		},
		{
			id: '14',
			label: '14. Marche déviante',
			options: [
				{ label: 'Nette déviance', value: 0 },
				{ label: 'Déviance moyenne ou utilisation d’une aide à la marche', value: 1 },
				{ label: 'Marche droite sans aide', value: 2 }
			]
		},
		{
			id: '15',
			label: '15. Tronc',
			options: [
				{ label: 'Mouvement prononcé du tronc ou utilisation d’une aide', value: 0 },
				{
					label: 'Pas de mouvement du tronc mais flexion des genoux, du dos ou écartement des bras',
					value: 1
				},
				{ label: 'Droit sans aide à la marche', value: 2 }
			]
		},
		{
			id: '16',
			label: '16. Écartement des pieds',
			options: [
				{ label: 'Talons séparés', value: 0 },
				{ label: 'Talons se touchant presque lors de la marche', value: 1 }
			]
		}
	]
};
