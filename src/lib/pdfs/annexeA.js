import { PDFGeneration } from './KineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';

export class AnnexeA extends PDFGeneration {
	constructor(documentName, formData) {
		super(documentName, formData);
		this.situationsPathologiques = [
			this.a,
			this.a,
			this.a,
			this.a,
			this.a,
			this.b,
			this.c,
			this.d,
			this.e,
			this.e,
			this.e,
			this.f,
			this.g,
			this.h,
			this.h,
			this.h,
			this.i,
			this.j,
			this.k
		];
		this.indexOfSP = [
			'1.',
			'2.',
			'2B.',
			'3.',
			'3B.',
			'4.',
			'5.',
			'6.',
			'7.',
			'8.',
			'9.',
			'10.',
			'11.',
			'12.',
			'13.',
			'14.',
			'15.',
			'16.',
			'17.'
		];
	}
	buildPdf() {
		console.log(`Now building PDF Annexe A with ${this.formData} and user ==`, get(user));
		this.addCenteredText('Annexe 5a', this.yPosition);
		this.yPosition.update(5);
		this.addParagraph(
			'NOTIFICATION  DU  TRAITEMENT  D’UNE  SITUATION  PATHOLOGIQUE  DECRITE  A L’ARTICLE 7, §14, 5°, A, DE LA NOMENCLATURE DES PRESTATIONS DE SANTE (LISTE F)',
			{ fontWeight: 'bold' }
		);
		this.yPosition.update(5);
		this.title('1.   ', 'Données d’identification du patient');
		this.addParagraph('(compléter ou apposer une vignette O.A.)');
		this.yPosition.update(5);
		this.addParagraph(
			`Nom et prénom : ${this.formData.patient.nom} ${this.formData.patient.prenom}`
		);
		this.addParagraph(
			`Adresse : ${this.formData.patient.adresse} ${this.formData.patient.cp} ${this.formData.patient.localite}`
		);
		this.addParagraph(`Date de naissance : ${this.formData.patient.date_naissance}`);
		this.addParagraph(`Numéro d’inscription O.A. : ${this.formData.patient.niss}`);
		this.yPosition.update(5);
		this.title('2.   ', 'Déclaration du kinésithérapeute');
		this.yPosition.update(5);
		this.addParagraph(
			`Je, soussigné(e), ${get(user).profil.nom} ${
				get(user).profil.prenom
			}, kinésithérapeute, déclare au médecin-conseil que je commence/j’ai commencé le traitement de la situation pathologique indiquée ci-dessous en date du ${
				this.formData.premiereSeance
			}.`
		);
		this.yPosition.update(5);
		this.addParagraph(
			'J’ai pris connaissance des conditions pour pouvoir attester les prestations dans le cadre de la situation pathologique ci-dessous et en particulier de l’article 7, § 14 de la nomenclature des prestations de santé.'
		);
		this.yPosition.update(5);
		this.addParagraph(
			'Je garde une copie de la prescription ainsi que les éléments indiquant que le patient se trouve dans la situation cochée ci-dessous dans le dossier.'
		);
		this.yPosition.update(5);
		this.title('3.   ', 'Situations pathologiques de la liste F § 14, 5°, A. ¹');
		this.yPosition.update(5);
		this.addParagraph(
			'Indiquer par une croix la situation pathologique concernée (maximum 1 situation pathologique)'
		);
		this.addCenteredCard(
			'Le formulaire n’est pas valide s’il s’écarte du texte, si des commentaires sont ajoutés à ce texte ou s’il est rempli de façon incomplète',
			{ width: 130, fontSize: 10, fontWeight: 'bold', cardColor: '#000000', padding: 3 }
		);
		this.situationsPathologiques[this.formData.situation_pathologique].bind(this)();
		this.yPosition.update(5);
		this.title('4.   ', 'Signature');
		this.yPosition.update(5);
		this.addRow(
			[
				[this.addParagraph, ['Le kinésithérapeute', { dontUpdatePosition: true }]],
				[this.signature, [this.margins.left + this.doc.getTextWidth('Le kinésithérapeute : ' + 3)]]
			],
			{
				columnsWidth: [5, this.pageWidth - this.margins.left - this.margins.right - 5]
			}
		);
		this.yPosition.update(5);
		this.addRow([
			[this.addParagraph, ['¹', { fontSize: 8, dontUpdatePosition: true }]],
			[
				this.addParagraph,
				[
					'Si le formulaire est établi par des moyens informatiques, seule la rubrique concernée (a), b), c), d), e) ,f), g), h), i), j) ou k)) du point 3 doit être reproduite. Le texte complet de cette rubrique doit être repris et la situation pathologique concernée doit être indiquée.',
					{ fontSize: 8, x: this.margins.left + 7, dontUpdatePosition: true }
				]
			]
		]);
	}

	checkbox(text, y, checked) {
		let xMargin = this.pageWidth - this.margins.right + 5;
		this.doc.text(text, xMargin, y);
		let x1 = xMargin + 5 + 1;
		let y1 = y - 4;
		//! ICI IL FAUT RAJOUTER LA POSSIBILITé DE LE déCOCHER
		if (checked) {
			this.doc.line(x1, y1, x1 + 5, y1 + 5);
			this.doc.line(x1, y1 + 5, x1 + 5, y1);
		}
		this.doc.rect(x1, y1, 5, 5);
	}

	sousSituation(sousSituation, listStyle, additionalPadding = 0) {
		this.addRow([
			[
				this.addParagraph,
				[
					listStyle ?? '-	',
					{
						x: this.margins.left + 19 + additionalPadding,
						dontUpdatePosition: true
					}
				]
			],
			[
				this.addParagraph,
				[
					sousSituation,
					{
						x: this.margins.left + 19 + additionalPadding + this.doc.getTextWidth(listStyle ?? '-	'),
						maxWidth:
							this.pageWidth -
							this.margins.left -
							this.margins.right -
							19 -
							additionalPadding -
							this.doc.getTextWidth(listStyle ?? '-	')
					}
				]
			]
		]);
	}

	voletAvecSituationsMultiples(situation, sousSituations, indexes, additionalSpace) {
		this.addParagraph(situation);
		for (let index = 0; index < sousSituations.length; index++) {
			let yPositionBeforeParagraph = get(this.yPosition);
			const sousSituation = sousSituations[index];
			this.sousSituation(sousSituation);
			this.checkbox(
				indexes[index],
				yPositionBeforeParagraph,
				this.indexOfSP[this.formData.situation_pathologique] == indexes[index]
			);
			if (additionalSpace) {
				this.yPosition.update(additionalSpace);
			}
		}
	}

	voletAvecSituationUnique(text, index) {
		let yPositionBeforeParagraph = get(this.yPosition);
		this.addParagraph(text, { maxWidth: this.pageWidth - this.margins.left * 2 - 10 });
		this.checkbox(
			index,
			yPositionBeforeParagraph,
			this.indexOfSP[this.formData.situation_pathologique] == index
		);
	}

	a() {
		const subSituations = [
			"situations dans lesquelles une ou plusieurs prestations de l'article 14, k) 1. (orthopédie),  I  (prestations  chirurgicales)  et  III  (arthroscopies  diagnostiques  et thérapeutiques), sont attestées et pour lesquelles la prestation ou la somme de ces prestations correspond à une valeur de N200 ou plus;",
			"situations  dans  lesquelles  une  prestation  de  l'article  14,  b)  (neurochirurgie)  est attestée et pour laquelle la prestation correspond à une valeur de K225 ou plus;",
			'en  cas  de  lésions  de  la  main,  situations  dans  lesquelles  une  ou  plusieurs prestations  de  l’article  14,  k)  (orthopédie)  I  (prestations  chirurgicales)  d’une valeur totale de Nx et une prestation de l’article 14,b) (neurochirurgie) d’une valeur de Ky sont effectuées conjointement lorsque le résultat du calcul suivant [Nx/N200 + Ky/K225] est supérieur ou égal à 1 ;',
			"situations dans lesquelles une des prestations 227695 - 227706, 227710 - 227721, 227813 - 227824,  227835 - 227846, 226936 – 226940, 227592 -227603,  227614 - 227625, 227651 - 227662, 227673 - 227684,  227776 - 227780 ou 227791 - 227802 de l'article 14, e) de la nomenclature est attestée ;",
			'situations dans lesquelles une prestation de l’article  14,  n)  (chirurgie orthopédique et neurochirurgie est attestée et pour lesquelles la prestation correspond à une valeur de K225 ou plus ;'
		];
		const subSituationsIndexes = ['1.', '2.', '2B.', '3.', '3B.'];
		this.voletAvecSituationsMultiples(
			'a)	Affections posttraumatiques ou postopératoires :',
			subSituations,
			subSituationsIndexes
		);
	}

	b() {
		this.voletAvecSituationUnique(
			'b)	Situations  dans  lesquelles  une  des  prestations  211046,  212225  ou  214045  (article 13, § 1er de la nomenclature (réanimation)) à été attestée.',
			'4.'
		);
	}
	c() {
		this.voletAvecSituationUnique(
			'c)	Bénéficiaires après une admission en fonction de soins intensifs (code 490), 5 dans une fonction de soins néonatals locaux (fonction N°)  (code 190) ou  un service de néonatalgie intensive (NIC) (code 270).',
			'5.'
		);
	}
	d() {
		this.voletAvecSituationUnique(
			"d)	Insuffisance respiratoire pour les enfants de moins de 16 ans souffrant de trachéo-, laryngo- ou bronchomalacie ou d'infections récidivantes des voies respiratoires inférieures.",
			'6.'
		);
	}
	e() {
		let sousSituations = [
			'd’une mononeuropathie (par exemple pied tombant ou main tombante) ; ',
			'd’une polyneuropathie motrice ou mixte ;',
			'd’une myopathie induite par médication ou par contact aigu ou chronique avec des substances toxiques.'
		];
		let indexes = ['7.', '8.', '9.'];
		this.voletAvecSituationsMultiples(
			'e)	Déficit moteur et invalidité à la suite :',
			sousSituations,
			indexes,
			2
		);
	}
	f() {
		let sousSituations = [
			"fracture vertébrale qui a nécessité une immobilisation par plâtre, corset ou orthèse d'au moins trois semaines; ",
			"fracture du bassin qui nécessite une immobilisation ou une décharge totale ou partielle d'au moins trois semaines;",
			"fracture  de  la  rotule,  du  plateau tibial, de  la  tête  humérale,  du coude ou  fracture  intra-articulaire  à  la  hauteur des  membres,  qui  ont  nécessité une immobilisation  d'au  moins trois semaines;",
			"luxation  du coude, de la hanche,  de la prothèse  de hanche ou  de  l’articulation de l'épaule ou de la prothèse de l’épaule ;",
			'entorse grave du genou avec rupture totale ou partielle d’un ou de plusieurs ligaments ;'
		];
		this.voletAvecSituationUnique(
			'f)	Situations dans le domaine de l’orthopédie – traumatologie :',
			'10.'
		);
		for (const sousSituation of sousSituations) {
			this.sousSituation(sousSituation);
		}
	}
	g() {
		this.voletAvecSituationUnique('g)	Capsulite rétractile (frozen shoulder)', '11.');
	}
	h() {
		this.addParagraph(
			'h)	Situations nécessitant une rééducation uro-, gynéco-, colo- ou proctologique :'
		);
		let yPositionBeforeParagraph = get(this.yPosition);
		this.sousSituation('Neuropathie avérée, tant chez les femmes que chez les hommes');
		this.checkbox('12.', yPositionBeforeParagraph, this.formData.situation_pathologique == 13);
		this.yPosition.update(2);
		yPositionBeforeParagraph = get(this.yPosition);
		this.sousSituation('Rééducation postopératoire du dysfonctionnement sphinctérien après : ');
		this.sousSituation(' Prostatectomie radicale ou adénomectomie.', '(01)', 5);
		this.sousSituation(
			' Cystectomie  totale  avec  entéro-cystoplastie  chez  des  patients  présentant une incontinence urinaire et/ou un déficit de sensibilité de réplétion vésicale.',
			'(02)',
			5
		);
		this.sousSituation(
			" Amputation  d'une  partie  du  système  digestif  avec  maintien  du  sphincter anal.",
			'(03)',
			5
		);
		this.sousSituation(
			' Prolapsus vésical, rectal ou utérin après intervention chirurgicale.',
			'(04)',
			5
		);
		this.checkbox('13.', yPositionBeforeParagraph, this.formData.situation_pathologique == 14);
		this.yPosition.update(2);
		yPositionBeforeParagraph = get(this.yPosition);
		this.sousSituation(
			'Pathologies fonctionnelles pour les enfants jusqu’au 16ème anniversaire dues à des dysfonctionnements ou des malformations :'
		);
		this.sousSituation(
			' infections  urinaires  pouvant  constituer  une  menace  pour  le  haut  appareil urinaire à court et moyen termes :',
			'(01)',
			5
		);
		const xMargins = this.margins.left + 19 + 5;
		this.addParagraph('- dyssynergie vésico-sphinctérienne ', { x: xMargins });
		this.addParagraph('- infections urinaires à répétition ', { x: xMargins });
		this.addParagraph('- syndrome des valves urétrales post-opératoire ', { x: xMargins });
		this.addParagraph('- immaturité vésicale', { x: xMargins });
		this.sousSituation(' encoprésie chez l’enfant', '(02)', 5);
		this.checkbox('14.', yPositionBeforeParagraph, this.formData.situation_pathologique == 15);
	}
	i() {
		this.voletAvecSituationUnique(
			'i)	Syndrome Douloureux Régional Complexe (SDRC) de type I (algoneurodystrophie ou maladie de Südeck) ou de type II (causalgie)',
			'15.'
		);
	}
	j() {
		this.voletAvecSituationUnique(
			'j)	Polytraumatismes, avec des répercussions fonctionnelles invalidantes au niveau de deux membres différents ou au niveau d’un membre et du tronc, dont au moins 2 traumatismes  répondent  aux  critères  des  situations  pathologiques  définies  au  §14, 5°, A, a), 1) ou 2) (affections posttraumatiques ou postopératoires) et/ou au §14, 5°, A., f) (situations dans le domaine de l’orthopédie – traumatologie)',
			'16.'
		);
	}
	k() {
		let sousSituations = [
			'- après une intervention chirurgicale temporomandibulaire intra-articulaire ; ',
			'- pendant et/ou après une radiothérapie concernant la région maxillo-faciale ; ',
			'- après une fracture mandibulaire intra-articulaire ou sub-condylaire.'
		];
		let yPositionBeforeParagraph = get(this.yPosition);
		this.voletAvecSituationUnique(
			'k)	Situations dans le domaine de la stomatologie énumérées ci-dessous :',
			'17.'
		);
		for (let index = 0; index < sousSituations.length; index++) {
			const sousSituation = sousSituations[index];
			this.sousSituation(sousSituation);
		}
	}

	title(
		section,
		text,
		{ fontSize = this.bodyFontSize, fontWeight = 'normal', fontFamily = 'helvetica' } = {}
	) {
		this.doc.setFontSize(fontSize);
		this.doc.setFont(fontFamily, fontWeight);
		const sectionWidth = this.doc.getTextWidth(section);
		this.doc.text(section, this.margins.left, get(this.yPosition));
		this.doc.text(text, this.margins.left + sectionWidth, get(this.yPosition));
		this.underlineText(text, this.margins.left + sectionWidth);
		this.yPosition.update((fontSize / 3.52778) * 1.5);
	}
}
