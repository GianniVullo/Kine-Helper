import { PDFGeneration } from './kineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import dayjs from 'dayjs';
import { save_to_disk } from '../utils/fsAccessor';
import { locale } from '../i18n';

export class AnnexeB extends PDFGeneration {
	constructor(formData, patient, sp, obj) {
		super(
			`Annexe B ${patient.nom} ${patient.prenom} ${
				obj?.created_at ?? dayjs().format('YYYY-MM-DD')
			}`,
			formData,
			patient,
			sp,
			1,
			'',
			obj
		);
		const langDict = {
			NL: [
				'Bijlage 5b',
				'KENNISGEVING, OF HERNIEUWING VAN KENNISGEVING, VAN DE BEHANDELING VAN EEN PATHOLOGISCHE SITUATIE BEDOELD IN ARTIKEL 7, §14, 5°, B. VAN DE NOMENCLATUUR VAN DE GENEESKUNDIGE VERSTREKKINGEN (F-lijst)',
				'1. Aankruisen of het om een kennisgeving of een hernieuwing van kennisgeving gaat: ¹',
				'        Kennisgeving',
				'        Hernieuwing van kennisgeving',
				'Identificatiegegevens van de rechthebbende',
				'(invullen of het kleefbriefje V.I. aanbrengen)',
				(nom, prenom) => `Naam en voornaam : ${nom} ${prenom}`,
				(adresse, cp, localite) => `Adres : ${adresse} ${cp} ${localite}`,
				(date) => `Geboortedatum : ${date}`,
				(niss) => `Inschrijvingsnummer V.I. : ${niss}`,
				'Veklaring van de kinesitherapeut',
				(
					nom,
					prenom,
					date
				) => `Ik, ondergetekende, ${nom} ${prenom}, kinesitherapeut, verklaar aan de
				adviserend geneesheer dat ik start/gestart ben met de behandeling van onderstaande aangeduide
				pathologische situatie op datum van ${date}.`,
				'Ik heb kennisgenomen van de voorwaarden om de verstrekkingen in het kader van onderstaande pathologische situatie aan te rekenen en in het bijzonder van artikel 7, § 14 van de nomenclatuur van de geneeskundige verstrekkingen.',
				'Ik bewaar een afschrift van het voorschrift alsook de elementen die aantonen dat de patiënt zich in de hieronder aangeduide situatie bevindt, in het dossier.',
				'Pathologische situaties van de F-lijst omschreven in §14, 5°, B. ²',
				'Het vakje van de pathologische situatie aankruisen (maximaal 1 pathologische situatie).',
				'Het formulier is ongeldig als afgeweken wordt van de tekst, er begeleidende commentaar wordt bijgeschreven of het onvolledig is ingevuld.',
				'Ondertekening',
				'De kinesitherapeut'
			],
			FR: [
				'Annexe 5b',
				'NOTIFICATION, OU RENOUVELLEMENT DE NOTIFICATION, DU TRAITEMENT D’UNE SITUATION PATHOLOGIQUE DECRITE A L’ARTICLE 7, §14, 5°, B, DE LA NOMENCLATURE DES PRESTATIONS DE SANTE (LISTE F)',
				'1.   Indiquer par une croix s’il s’agit d’une notification ou d’un renouvellement de notification :',
				'        Notification',
				'        Renouvellement de notification',
				'Données d’identification du patient',
				'(compléter ou apposer une vignette O.A.)',
				(nom, prenom) => `Nom et prénom : ${nom} ${prenom}`,
				(adresse, cp, localite) => `Adresse : ${adresse} ${cp} ${localite}`,
				(date) => `Date de naissance : ${date}`,
				(niss) => `Numéro d’inscription O.A. : ${niss}`,
				'Déclaration du kinésithérapeute',
				(nom, prenom, date) =>
					`Je, soussigné(e), ${nom} ${prenom}, kinésithérapeute, déclare au médecin-conseil que je commence/j’ai commencé le traitement de la situation pathologique indiquée ci-dessous en date du ${date}.`,
				'J’ai pris connaissance des conditions pour pouvoir attester les prestations dans le cadre de la situation pathologique ci-dessous et en particulier de l’article 7, § 14 de la nomenclature des prestations de santé.',
				'Je garde une copie de la prescription ainsi que les éléments indiquant que le patient se trouve dans la situation cochée ci-dessous dans le dossier.',
				'Situations pathologiques de la liste F § 14, 5°, B. ¹',
				'Indiquer par une croix la situation pathologique concernée (maximum 1 situation pathologique)',
				'Le formulaire n’est pas valide s’il s’écarte du texte, si des commentaires sont ajoutés à ce texte ou s’il est rempli de façon incomplète',
				'Signature',
				'Le kinésithérapeute'
			]
		};
		const points = {
			NL: {
				a: {
					title:
						'a) Situaties die een gangrevalidatie noodzakelijk maken voor rechthebbenden vanaf hun 65ste verjaardag, die al eens gevallen zijn met risico op herhaling, te objectiveren door de behandelend geneesheer en kinesitherapeut aan de hand van :',
					0: '1) de “Timed up & go” test, met een score hoger dan 20 seconden;',
					1: 'en',
					2: '2) een positief resultaat op ten minste één van twee volgende testen, die allebei moeten worden verricht:',
					3: '    (01) de “Tinetti” test, met een score kleiner dan 20/28;',
					4: '    (02) de “Timed chair stands” test, met een score hoger dan 14 seconden.'
				},
				b: {
					title: 'b)	Psychomotorische ontwikkelingsstoornissen',
					0: 'Bij kinderen onder 16 jaar, na advies en behandelingsvoorstel door een van ondervermelde geneesheren-specialisten en met een significant zwakkere score op een gestandaardiseerde test;',
					1: '    Geneesheer-specialist voor :',
					2: '    - (neuro)pediatrie',
					3: '    - (neuro)pediatrie en F en P (*)',
					4: '    - neuropsychiatrie en F en P (*)',
					5: '    - neurologie',
					6: '    - neurologie en F en P (*)',
					7: '    - psychiatrie',
					8: '    - psychiatrie en F en P (*)',
					9: '    (*) F en P = specialist voor functionele en professionele revalidatie voor gehandicapten.',
					10: 'Bij kinderen onder 19 maanden kan bovenvermeld advies, behandelingsvoorstel en significant zwakkere score vervangen worden door de vaststelling van klinisch duidelijke ontwikkelingsstoornissen op basis van een evaluatie in een gespecialiseerde multidisciplinaire equipe, waar ten minste een (neuro)pediater deel van uitmaakt.'
				},
				c: {
					title:
						'c)	Ademhalingsinsufficiëntie bij rechthebbenden die opgevolgd worden in het kader van de typerevalidatie-overeenkomst inzake langdurige zuurstoftherapie thuis of bij thuisbeademing.'
				},
				d: {
					title: 'd)	Chronische motorische of gemengde polyneuropathie.'
				},
				e: {
					title: 'e)	Chronisch vermoeidheidssyndroom.',
					0: 'die voldoen aan de voorwaarden beschreven in de nomenclatuur'
				},
				f: {
					title: 'f)	Fibromyalgiesyndroom',
					0: 'die voldoen aan de voorwaarden beschreven in de nomenclatuur'
				},
				g: {
					title: 'g)	Primaire cervicale dystonie',
					0: 'aangetoond met een diagnostisch verslag opgesteld door een geneesheer-specialist voor neurologie'
				},
				h: {
					title: 'h)	Lymfoedeem',
					0: 'die voldoen aan de voorwaarden beschreven in de nomenclatuur'
				}
			},
			FR: {
				a: {
					title:
						'a) Situations qui nécessitent une rééducation fonctionnelle de la marche pour les bénéficiaires à partir leur 65ème anniversaire ayant déjà été victime d’une chute et présentant un risque de récidive, à objectiver par le médecin traitant et le kinésithérapeute au moyen :',
					0: '1) du test « Timed up & go », avec un score supérieur à 20 secondes ;',
					1: 'et',
					2: '2) du résultat positif à au moins un des deux tests suivants, ceux-ci devant tous deux être effectués:',
					3: '    (01) - le test « Tinetti », avec un score inférieur à 20/28 ;',
					4: '    (02) - le test « Timed chair stands », avec un score supérieur à 14 secondes.'
				},
				b: {
					title: 'b)	Troubles du développement psychomoteur',
					0: 'Chez les enfants de moins de 16 ans, après avis et proposition de traitement d’un des médecins spécialistes mentionnés ci-dessous, et avec un score significativement plus faible sur un test standardisé ;',
					1: '    Médecin spécialiste en :',
					2: '    - (neuro)pédiatrie',
					3: '    - (neuro)pédiatrie et F et P (*)',
					4: '    - neuropsychiatrie et F et P (*)',
					5: '    - neurologie',
					6: '    - neurologie et F et P (*)',
					7: '    - psychiatrie',
					8: '    - psychiatrie et F et P (*)',
					9: '    (*) F et P = spécialiste en réadaptation fonctionnelle et professionnelle des handicapés.',
					10: "Chez les enfants de moins de 19 mois, l’avis, la proposition de traitement et le score significativement plus faible mentionnés ci-dessus peuvent être remplacés par la constatation de troubles manifestes cliniques du développement sur base d'une évaluation effectuée par une équipe multidisciplinaire spécialisée, qui compte au moins un (neuro)pédiatre."
				},
				c: {
					title:
						"c)	Insuffisance respiratoire chez les bénéficiaires qui sont suivis dans le cadre de la convention-type de rééducation fonctionnelle relative à l'oxygénothérapie de longue durée à domicile ou en cas de respiration artificielle à domicile."
				},
				d: {
					title: 'd)	Polyneuropathie chronique motrice ou mixte .'
				},
				e: {
					title: 'e)	Syndrome de fatigue chronique',
					0: 'répondant aux conditions prévues dans la nomenclature.'
				},
				f: {
					title: 'f)	Syndrome fibromyalgique',
					0: 'répondant aux conditions prévues dans la nomenclature.'
					// deprecated : new doc issued by INAMI on sept 23
					// 0: 'Le diagnostic doit être confirmé par un médecin spécialiste en rhumatologie ou en médecine physique et réadaptation sur base d’un examen clinique comprenant les critères de diagnostic de l’ACR (American College of Rheumatology). Cette confirmation signée par le médecin spécialiste doit figurer dans le dossier individuel kinésithérapeutique et préciser que les critères de diagnostic utilisés sont bien ceux de l’ACR.',
					// 1: 'Avant la fin de chaque année civile qui suit l’année au cours de laquelle la 1ère prestation du traitement a eu lieu, le médecin spécialiste susmentionné réévaluera l’évolution de la symptomatologie du patient afin de confirmer la nécessité de poursuivre le traitement dans le cadre du §14. Cette confirmation signée par le médecin spécialiste doit figurer dans le dossier individuel kinésithérapeutique.'
				},
				g: {
					title: 'g)	Dystonie cervicale primaire',
					0: 'démontrée par un rapport diagnostique établi par un médecin-spécialiste en neurologie'
				},
				h: {
					title: 'h)	lymphoedème',
					0: 'répondant aux conditions prévues dans la nomenclature.'
				}
			}
		};
		this.langDict = langDict[get(locale) === 'FR' ? 'FR' : 'NL'];
		this.points = points[get(locale) === 'FR' ? 'FR' : 'NL'];
		this.situationsPathologiques = [this.a, this.b, this.c, this.d, this.e, this.f, this.g, this.h];
		this.indexOfSP = ['51.', '59.', '54.', '55.', '56.', '57.', '58.', '60.'];
	}

	buildPdf() {
		console.log(`Now building PDF Annexe B with and user ==`, this.formData, get(user));
		this.addCenteredText(this.langDict[0], this.yPosition);
		this.yPosition.update(5);
		this.addParagraph(this.langDict[1], { fontWeight: 'bold' });
		this.yPosition.update(5);
		this.addParagraph(this.langDict[2]);
		// this.checkbox(
		// 	this.formData.notification ? 'Notification' : 'Renouvellement de notification',
		// 	this.yPosition,
		// 	this.formData.notification
		// );
		this.yPosition.update(1);
		if (this.formData.notification) {
			this.addParagraph(this.langDict[3], { fontWeight: 'bold' });
		} else {
			this.addParagraph(this.langDict[4], { fontWeight: 'bold' });
		}
		this.yPosition.update(5);
		this.title('2.   ', this.langDict[5]);
		this.addParagraph(this.langDict[6]);
		this.yPosition.update(3);
		this.addParagraph(this.langDict[7](this.patient.nom, this.patient.prenom));
		this.addParagraph(
			this.langDict[8](this.patient.adresse, this.patient.cp, this.patient.localite)
		);
		this.addParagraph(this.langDict[9](this.patient.date_naissance));
		this.addParagraph(this.langDict[10](this.patient.niss));
		this.yPosition.update(5);
		this.title('3.   ', this.langDict[11]);
		this.yPosition.update(3);
		this.addParagraph(
			this.langDict[12](
				get(user).profil.nom,
				get(user).profil.prenom,
				dayjs(this.formData.date).format('DD/MM/YYYY')
			)
		);
		this.yPosition.update(2);
		this.addParagraph(this.langDict[13]);
		this.yPosition.update(2);
		this.addParagraph(this.langDict[14]);
		this.yPosition.update(5);
		this.title('4.   ', this.langDict[15]);
		this.yPosition.update(3);
		this.addParagraph(this.langDict[16]);
		this.addCenteredCard(this.langDict[17], {
			width: 130,
			fontSize: 8,
			fontWeight: 'bold',
			cardColor: '#000000',
			padding: 3
		});
		console.log('this.formData.situation_pathologique', this.formData.situation_pathologique);
		console.log(
			'this.situationsPathologiques',
			this.situationsPathologiques[this.formData.situation_pathologique]
		);
		this.situationsPathologiques[this.formData.situation_pathologique].bind(this)();
		this.yPosition.update(5);
		this.title('5.   ', this.langDict[18]);
		this.yPosition.update(3);
		this.addRow(
			[
				[this.addParagraph, [this.langDict[19], { dontUpdatePosition: true }]],
				[this.signature, [this.margins.left + this.doc.getTextWidth(`${this.langDict[19]} : ` + 3)]]
			],
			{
				columnsWidth: [5, this.pageWidth - this.margins.left - this.margins.right - 5]
			}
		);
		this.yPosition.update(3);
		this.addParagraph('Fait le : ' + dayjs(this.formData.date).format('DD/MM/YYYY'));
	}

	async save_file() {
		console.log('Now signing the file');
		this.buildPdf();
		console.log('after BUILDING PDF');
		await this.authSignature();
		console.log('after SIGNING PDF');

		let docOutput = this.doc.output('arraybuffer');
		let dirPath = await this.buildPath();
		await save_to_disk(dirPath, this.documentName + '.pdf', new Uint8Array(docOutput));
		console.log('after sendING PDF');
		return { dirPath };
	}

	checkbox(text, y, checked) {
		let xMargin = this.pageWidth - this.margins.right + 5;
		this.doc.text(text, xMargin, y);
		let x1 = xMargin + 5 + 1;
		let y1 = y - 4;
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

	voletAvecSituationsMultiples(situation, sousSituations, index, additionalSpace, listStyle = '') {
		this.addParagraph(situation);
		let yPositionBeforeParagraph = get(this.yPosition);
		this.checkbox(
			index,
			yPositionBeforeParagraph,
			this.indexOfSP[this.formData.situation_pathologique] == index
		);
		for (let index = 0; index < sousSituations.length; index++) {
			const sousSituation = sousSituations[index];
			this.sousSituation(sousSituation, listStyle);
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
		const subSituations = [...Array(4).keys()].map((i) => this.points.a[i]);
		this.voletAvecSituationsMultiples(this.points.a.title, subSituations, '51.');
	}

	b() {
		const subSituations = [...Array(11).keys()].map((i) => this.points.b[i]);
		this.voletAvecSituationsMultiples(this.points.b.title, subSituations, '59.');
	}
	c() {
		this.voletAvecSituationUnique(this.points.c.title, '54.');
	}
	d() {
		this.voletAvecSituationUnique(this.points.d.title, '55.');
	}
	e() {
		let sousSituations = [...Array(1).keys()].map((i) => this.points.e[i]);
		this.voletAvecSituationsMultiples(this.points.e.title, sousSituations, '56.');
	}
	f() {
		let sousSituations = [...Array(1).keys()].map((i) => this.points.f[i]);
		this.voletAvecSituationsMultiples(this.points.f.title, sousSituations, '57.');
	}
	g() {
		this.voletAvecSituationUnique(this.points.g.title, '58.');
	}
	h() {
		this.voletAvecSituationUnique(this.points.h.title, '60.');
	}
}
