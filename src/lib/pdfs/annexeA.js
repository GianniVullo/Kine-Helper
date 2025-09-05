import { PDFGeneration } from './kineHelperPdfs';
import { get } from 'svelte/store';
import dayjs from 'dayjs';
import { locale } from '../i18n';
import { save_local_file } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';

export class AnnexeA extends PDFGeneration {
	constructor(formData, patient, sp) {
		super(`Annexe-A(${formData.id})`, formData, patient, sp, 0, '', formData);
		const langDict = {
			FR: [
				'Annexe 5a',
				'NOTIFICATION  DU  TRAITEMENT  D’UNE  SITUATION  PATHOLOGIQUE  DECRITE  A L’ARTICLE 7, §14, 5°, A, DE LA NOMENCLATURE DES PRESTATIONS DE SANTE (LISTE F)',
				'Données d’identification du patient',
				'(compléter ou apposer une vignette O.A.)',
				(nom) => `Nom et prénom : ${nom}`,
				(adresse) => `Adresse : ${adresse}`,
				(date) => `Date de naissance : ${date}`,
				(num) => `Numéro d’inscription O.A. : ${num}`,
				'Déclaration du kinésithérapeute',
				(nom, date) =>
					`Je, soussigné(e), ${nom}, kinésithérapeute, déclare au médecin-conseil que je commence/j’ai commencé le traitement de la situation pathologique indiquée ci-dessous en date du ${date}.`,
				'J’ai pris connaissance des conditions pour pouvoir attester les prestations dans le cadre de la situation pathologique ci-dessous et en particulier de l’article 7, § 14 de la nomenclature des prestations de santé.',
				'Je garde une copie de la prescription ainsi que les éléments indiquant que le patient se trouve dans la situation cochée ci-dessous dans le dossier.',
				'Situations pathologiques de la liste F § 14, 5°, A. ¹',
				'Indiquer par une croix la situation pathologique concernée (maximum 1 situation pathologique)',
				'Le formulaire n’est pas valide s’il s’écarte du texte, si des commentaires sont ajoutés à ce texte ou s’il est rempli de façon incomplète',
				'Signature',
				'Le kinésithérapeute',
				'Si le formulaire est établi par des moyens informatiques, seule la rubrique concernée (a), b), c), d), e) ,f), g), h), i), j) ou k)) du point 3 doit être reproduite. Le texte complet de cette rubrique doit être repris et la situation pathologique concernée doit être indiquée.'
			],
			NL: [
				'Bijlage 5a',
				'KENNISGEVING VAN DE BEHANDELING VAN EEN PATHOLOGISCHE SITUATIE BEDOELD IN ARTIKEL 7, §14, 5° A. VAN DE NOMENCLATUUR VAN DE GENEESKUNDIGE VERSTREKKINGEN (F-lijst)',
				'Identificatiegegevens van de rechthebbende',
				'(invullen of het kleefbriefje V.I. aanbrengen)',
				(nom) => 'Naam en voornaam : ' + nom,
				(adresse) => 'Adres : ' + adresse,
				(date) => 'Geboortedatum : ' + date,
				(num) => 'Inschrijvingsnummer V.I. : ' + num,
				'Verklaring van de kinesitherapeut',
				(nom, date) =>
					`Ik, ondergetekende, ${nom}, kinesitherapeut, verklaar aan de adviserend geneesheer dat ik start/gestart ben met de behandeling van onderstaande aangeduide pathologische situatie op datum van ${date}.`,
				'Ik heb kennisgenomen van de voorwaarden om de verstrekkingen in het kader van onderstaande pathologische situatie aan te rekenen en in het bijzonder van artikel 7, §14 van de nomenclatuur van de geneeskundige verstrekkingen.',
				'Ik bewaar een afschrift van het voorschrift alsook de elementen die aantonen dat de patiënt zich in de hieronder aangeduide situatie bevindt, in het dossier.',
				'Pathologische situaties van de F-lijst omschreven in §14, 5°, A. ¹',
				'Het vakje van de pathologische situatie aankruisen (maximaal 1 pathologische situatie).',
				'Het formulier is ongeldig als afgeweken wordt van de tekst, er begeleidende commentaar wordt bijgeschreven of het onvolledig is ingevuld.',
				'Ondertekening',
				'De kinesitherapeut',
				'Als het formulier via informatica wordt gemaakt dan hoeft slechts de betrokken rubriek (a), b), c), d), e), f), g), h), i), j) of k)) in punt 3 worden weergegeven. De volledige tekst van deze rubriek moet worden overgenomen en de betrokken pathologische situatie moet worden aangekruist.'
			]
		};
		const points = {
			NL: {
				a: {
					title: 'a) Posttraumatische of postoperatieve aandoeningen :',
					0: 'situaties waarin één of meerdere verstrekkingen uit artikel 14 k) (orthopedie), I (heelkundige verstrekkingen) en III (diagnostische en therapeutische arthroscopieën) zijn aangerekend en waarin de verstrekking of de som van die verstrekkingen overeenkomt met een waarde van N 200 of meer;',
					1: 'situaties waarin een verstrekkingen uit artikel 14 b) (neurochirurgie) zijn aangerekend en waarin deze verstrekking overeenkomt met een waarde van K 225 of meer;',
					2: 'in geval van handletsels, situaties waarin één of meerdere verstrekkingen uit artikel 14, k) (orthopedie) I (heelkundige verstrekkingen) met een totale waarde van Nx en een verstrekking van artikel 14, b) (neurochirurgie) met een waarde van Ky tegelijk zijn verricht terwijl het resultaat van de volgende berekening [Nx/N200 + Ky/K225] hoger is dan of gelijk is aan 1;',
					3: 'Situaties waarbij een van de verstrekkingen 227695-227706, 227710-227721, 227813-227824, 227835-227846, 226936-226940, 227592-227603, 227614-227625, 227651-227662, 227673-227684, 227776-227780 of 227791-227802 is geattesteerd uit artikel 14, e) van de nomenclatuur.',
					4: 'situaties waarin een verstrekking uit artikel 14 n) (orthopedische heelkunde en neurochirurgie) is aangerekend en waarin de verstrekking overeenkomt met een waarde van K 225 of meer;'
				},
				b: {
					title:
						'b) Situaties waarbij de verstrekkingen 211046, 212225 of 214045, (artikel 13, § 1 van de nomenclatuur (reanimatie)) werden aangerekend.'
				},
				c: {
					title:
						'c) Situaties waarbij de rechthebbenden opgenomen zijn geweest in een erkende functie intensieve verzorging (code 490), in een erkende functie plaatselijke neonatale verzorging (functie N*) (code 190) of in een erkende dienst voor intensieve neonatologie (NIC) (code 270).'
				},
				d: {
					title:
						'd) Ademhalingsinsufficiëntie bij kinderen onder 16 jaar met tracheo-, laryngo- of bronchomalacie of recidiverende lage luchtweginfecties.'
				},
				e: {
					title: 'e) Motorisch deficit en invalidering als gevolg van:',
					0: 'mononeuropathie (bijvoorbeeld dropvoet, drophand);',
					1: 'motorische of gemengde polyneuropathie;',
					2: 'myopathie geïnduceerd door medicatie of door acuut of chronisch contact met toxische stoffen.'
				},
				f: {
					title: 'f) Situaties in het domein van de orthopedie – traumatologie',
					0: 'wervelbreuk die gedurende minstens drie weken met een gipsverband, een korset of een orthese werd geïmmobiliseerd;',
					1: 'bekkenbreuk die gedurende minstens drie weken een immobilisatie of partieel of volledig steunverbod vereist;',
					2: 'breuken aan de knieschijf, het tibiaplateau, de humeruskop, de elleboog of intra-articulaire breuken ter hoogte van de ledematen, die gedurende minstens drie weken werd geïmmobiliseerd;',
					3: 'luxatie van de elleboog, de heup, de heupprothese, het schoudergewricht of de schouderprothese;',
					4: 'ernstige knieverstuikingen met gehele of partiële ruptuur van één of meerdere ligamenten;',
					5: 'acute gehele of quasi-gehele niet-geopereerde ruptuur van de achillespees.'
				},
				g: {
					title: 'g) Adhesieve capsulitis (frozen shoulder)'
				},
				h: {
					title: 'h) Situaties die uro-, gynaeco-, colo- of proctologische revalidatie vereisen',
					0: 'bewezen neuropathie, zowel bij mannen als bij vrouwen',
					1: 'postoperatieve revalidatie van sfyncterdisfunctie na:',
					2: 'radicale prostatectomie of adenomectomie.',
					3: 'totale cystectomie met vervangblaas ingeplant op de urethra bij patiënten die lijden aan urinaire incontinentie en/of verminderd aandranggevoel.',
					4: 'verwijdering van een deel van het spijsverteringskanaal met behoud van de anale sfincter.',
					5: 'verzakking van blaas, rectum of baarmoeder na een chirurgische ingreep.',
					6: 'functionele aandoeningen bij kinderen tot de 16e verjaardag ten gevolge van één van de volgende disfuncties of misvormingen:',
					7: 'urinaire aandoeningen die op korte en middellange termijn een bedreiging vormen voor de hogere urinewegen:',
					8: 'dyssynergie tussen blaas en sfincter',
					9: 'recidiverende urinewegeninfecties',
					10: 'postoperatief syndroom van urethrakleppen',
					11: 'vesicale immaturiteit',
					12: 'encopresis bij het kind'
				},
				i: {
					title:
						'i) Reflex Sympathische Dystrofie (RSD) van het type I (algoneurodystrofie of Südeckatrofie) of van het type II (causalgie)'
				},
				j: {
					title:
						'j) Polytraumatismen, met invaliderende functionele gevolgen ter hoogte van twee verschillende ledematen of ter hoogte van een lidmaat en de romp, waarvan ten minste 2 traumatismen voldoen aan de criteria van de pathologische situaties omschreven in § 14, 5°, A, a), 1) of 2) (posttraumatische of postoperatieve aandoeningen) en/of in § 14, 5°, A, f) (situaties in het domein van de orthopedie – traumatologie)'
				},
				k: {
					title: 'k) De volgende situaties in het domein van de stomatologie:',
					0: 'na een intra-articulaire temporomandibulaire heelkundige ingreep;',
					1: 'tijdens en/of na radiotherapie betreffende de maxillo-faciale zone;',
					2: 'na een intra-articulaire of sub-condylaire mandibulaire breuk;'
				}
			},
			FR: {
				a: {
					title: 'a) Affections posttraumatiques ou postopératoires :',
					0: "situations dans lesquelles une ou plusieurs prestations de l'article 14, k) (orthopédie),  I  (prestations  chirurgicales)  et  III  (arthroscopies  diagnostiques  et thérapeutiques), sont attestées et pour lesquelles la prestation ou la somme de ces prestations correspond à une valeur de N200 ou plus;",
					1: "situations  dans  lesquelles  une  prestation  de  l'article  14,  b)  (neurochirurgie)  est attestée et pour laquelle la prestation correspond à une valeur de K225 ou plus;",
					2: 'en  cas  de  lésions  de  la  main,  situations  dans  lesquelles  une  ou  plusieurs prestations  de  l’article  14,  k)  (orthopédie)  I  (prestations  chirurgicales)  d’une valeur totale de Nx et une prestation de l’article 14,b) (neurochirurgie) d’une valeur de Ky sont effectuées conjointement lorsque le résultat du calcul suivant [Nx/N200 + Ky/K225] est supérieur ou égal à 1 ;',
					3: "situations dans lesquelles une des prestations 227695 - 227706, 227710 - 227721, 227813 - 227824,  227835 - 227846, 226936 – 226940, 227592 -227603,  227614 - 227625, 227651 - 227662, 227673 - 227684,  227776 - 227780 ou 227791 - 227802 de l'article 14, e) de la nomenclature est attestée ;",
					4: 'situations dans lesquelles une prestation de l’article  14,  n)  (chirurgie orthopédique et neurochirurgie est attestée et pour lesquelles la prestation correspond à une valeur de K225 ou plus ;'
				},
				b: {
					title:
						'b)	Situations  dans  lesquelles  une  des  prestations  211046,  212225  ou  214045  (article 13, § 1er de la nomenclature (réanimation)) à été attestée.'
				},
				c: {
					title:
						'c)	Bénéficiaires après une admission en fonction de soins intensifs (code 490), dans une fonction de soins néonatals locaux (fonction N°)  (code 190) ou  un service de néonatalgie intensive (NIC) (code 270).'
				},
				d: {
					title:
						"d)	Insuffisance respiratoire pour les enfants de moins de 16 ans souffrant de trachéo-, laryngo- ou bronchomalacie ou d'infections récidivantes des voies respiratoires inférieures."
				},
				e: {
					title: 'e)	Déficit moteur et invalidité à la suite :',
					0: 'd’une mononeuropathie (par exemple pied tombant ou main tombante) ; ',
					1: 'd’une polyneuropathie motrice ou mixte ;',
					2: 'd’une myopathie induite par médication ou par contact aigu ou chronique avec des substances toxiques.'
				},
				f: {
					title: 'f)	Situations dans le domaine de l’orthopédie – traumatologie :',
					0: "fracture vertébrale qui a nécessité une immobilisation par plâtre, corset ou orthèse d'au moins trois semaines; ",
					1: "fracture du bassin qui nécessite une immobilisation ou une décharge totale ou partielle d'au moins trois semaines;",
					2: "fracture  de  la  rotule,  du  plateau tibial, de  la  tête  humérale,  du coude ou  fracture  intra-articulaire  à  la  hauteur des  membres,  qui  ont  nécessité une immobilisation  d'au  moins trois semaines;",
					3: "luxation  du coude, de la hanche,  de la prothèse  de hanche ou  de  l’articulation de l'épaule ou de la prothèse de l’épaule ;",
					4: 'entorse grave du genou avec rupture totale ou partielle d’un ou de plusieurs ligaments ;'
				},
				g: {
					title: 'g)	Capsulite rétractile (frozen shoulder)'
				},
				h: {
					title: 'h)	Situations nécessitant une rééducation uro-, gynéco-, colo- ou proctologique :',
					0: 'Neuropathie avérée, tant chez les femmes que chez les hommes',
					1: 'Rééducation postopératoire du dysfonctionnement sphinctérien après : ',
					2: ' Prostatectomie radicale ou adénomectomie.',
					3: ' Cystectomie  totale  avec  entéro-cystoplastie  chez  des  patients  présentant une incontinence urinaire et/ou un déficit de sensibilité de réplétion vésicale.',
					4: " Amputation  d'une  partie  du  système  digestif  avec  maintien  du  sphincter anal.",
					5: ' Prolapsus vésical, rectal ou utérin après intervention chirurgicale.',
					6: 'Pathologies fonctionnelles pour les enfants jusqu’au 16ème anniversaire dues à des dysfonctionnements ou des malformations :',
					7: ' infections  urinaires  pouvant  constituer  une  menace  pour  le  haut  appareil urinaire à court et moyen termes :',
					8: '- dyssynergie vésico-sphinctérienne ',
					9: '- infections urinaires à répétition ',
					10: '- syndrome des valves urétrales post-opératoire ',
					11: '- immaturité vésicale',
					12: ' encoprésie chez l’enfant'
				},
				i: {
					title:
						'i)	Syndrome Douloureux Régional Complexe (SDRC) de type I (algoneurodystrophie ou maladie de Südeck) ou de type II (causalgie)'
				},
				j: {
					title:
						'j)	Polytraumatismes, avec des répercussions fonctionnelles invalidantes au niveau de deux membres différents ou au niveau d’un membre et du tronc, dont au moins 2 traumatismes  répondent  aux  critères  des  situations  pathologiques  définies  au  §14, 5°, A, a), 1) ou 2) (affections posttraumatiques ou postopératoires) et/ou au §14, 5°, A., f) (situations dans le domaine de l’orthopédie – traumatologie)'
				},
				k: {
					title: 'k)	Situations dans le domaine de la stomatologie énumérées ci-dessous :',
					0: '- après une intervention chirurgicale temporomandibulaire intra-articulaire ; ',
					1: '- pendant et/ou après une radiothérapie concernant la région maxillo-faciale ; ',
					2: '- après une fracture mandibulaire intra-articulaire ou sub-condylaire.'
				}
			}
		};
		this.langDict = langDict[get(locale) === 'FR' ? 'FR' : 'NL'];
		this.points = points[get(locale) === 'FR' ? 'FR' : 'NL'];
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
		console.log(`Now building PDF Annexe A with ==`, this.formData);
		this.addCenteredText(this.langDict[0], this.yPosition);
		this.yPosition.update(5);
		this.addParagraph(this.langDict[1], { fontWeight: 'bold' });
		this.yPosition.update(5);
		this.title('1.   ', this.langDict[2]);
		this.addParagraph(this.langDict[3]);
		this.yPosition.update(5);
		this.addParagraph(this.langDict[4](`${this.patient.nom} ${this.patient.prenom}`));
		this.addParagraph(
			this.langDict[5](`${this.patient.adresse} ${this.patient.cp} ${this.patient.localite}`)
		);
		this.addParagraph(this.langDict[6](this.patient.date_naissance));
		this.addParagraph(this.langDict[7](this.patient.niss));
		this.yPosition.update(5);
		this.title('2.   ', this.langDict[8]);
		this.yPosition.update(5);
		this.addParagraph(
			this.langDict[9](`${appState.user.nom} ${appState.user.prenom}`, this.formData.date)
		);
		this.yPosition.update(5);
		this.addParagraph(this.langDict[10]);
		this.yPosition.update(5);
		this.addParagraph(this.langDict[11]);
		this.yPosition.update(5);
		this.title('3.   ', this.langDict[12]);
		this.yPosition.update(1);
		this.addParagraph(this.langDict[13]);
		this.addCenteredCard(this.langDict[14], {
			width: 130,
			fontSize: 8,
			fontWeight: 'bold',
			cardColor: '#000000',
			padding: 3
		});
		this.situationsPathologiques[this.formData.situation].bind(this)();
		this.yPosition.update(5);
		this.title('4.   ', this.langDict[15]);
		this.yPosition.update(5);
		this.addRow(
			[
				[this.addParagraph, [this.langDict[16], { dontUpdatePosition: true }]],
				[this.signature, [this.margins.left + this.doc.getTextWidth(`${this.langDict[16]} : ` + 3)]]
			],
			{
				columnsWidth: [5, this.pageWidth - this.margins.left - this.margins.right - 5]
			}
		);
		this.yPosition.update(3);
		this.addParagraph('Fait le : ' + dayjs(this.formData.date).format('DD/MM/YYYY'));
		this.yPosition.set(this.pageHeight - this.margins.bottom);
		this.addRow([
			[this.addParagraph, ['¹', { fontSize: 8, dontUpdatePosition: true }]],
			[
				this.addParagraph,
				[this.langDict[17], { fontSize: 8, x: this.margins.left + 7, dontUpdatePosition: true }]
			]
		]);
	}

	async save_file() {
		this.buildPdf();
		//* Si Kiné Helper ne trouve pas signature.png, il ne se passera rien
		await this.authSignature({ y: this.pageHeight - 55 });

		let docOutput = this.doc.output('arraybuffer');
		let dirPath = await this.buildPath();
		await save_local_file(
			dirPath,
			this.documentName + '.pdf',
			Array.from(new Uint8Array(docOutput))
		);
		return { dirPath };
	}

	checkbox(text, y, checked, fontSize) {
		let xMargin = this.pageWidth - this.margins.right + 5;
		if (fontSize) {
			this.doc.setFontSize(fontSize);
		} else {
			this.doc.setFontSize(this.bodyFontSize);
		}
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

	sousSituation(
		sousSituation,
		listStyle,
		additionalPadding = 0,
		{ fontSize = this.bodyFontSize } = {}
	) {
		this.addRow([
			[
				this.addParagraph,
				[
					listStyle ?? '-	',
					{
						x: this.margins.left + 19 + additionalPadding,
						dontUpdatePosition: true,
						fontSize
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
							this.doc.getTextWidth(listStyle ?? '-	'),
						fontSize
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
				this.indexOfSP[this.formData.situation] == indexes[index]
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
			this.indexOfSP[this.formData.situation] == index
		);
	}

	a() {
		const subSituations = [...Array(5).keys()].map((i) => this.points.a[i]);
		const subSituationsIndexes = ['1.', '2.', '2B.', '3.', '3B.'];
		this.voletAvecSituationsMultiples(this.points.a.title, subSituations, subSituationsIndexes);
	}

	b() {
		this.voletAvecSituationUnique(this.points.b.title, '4.');
	}
	c() {
		this.voletAvecSituationUnique(this.points.c.title, '5.');
	}
	d() {
		this.voletAvecSituationUnique(this.points.d.title, '6.');
	}
	e() {
		let sousSituations = [...Array(3).keys()].map((i) => this.points.e[i]);
		let indexes = ['7.', '8.', '9.'];
		this.voletAvecSituationsMultiples(this.points.e.title, sousSituations, indexes, 2);
	}
	f() {
		let sousSituations = [...Array(5).keys()].map((i) => this.points.f[i]);
		this.voletAvecSituationUnique(this.points.f.title, '10.');
		for (const sousSituation of sousSituations) {
			this.sousSituation(sousSituation);
		}
	}
	g() {
		this.voletAvecSituationUnique(this.points.g.title, '11.');
	}
	h() {
		this.addParagraph(this.points.h.title);
		let yPositionBeforeParagraph = get(this.yPosition);
		this.sousSituation(this.points.h[0], '', -8);
		this.checkbox('12.', yPositionBeforeParagraph, this.formData.situation == 13);
		this.yPosition.update(2);
		yPositionBeforeParagraph = get(this.yPosition);
		this.sousSituation(this.points.h[1], '', -8);
		this.sousSituation(this.points.h[2], '(01)', 0, { fontSize: 8 });
		this.sousSituation(this.points.h[3], '(02) ', 0, { fontSize: 8 });
		this.sousSituation(this.points.h[4], '(03) ', 0, { fontSize: 8 });
		this.sousSituation(this.points.h[5], '(04) ', 0, { fontSize: 8 });
		this.checkbox('13.', yPositionBeforeParagraph, this.formData.situation == 14);
		this.yPosition.update(2);
		yPositionBeforeParagraph = get(this.yPosition);
		this.sousSituation(this.points.h[6], '', -8);
		this.sousSituation(this.points.h[7], '(01)', 0, { fontSize: 8 });
		const xMargins = this.margins.left + 19;
		this.addParagraph(`-  ${this.points.h[8]}`, { x: xMargins, fontSize: 8 });
		this.addParagraph(`-  ${this.points.h[9]}`, { x: xMargins, fontSize: 8 });
		this.addParagraph(`-  ${this.points.h[10]}`, { x: xMargins, fontSize: 8 });
		this.addParagraph(`-  ${this.points.h[11]}`, { x: xMargins, fontSize: 8 });
		this.sousSituation(this.points.h[12], '(02) ', 0, { fontSize: 8 });
		this.checkbox('14.', yPositionBeforeParagraph, this.formData.situation == 15);
	}
	i() {
		this.voletAvecSituationUnique(this.points.i.title, '15.');
	}
	j() {
		this.voletAvecSituationUnique(this.points.j.title, '16.');
	}
	k() {
		let sousSituations = [...Array(3).keys()].map((i) => this.points.k[i]);
		this.voletAvecSituationUnique(this.points.k.title, '17.');
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
