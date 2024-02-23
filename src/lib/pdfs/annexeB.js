import { PDFGeneration } from './KineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';

export class AnnexeB extends PDFGeneration {
	constructor(formData, patient, sp) {
		super(
			`Annexe A ${patient.nom} ${patient.prenom} ${formData.date}.pdf`,
			formData,
			patient,
			sp,
			1
		);
		this.situationsPathologiques = [this.a, this.b, this.c, this.d, this.e, this.f, this.g, this.h];
		this.indexOfSP = ['51.', '59.', '54.', '55.', '56.', '57.', '58.', '60.'];
	}
	buildPdf() {
		console.log(`Now building PDF Annexe A with ${this.formData} and user ==`, get(user));
		this.addCenteredText('Annexe 5b', this.yPosition);
		this.yPosition.update(5);
		this.addParagraph(
			'NOTIFICATION, OU RENOUVELLEMENT DE NOTIFICATION, DU TRAITEMENT D’UNE SITUATION PATHOLOGIQUE DECRITE A L’ARTICLE 7, §14, 5°, B, DE LA NOMENCLATURE DES PRESTATIONS DE SANTE (LISTE F)',
			{ fontWeight: 'bold' }
		);
		this.yPosition.update(5);
		this.addParagraph(
			'1.   Indiquer par une croix s’il s’agit d’une notification ou d’un renouvellement de notification :'
		);
		this.checkbox(
			this.formData.notification ? 'Notification' : 'Renouvellement de notification',
			this.yPosition,
			this.formData.notification
		);
		this.addParagraph(' Notification');
		this.title('2.   ', 'Données d’identification du patient');
		this.addParagraph('(compléter ou apposer une vignette O.A.)');
		this.yPosition.update(5);
		this.addParagraph(`Nom et prénom : ${this.patient.nom} ${this.patient.prenom}`);
		this.addParagraph(
			`Adresse : ${this.patient.adresse} ${this.patient.cp} ${this.patient.localite}`
		);
		this.addParagraph(`Date de naissance : ${this.patient.date_naissance}`);
		this.addParagraph(`Numéro d’inscription O.A. : ${this.patient.niss}`);
		this.yPosition.update(5);
		this.title('3.   ', 'Déclaration du kinésithérapeute');
		this.yPosition.update(5);
		this.addParagraph(
			`Je, soussigné(e), ${get(user).profil.nom} ${
				get(user).profil.prenom
			}, kinésithérapeute, déclare au médecin-conseil que je commence/j’ai commencé le traitement de la situation pathologique indiquée ci-dessous en date du ${
				this.formData.date
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
		this.title('4.   ', 'Situations pathologiques de la liste F § 14, 5°, B. ¹');
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
		this.title('5.   ', 'Signature');
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

	voletAvecSituationsMultiples(situation, sousSituations, index, additionalSpace) {
		this.addParagraph(situation);
		let yPositionBeforeParagraph = get(this.yPosition);
		this.checkbox(
			index,
			yPositionBeforeParagraph,
			this.indexOfSP[this.formData.situation_pathologique] == index
		);
		for (let index = 0; index < sousSituations.length; index++) {
			const sousSituation = sousSituations[index];
			this.sousSituation(sousSituation);
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

	a() {
		const subSituations = [
			'1) du test « Timed up & go », avec un score supérieur à 20 secondes ;',
			'2) du résultat positif à au moins un des deux tests suivants, ceux-ci devant tous deux être effectués:',
			'    (01) - le test « Tinetti », avec un score inférieur à 20/28 ;',
			'    (02) - le test « Timed chair stands », avec un score supérieur à 14 secondes.'
		];
		this.voletAvecSituationsMultiples(
			'a) Situations qui nécessitent une rééducation fonctionnelle de la marche pour 51. les bénéficiaires à partir leur 65ème anniversaire ayant déjà été victime d’une chute et présentant un risque de récidive, à objectiver par le médecin traitant et le kinésithérapeute au moyen :',
			subSituations,
			'51.'
		);
	}

	b() {
		const subSituations = [
			'Chez les enfants de moins de 16 ans, après avis et proposition de traitement d’un des médecins spécialistes mentionnés ci-dessous, et avec un score significativement plus faible sur un test standardisé ;',
			'    Médecin spécialiste en :',
			'    - (neuro)pédiatrie',
			'    - (neuro)pédiatrie et F et P (*)',
			'    - neuropsychiatrie et F et P (*)',
			'    - neurologie',
			'    - neurologie et F et P (*)',
			'    - psychiatrie',
			'    - psychiatrie et F et P (*)',
			'    (*) F et P = spécialiste en réadaptation fonctionnelle et professionnelle des handicapés.',
			"Chez les enfants de moins de 19 mois, l’avis, la proposition de traitement et le score significativement plus faible mentionnés ci-dessus peuvent être remplacés par la constatation de troubles manifestes cliniques du développement sur base d'une évaluation effectuée par une équipe multidisciplinaire spécialisée, qui compte au moins un (neuro)pédiatre."
		];
		this.voletAvecSituationsMultiples(
			'b)	Troubles du développement psychomoteur',
			subSituations,
			'59.'
		);
	}
	c() {
		this.voletAvecSituationUnique(
			"c)	Insuffisance respiratoire chez les bénéficiaires qui sont suivis dans le cadre de la convention-type de rééducation fonctionnelle relative à l'oxygénothérapie de longue durée à domicile ou en cas de respiration artificielle à domicile.",
			'54.'
		);
	}
	d() {
		this.voletAvecSituationUnique('d)	Polyneuropathie chronique motrice ou mixte .', '55.');
	}
	e() {
		this.voletAvecSituationUnique(
			'e)	Syndrome de fatigue chronique répondant aux conditions prévues dans la nomenclature.',
			'56.'
		);
	}
	f() {
		let sousSituations = [
			'Le diagnostic doit être confirmé par un médecin spécialiste en rhumatologie ou en médecine physique et réadaptation sur base d’un examen clinique comprenant les critères de diagnostic de l’ACR (American College of Rheumatology). Cette confirmation signée par le médecin spécialiste doit figurer dans le dossier individuel kinésithérapeutique et préciser que les critères de diagnostic utilisés sont bien ceux de l’ACR.',
			'Avant la fin de chaque année civile qui suit l’année au cours de laquelle la 1ère prestation du traitement a eu lieu, le médecin spécialiste susmentionné réévaluera l’évolution de la symptomatologie du patient afin de confirmer la nécessité de poursuivre le traitement dans le cadre du §14. Cette confirmation signée par le médecin spécialiste doit figurer dans le dossier individuel kinésithérapeutique.'
		];
		this.voletAvecSituationsMultiples('f)	Syndrome fibromyalgique', sousSituations, '57.');
	}
	g() {
		this.voletAvecSituationUnique(
			'g)	Dystonie cervicale primaire démontrée par un rapport diagnostique établi par un médecin-spécialiste en neurologie',
			'58.'
		);
	}
	h() {
		this.voletAvecSituationUnique(
			'h)	lymphoedème répondant aux conditions prévues dans la nomenclature.',
			'60.'
		);
	}
}
