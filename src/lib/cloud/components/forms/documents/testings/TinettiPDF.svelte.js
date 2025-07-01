import { rgb, StandardFonts } from 'pdf-lib';
import { BetterPDFGeneration } from '../../../../../pdfs/BetterKHPDFProducer.svelte.js';
import dayjs from 'dayjs';

export class TinettiPDF extends BetterPDFGeneration {
	canvaName = 'gabarits_pdf/tinetti.pdf';
	balanceYCoordinates = {
		'1:0': 221.5,
		'1:1': 250,
		'2:0': 296.5,
		'2:1': 315.4,
		'2:2': 343.5,
		'3:0': 362.5,
		'3:1': 371.5,
		'3:2': 380,
		'4:0': 391.5,
		'4:1': 409.5,
		'4:2': 428,
		'5:0': 438,
		'5:1': 455.5,
		'5:2': 465.5,
		'6:0': 485,
		'6:1': 494.5,
		'6:2': 503.5,
		'7:0': 550,
		'7:1': 558,
		'8a:0': 577,
		'8a:1': 586.5,
		'8b:0': 596.5,
		'8b:1': 605,
		'9:0': 615,
		'9:1': 625,
		'9:2': 635
	};
	gaitYCoordinates = {
		'10:0': 221.5,
		'10:1': 231,
		'11a1:0': 268,
		'11a1:1': 278,
		'11a2:0': 296,
		'11a2:1': 306,
		'11b1:0': 315,
		'11b1:1': 325,
		'11b2:0': 343,
		'11b2:1': 353,
		'12:0': 362,
		'12:1': 372,
		'13:0': 391,
		'13:1': 409.5,
		'14:0': 438,
		'14:1': 447,
		'14:2': 465.5,
		'15:0': 485,
		'15:1': 503,
		'15:2': 530.5,
		'16:0': 550,
		'16:1': 558
	};

	async buildPdf() {
		await this.initPDF();
		const timesRomanFont = await this.doc.embedFont(StandardFonts.TimesRoman);
		const tRBold = await this.doc.embedFont(StandardFonts.TimesRomanBold);
		const pages = this.doc.getPages();
		const page = pages[0];
		const { height } = page.getSize();
		const fontSize = 12;
		const balanceX = 280.5;
		const gaitX = 511;
		const radius = 5;
		let balanceTotalScore = 0;
		let gaitTotalScore = 0;
		// Drawing circles around PT's answers for the balance and gait sections
		for (const [idScore, coordinates] of Object.entries(this.balanceYCoordinates)) {
			const [id, score] = idScore.split(':');
			if (score === `${this.document.form_data[id]}`) {
				balanceTotalScore += parseInt(score);
				page.drawEllipse({
					x: balanceX,
					y: height - coordinates,
					xScale: radius,
					yScale: radius,
					borderColor: rgb(0, 0, 0),
					borderWidth: 1
				});
			}
		}
		// the gait section
		for (const [idScore, coordinates] of Object.entries(this.gaitYCoordinates)) {
			const [id, score] = idScore.split(':');
			if (score === `${this.document.form_data[id]}`) {
				gaitTotalScore += parseInt(score);
				page.drawEllipse({
					x: gaitX,
					y: height - coordinates,
					xScale: radius,
					yScale: radius,
					borderColor: rgb(0, 0, 0),
					borderWidth: 1
				});
			}
		}
		// Drawing the patient name
		page.drawText(`${this.patient.nom}${this.patient?.prenom ? ' ' + this.patient.prenom : ''}`, {
			x: 108,
			y: height - 70,
			size: fontSize,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
		// Drawing the date
		page.drawText(dayjs(this.document.date).format('DD/MM/YYYY'), {
			x: 355,
			y: height - 70,
			size: fontSize,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
		// Drawing the scores
		// total score
		const totalScore = balanceTotalScore + gaitTotalScore;
		this.drawScore(page, {
			score: totalScore.toFixed(0),
			x: 459,
			xEnd: 475,
			y: height - 83,
			fontSize: 14,
			font: tRBold,
			color: totalScore < 19 ? rgb(.9, 0, 0) : totalScore > 26 ? rgb(0.1, 0.7, 0.2) : rgb(.9, .55, 0)
		});
		// balance score
		this.drawScore(page, {
			score: balanceTotalScore.toFixed(0),
			x: 223,
			xEnd: 240,
			y: height - 111,
			fontSize,
			font: tRBold
		});
		// gait score
		this.drawScore(page, {
			score: gaitTotalScore.toFixed(0),
			x: 470,
			xEnd: 485,
			y: height - 111,
			fontSize,
			font: tRBold
		});
		this.signature(page, {
			x: 300,
			y: 260,
			size: fontSize,
			font: timesRomanFont,
			lineHeight: fontSize + 2,
			color: rgb(0, 0, 0)
		});
	}

	drawScore(page, { score, x, xEnd, y, fontSize, font, color = rgb(0, 0, 0) }) {
		page.drawLine({
			start: { x, y },
			end: { x: xEnd, y },
			thickness: 5,
			color: rgb(1, 1, 1)
		});
		page.drawText(`${score}`, {
			x,
			y,
			size: fontSize,
			font,
			color
		});
	}
}
