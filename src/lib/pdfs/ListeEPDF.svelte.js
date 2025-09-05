import { PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { BetterPDFGeneration } from './BetterKHPDFProducer.svelte.js';
import dayjs from 'dayjs';
import { trace } from '@tauri-apps/plugin-log';

export class ListeEPDF extends BetterPDFGeneration {
	canvaName = 'gabarits_pdf/liste_e.pdf';
	bodyFontSize = 10;
	leftMargin = 60;
	maxLen = 120;

	//? is this needed?
	// constructor({ document, patient, sp }) {
	// 	super({ document, patient, sp });
	// }

	async buildPdf() {
		console.log('building PDF');
		trace('building PDF');
		await this.initPDF();
		this.tR = await this.doc.embedFont(StandardFonts.TimesRoman);
		this.tRBold = await this.doc.embedFont(StandardFonts.TimesRomanBold);
		this.symbols = await this.doc.embedFont(StandardFonts.ZapfDingbats);
		const pages = this.doc.getPages();
		this.page1(pages[0]);
		this.page2(pages[1]);
		this.page3(pages[2]);
		this.page4(pages[3]);
		this.page5(pages[4]);
		const fontSize = 12;
	}

	/**
	 * @param {PDFPage} page
	 */
	page1(page) {
		console.log('initializing page 1');
		trace('initializing page 1');
		const { height } = page.getSize();
		if (this.document.form_data.first_time) {
			this.checkMark(page, { x: 55, y: height - 134.5 });
		} else {
			this.checkMark(page, { x: 55, y: height - 301 });
		}

		// IDENTIFICATION DU BÉNÉFICIAIRE
		this.donneesPatient(page);

		// DIAGNOSTIC MÉDICAL
		this.drawPatientName(page, { x: 215, y: 236 });
	}
	/**
	 * @param {PDFPage} page
	 */
	page2(page) {
		console.log('initializing page 2');
		trace('initializing page 2');
		const { height } = page.getSize();
		// DESCRIPTION
		this.descriptPathologie(page);

		// Résultat fonctionnel visé et buts poursuivis
		this.resultatFonctionnelVisé(page);

		// Évaluation actuel du besoin de kiné
		this.evaluationActuelDuBesoinDeKine(page);

		// fréquence proposée
		if (typeof this.document.form_data.p2d === 'number') {
			page.drawText(this.document.form_data.p2d.toFixed(0), {
				x: 130,
				y: height - 355,
				size: this.bodyFontSize + 3,
				font: this.tRBold,
				color: rgb(0, 0, 0)
			});
		}

		// période proposée
		if (this.document.form_data.p2e) {
			page.drawText(this.document.form_data.p2e, {
				x: 150,
				y: height - 378,
				size: this.bodyFontSize + 3,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}

		// BILAN FONCTIONNEL / ÉTAT ACTUEL
		// description
		if (this.document.form_data.p2f) {
			page.drawText(this.wrapTextPreservingUserBreaks(this.document.form_data.p2f, 120), {
				x: 60,
				y: 340,
				size: this.bodyFontSize,
				lineHeight: this.lineSpacing,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
		// échelle MRC
		if (this.document.form_data.p2g) {
			page.drawText(this.wrapTextPreservingUserBreaks(this.document.form_data.p2g, 120), {
				x: 60,
				y: 167,
				size: this.bodyFontSize,
				lineHeight: this.lineSpacing,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
		// Amplitude (ROM)
		if (this.document.form_data.p2h) {
			page.drawText(this.wrapTextPreservingUserBreaks(this.document.form_data.p2h, 120), {
				x: 60,
				y: 105,
				size: this.bodyFontSize,
				lineHeight: this.lineSpacing,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
	}
	/**
	 * @param {PDFPage} page
	 */
	page3(page) {
		console.log('initializing page 3');
		trace('initializing page 3');
		const { height } = page.getSize();
		this.coordinationEquilibre(page);
		this.affectionsRespi(page, height);
		this.lymphoedeme(page);
		this.gmfcs(page);
		this.autres(page);
		this.troublesAssocies(page);
		// Limitations d’activités & Restrictions de participation
		this.limitationActiviteDescription(page);
		this.autonomie(page);
		this.autres2(page);
	}

	/**
	 * @param {PDFPage} page
	 */
	page4(page) {
		console.log('initializing page 4');
		trace('initializing page 4');
		const { height } = page.getSize();
		// Facteurs externes et personnels
		this.drawParagraph(page, this.document.form_data.p4a, {
			y: height - 133
		});
		// Résumé de la situation fonctionnelle
		this.drawParagraph(page, this.document.form_data.p4b, {
			y: height - 312
		});

		// durée période précédente
		if (this.document.form_data.p4c) {
			page.drawText(this.document.form_data.p4c, {
				x: 270,
				y: 321,
				size: this.bodyFontSize + 3,
				font: this.tRBold,
				color: rgb(0, 0, 0)
			});
		}

		// Nombre de séances effectuées
		if (this.document.form_data.p4d) {
			page.drawText(this.document.form_data.p4d.toFixed(0), {
				x: 260,
				y: 298,
				size: this.bodyFontSize + 3,
				font: this.tRBold,
				color: rgb(0, 0, 0)
			});
		}

		// freq moyenne de seances/semaine
		if (this.document.form_data.p4e) {
			page.drawText(this.document.form_data.p4e.toFixed(0), {
				x: 367,
				y: 272,
				size: this.bodyFontSize + 3,
				font: this.tRBold,
				color: rgb(0, 0, 0)
			});
		}

		// Bilan précédent
		if (this.document.form_data.p4f) {
			this.drawParagraph(page, this.document.form_data.p4f, {
				y: 234
			});
		}
	}

	/**
	 * @param {PDFPage} page
	 */
	page5(page) {
		console.log('initializing page 5');
		trace('initializing page 5');
		// TECHNIQUES / TRAITEMENT
		const { height } = page.getSize();
		if (this.document.form_data.p5a) {
			this.drawParagraph(page, this.document.form_data.p5a, {
				y: height - 117
			});
		}
		// date
		page.drawText(dayjs(this.document.date).format('DD/MM/YYYY'), {
			x: 350,
			y: height - 330,
			size: this.bodyFontSize + 3,
			font: this.tRBold,
			color: rgb(0, 0, 0)
		});
		// Signature
		this.signature(page, {
			x: 170,
			y: height - 350
		});
	}

	checkMark(page, { x, y }) {
		page.drawText('\u2718', {
			x,
			y,
			size: this.headingFontSize,
			font: this.symbols,
			color: rgb(0, 0, 0)
		});
	}

	drawPatientName(page, { x, y }) {
		page.drawText(this.patient_full_name, {
			x,
			y,
			size: this.bodyFontSize,
			font: this.tRBold,
			color: rgb(0, 0, 0)
		});
	}

	donneesPatient(page) {
		this.drawPatientName(page, { x: 60, y: 370 });
		page.drawText(dayjs(this.patient.date_naissance).format('DD/MM/YYYY'), {
			x: 306,
			y: 370,
			size: this.bodyFontSize,
			font: this.tRBold,
			color: rgb(0, 0, 0)
		});
		page.drawText(this.patient.mutuelle.toFixed(0), {
			x: 60,
			y: 330,
			size: this.bodyFontSize,
			font: this.tRBold,
			color: rgb(0, 0, 0)
		});
		if (this.patient.adresse && this.patient.cp && this.patient.localite) {
			page.drawText(this.formattedAddress(this.patient), {
				x: 306,
				y: 330,
				size: this.bodyFontSize,
				lineHeight: this.lineSpacing,
				font: this.tRBold,
				color: rgb(0, 0, 0)
			});
		}
		if (this.patient.niss) {
			page.drawText(this.patient.niss, {
				x: 170,
				y: 304,
				size: this.bodyFontSize,
				font: this.tRBold,
				color: rgb(0, 0, 0)
			});
		}
	}

	descriptPathologie(page) {
		if (typeof this.document.form_data.p2a === 'number') {
			const { height } = page.getSize();
			const y = height - 93;
			switch (this.document.form_data.p2a) {
				case 0:
					this.checkMark(page, { x: 179, y });
					break;
				case 1:
					this.checkMark(page, { x: 302, y });
					break;
				case 2:
					this.checkMark(page, { x: 425, y });
				default:
					break;
			}
		}
	}

	resultatFonctionnelVisé(page) {
		const { height } = page.getSize();
		if (this.document.form_data.p2b) {
			// We need to break the lines into reasonable lengths so everything stays in the panel
			page.drawText(this.wrapTextPreservingUserBreaks(this.document.form_data.p2b, 120), {
				x: 60,
				y: height - 125,
				size: this.bodyFontSize,
				lineHeight: this.lineSpacing,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
	}

	evaluationActuelDuBesoinDeKine(page) {
		const { height } = page.getSize();
		if (this.document.form_data.p2c) {
			// We need to break the lines into reasonable lengths so everything stays in the panel
			page.drawText(this.wrapTextPreservingUserBreaks(this.document.form_data.p2c, 120), {
				x: 60,
				y: height - 245,
				size: this.bodyFontSize,
				lineHeight: this.lineSpacing,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
	}

	coordinationEquilibre(page) {
		const { height } = page.getSize();
		const y = height - 79.5;
		const y2 = height - 108;
		switch (this.document.form_data.p3a) {
			case 0:
				this.checkMark(page, { x: 237.5, y });
				break;
			case 1:
				this.checkMark(page, { x: 386, y });
				break;
			case 2:
				this.checkMark(page, { x: 68, y: y2 });
				break;
			case 3:
				this.checkMark(page, { x: 237.5, y: y2 });
				break;
			case 4:
				this.checkMark(page, { x: 386, y: y2 });
				break;
			default:
				break;
		}
	}

	limitationActiviteDescription(page) {
		if (this.document.form_data.p3g) {
			this.drawParagraph(page, this.document.form_data.p3g, {
				y: 365
			});
		}
	}

	troublesAssocies(page) {
		if (this.document.form_data.p3f) {
			const { height } = page.getSize();
			this.drawParagraph(page, this.document.form_data.p3f, { y: height - 298 });
		}
	}

	autres(page) {
		if (this.document.form_data.p3e) {
			const { height } = page.getSize();
			this.drawParagraph(page, this.document.form_data.p3e, { y: height - 215 });
		}
	}

	gmfcs(page) {
		if (typeof this.document.form_data.p3d === 'number' || this.sp?.gmfcs) {
			const { height } = page.getSize();
			const gmfcs = this.document.form_data.p3d || this.sp?.gmfcs || 0;
			this.checkMark(page, {
				x: 320 + gmfcs * 45,
				y: height - 180
			});
		}
	}

	lymphoedeme(page) {
		if (this.document.form_data.p3c) {
			const { height } = page.getSize();
			page.drawText(this.document.form_data.p3c, {
				x: 139,
				y: height - 155,
				size: this.bodyFontSize,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
	}

	affectionsRespi(page) {
		if (this.document.form_data.p3b) {
			const { height } = page.getSize();
			page.drawText(this.document.form_data.p3b, {
				x: 215,
				y: height - 132,
				size: this.bodyFontSize,
				font: this.tR,
				color: rgb(0, 0, 0)
			});
		}
	}
	autres2(page) {
		if (this.document.form_data.p3i) {
			this.drawParagraph(page, this.document.form_data.p3i, { y: 145 });
		}
	}

	autonomie(page) {
		switch (this.document.form_data.p3h) {
			case 0:
				this.checkMark(page, { x: 215, y: 200 });
				break;
			case 1:
				this.checkMark(page, { x: 380, y: 200 });
				break;
			case 2:
				this.checkMark(page, { x: 56, y: 177 });
				break;
			case 3:
				this.checkMark(page, { x: 215, y: 177 });
				break;
			case 4:
				this.checkMark(page, { x: 380, y: 177 });
				break;
			default:
				break;
		}
	}
}
