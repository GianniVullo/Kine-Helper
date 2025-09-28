import {
	integer,
	number,
	pipe,
	string,
	maxLength,
	nullish,
	transform,
	boolean,
	object
} from 'valibot';
import { uuidVal, isoDateWithMessage } from '../validators/baseValidators';

const stringValidator = nullish(
	pipe(
		transform((input) => (input.length === 0 ? null : input)),
		string('Ce champ est obligatoire')
	)
);
const integerValidator = nullish(pipe(number('Ce champ est obligatoire'), integer()));
const stringWithMaxLength = (maxLen) =>
	nullish(
		pipe(
			transform((input) => (input.length === 0 ? null : input)),
			string('Ce champ est obligatoire'),
			maxLength(maxLen, `Ce champ ne doit pas dépasser ${maxLength} caractères`)
		)
	);
export const validateurs = {
	id: uuidVal(),
	date: isoDateWithMessage(),
	metadata: object({
		first_time: boolean('Ce champ est obligatoire'),
		p2a: integerValidator,
		p2b: stringWithMaxLength(1080),
		p2c: stringWithMaxLength(1080),
		p2d: integerValidator,
		p2e: stringWithMaxLength(30),
		p2f: stringWithMaxLength(1080),
		p2g: stringWithMaxLength(500),
		p2h: stringWithMaxLength(500),
		p3a: integerValidator,
		p3b: stringWithMaxLength(100),
		p3c: stringWithMaxLength(100),
		p3d: integerValidator,
		p3e: stringWithMaxLength(800),
		p3f: stringWithMaxLength(800),
		p3g: stringWithMaxLength(1080),
		p3h: integerValidator,
		p3i: stringWithMaxLength(800),
		p4a: stringWithMaxLength(2000),
		p4b: stringWithMaxLength(2000),
		p4c: stringWithMaxLength(100),
		p4d: integerValidator,
		p4e: integerValidator,
		p4f: stringWithMaxLength(2000),
		p5a: stringWithMaxLength(1080)
	}),
	organization_id: uuidVal()
};

export const ListeESchema = object(validateurs);

export const first_time_field = {
	inputType: 'radioWithPanel',
	outerCSS: 'col-span-full',
	label: 'DEMANDE / PROLONGATION STATUT PATHOLOGIE LOURDE',
	options: [
		{
			label: 'Première demande',
			value: true,
			className: 'col-span-full sm:col-span-5 lg:col-span-4',
			description: `<div style="display: flex; flex-direction: column; margin-top: 12px; margin-left: 5px;"><span style="font-weight: 600;">- justification d’un besoin intensif et de longue durée de kinésithérapie/physiothérapie<sup>1</sup></span>
                    <span style="font-weight: 600; margin-top: 12px;">- confirmation du diagnostic de la pathologie lourde (figurant sur la liste E) par un médecin spécialiste<sup>2</sup> avec rapport joint à la demande :</span><ul style="list-style-type: disc; margin-top: 8px; margin-left: 22px;"><li>il s’agit d’un médecin spécialiste au sens de l’article 10, §1, de la nomenclature des prestations de santé</li><li>en cas de polyarthrite chronique inflammatoire d'origine immunitaire<sup>3</sup>, il doit s’agir du médecin spécialiste en rhumatologie, en médecine interne ou en pédiatrie</li></ul></div>`,
			footer: `<div style="display: flex; flex-direction: column; font-weight: 200;"><span style="font-size: 10px; color: gray;"><sup>1</sup> (conformément à l’article 7, § 3, alinéa 6, 2° et alinéa 7, 2°, de l’A.R. du 23 mars 1982)</span><span style="font-size: 10px; color: gray;"><sup>2</sup> (conformément à l’article 7, § 3, alinéa 6,1° et alinéa 7,1° de l’A.R. du 23 mars 1982)</span><span style="font-size: 10px; color: gray;"><sup>3</sup> (article 7, § 3, alinéa 2, 3°, h), de l’A.R. du 23 mars 1982)</span></div>`
		},
		{
			label: 'Prolongation',
			value: false,
			className: 'col-span-full sm:col-span-5 lg:col-span-4',
			description: `<div style="display: flex; flex-direction: column; margin-top: 12px; margin-left: 5px;"><span style="font-weight: 600;">- justification d’un besoin intensif et de longue durée de kinésithérapie/physiothérapie<sup>1</sup> :</span>
<ul style="list-style-type: disc; margin-top: 8px; margin-left: 22px;"><li>pour le lymphœdème<sup>2</sup>
démontrer que la réduction clinique de l'œdème reste maintenue uniquement par des
prestations kinésithérapeutiques ou physiothérapeutiques (un nouvel examen
lymphoscintigraphique n'est pas exigé)</li></ul>
<span style="font-weight: 600; margin-top: 12px;">- renouvellement de la confirmation du diagnostic par le médecin spécialiste non exigé</span></div>`,
			footer: `<div style="display: flex; flex-direction: column; font-weight: 200;"><span style="font-size: 10px; color: gray;"><sup>1</sup> (conformément à l’article 7, § 3, alinéas 6, 2° et 7, 2°, de l’A.R. du 23 mars 1982)</span><span style="font-size: 10px; color: gray;"><sup>2</sup> (article 7, § 3, alinéa 2, 3°, k), de l’A.R. du 23 mars 1982)</span></div>`
		}
	]
};

export const descriptionFields = [
	{
		id: 'p2a',
		inputType: 'radio',
		label: 'Pathologie',
		options: [
			{ label: 'NON ÉVOLUTIVE', value: 0 },
			{ label: 'ÉVOLUTIVE', value: 1 },
			{ label: 'RÉSOLUTIVE', value: 2 }
		],
		outerCSS: 'col-span-full sm:col-span-5 lg:col-span-4'
	},
	{
		id: 'p2b',
		inputType: 'textarea',
		titre: 'Résultat fonctionnel visé et buts poursuivis',
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p2c',
		inputType: 'textarea',
		titre: 'Évaluation du besoin actuel de soins de kinésithérapie ou physiothérapie',
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p2d',
		inputType: 'number',
		titre: 'Fréquence',
		removeArrows: true,
		outerCSS: 'col-span-full sm:col-span-2',
		trailing: createRawSnippet(() => ({ render: () => '<p>fois/semaine</p>' }))
	},
	{
		id: 'p2e',
		inputType: 'text',
		titre: 'Période proposée',
		outerCSS: 'col-span-full sm:col-span-2',
		placeholder: 'Ex: 24 ans, 18 mois et 12 jours'
	}
];
export const bilanFonctionnel = [
	{
		id: 'p2f',
		inputType: 'textarea',
		titre: 'Description',
		outerCSS: 'col-span-full sm:col-span-4'
	},
	{
		id: 'p2g',
		inputType: 'textarea',
		titre: 'FORCE (échelle MRC, 0-5)',
		outerCSS: 'col-span-full sm:col-span-4'
	},
	{
		id: 'p2h',
		inputType: 'textarea',
		titre: 'AMPLITUDE (ROM)',
		outerCSS: 'col-span-full sm:col-span-4'
	},
	{
		id: 'p3a',
		inputType: 'radio',
		label: 'COORDINATION / ÉQUILIBRE',
		options: [
			{ value: 0, label: '0 – Pas de déficience' },
			{ value: 1, label: '1 – Déficience légère' },
			{ value: 2, label: '2 – Déficience modérée' },
			{ value: 3, label: '3 – Déficience sévère' },
			{ value: 4, label: '4 – Déficience totale' }
		],
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3b',
		inputType: 'text',
		titre: 'AFFECTIONS RESPIRATOIRES',
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3c',
		inputType: 'text',
		titre: 'LYMPHŒDÈME',
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3d',
		inputType: 'radio',
		label: 'INFIRMITÉ MOTRICE CÉRÉBRALE (GMFCS score)',
		options: [
			{ value: 0, label: '1' },
			{ value: 1, label: '2' },
			{ value: 2, label: '3' },
			{ value: 3, label: '4' },
			{ value: 4, label: '5' }
		],
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3e',
		inputType: 'textarea',
		titre: 'AUTRES (par ex. brûlures …)',
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3f',
		inputType: 'textarea',
		titre: 'TROUBLES ASSOCIÉS (par ex. spasticité…)',
		outerCSS: 'col-span-full sm:col-span-5'
	}
];
export const limitationActivite = [
	{
		id: 'p3g',
		inputType: 'textarea',
		titre: 'Description',
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3h',
		inputType: 'radio',
		label: 'Autonomie',
		help: 'Joindre échelle standardisée en cas d’utilisation',
		options: [
			{ value: 0, label: '0 – Pas de déficience' },
			{ value: 1, label: '1 – Déficience légère' },
			{ value: 2, label: '2 – Déficience modérée' },
			{ value: 3, label: '3 – Déficience sévère' },
			{ value: 4, label: '4 – Déficience totale' }
		],
		outerCSS: 'col-span-full sm:col-span-5'
	},
	{
		id: 'p3i',
		inputType: 'textarea',
		titre: 'AUTRES (concernant les limitations d’activités & restrictions)',
		outerCSS: 'col-span-full sm:col-span-5'
	}
];

export const bilanPrecedent = [
	{
		id: 'p4c',
		inputType: 'text',
		titre: 'Durée de la période d’autorisation précédente',
		outerCSS: 'col-span-full sm:col-span-2'
	},
	{
		id: 'p4d',
		inputType: 'number',
		titre: 'Nombre de séances pendant cette période',
		outerCSS: 'col-span-full sm:col-span-2'
	},
	{
		id: 'p4e',
		inputType: 'number',
		titre: 'Fréquence moyenne de traitement par semaine',
		outerCSS: 'col-span-full sm:col-span-2'
	},
	{
		id: 'p4f',
		inputType: 'textarea',
		titre: 'Bilan fonctionnel précédent',
		outerCSS: 'col-span-full sm:col-span-5'
	}
];

export const fields = {};
