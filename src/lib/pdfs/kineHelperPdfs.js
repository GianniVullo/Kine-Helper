import { get, writable } from 'svelte/store';
import { writeBinaryFile } from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { jsPDF } from 'jspdf';
import { user } from '../stores/UserStore';

function yPositionStore(initialValue) {
	const yStore = writable(initialValue);
	function update(y) {
		yStore.update((n) => {
			console.log(`Store value == ${n}, value to add == ${y}, sum == ${n + y}`);
			return n + y;
		});
	}
	return {
		subscribe: yStore.subscribe,
		set: yStore.set,
		update
	};
}

export class PDFGeneration {
	constructor(documentName, formData) {
		this.documentName = documentName;
		this.formData = formData;
		this.doc = new jsPDF();
		this.pageWidth = this.doc.internal.pageSize.getWidth();
		this.pageHeight = this.doc.internal.pageSize.getHeight();
		this.xPosition = writable(20);
		this.margins = {
			top: 15,
			bottom: 15,
			left: 24.5,
			right: 24.5
		};
		this.yPosition = yPositionStore(this.margins.top);
		this.lineSpacing = 1.5;
		this.tightLineSpacing = 1.2;
		this.headingFontSize = 16;
		this.bodyFontSize = 10;
	}
	buildPdf() {}
	async save() {
		this.buildPdf();
		let path = await save({ filters: [{ name: this.documentName, extensions: ['pdf'] }] });
		console.log('in pdfGeneration with path ==', path);
		await writeBinaryFile(path, this.doc.output('arraybuffer'));
	}
	addParagraph(
		text,
		{
			x = this.margins.left,
			y = get(this.yPosition),
			fontSize = this.bodyFontSize,
			fontWeight = 'normal',
			fontFamily = 'helvetica',
			lineHeight = this.lineSpacing,
			fontStyle,
			maxWidth = undefined,
			dontUpdatePosition = false
		} = {}
	) {
		console.log('in addParagraph with', text);
		this.doc.setFontSize(fontSize);
		this.doc.setFont(fontFamily, fontWeight);
		// Split text to ensure it fits within the margins
		const lines = this.doc.splitTextToSize(
			text,
			maxWidth ? maxWidth : this.pageWidth - x - this.margins.right
		);

		// Draw each line of text
		lines.forEach((line, index) => {
			this.doc.text(line, x, y + ((index * fontSize) / 3.52778) * lineHeight);
			if (!dontUpdatePosition) {
				this.yPosition.update((fontSize / 3.52778) * lineHeight);
			}
		});
	}
	underlineText(text, x = x) {
		const textWidth = this.doc.getTextWidth(text);
		const underlineSpace = get(this.yPosition) + 0.5;
		this.doc.line(x, underlineSpace, x + textWidth, underlineSpace);
	}
	addCenteredText(
		text,
		{ fontSize = this.bodyFontSize, fontWeight = 'normal', fontFamily = 'helvetica' } = {}
	) {
		console.log(`in addCenteredText with ${text} AND ${get(this.yPosition)} `);
		this.doc.setFontSize(fontSize);
		this.doc.setFont(fontFamily, fontWeight);

		const textWidth =
			(this.doc.getStringUnitWidth(text) * fontSize) / this.doc.internal.scaleFactor;
		const x = (this.pageWidth - textWidth) / 2;
		console.log('in addCenteredText with', text);
		this.doc.text(text, x, get(this.yPosition));
		this.yPosition.update(fontSize / 3.52778);
	}
	addCenteredCard(
		text,
		{
			x = this.margins.left,
			y = get(this.yPosition),
			width,
			height,
			fontSize = 10,
			fontWeight = 'normal',
			fontFamily = 'helvetica',
			cardColor = '#FFFFFF',
			padding
		} = {}
	) {
		const textLines = this.doc.splitTextToSize(text, width);
		const textHeight = ((textLines.length * fontSize) / 3.52778) * 1.2;
		const textstart = x + 20;
		this.yPosition.update(5);
		this.addParagraph(text, { maxWidth: width, x: textstart, fontWeight: 'bold' });
		// Set card style
		this.doc.setDrawColor(cardColor);
		this.doc.rect(textstart - padding, y, width + padding * 2, textHeight + padding * 2);
		this.yPosition.update(padding * 2);
	}
	addRow(
		columns, //* Columns est une matrice de tuple function, function argument
		{
			columnsWidth, //* liste de columns Width
			x = this.margins.left, //* x start of columns pack
			y = get(this.yPosition) //* y start of columns pack
		} = {}
	) {
		for (const column of columns) {
			// console.log(`in addColumns forloop with ${column}`);
			if (column.length > 1) {
				column[0].bind(this)(...column[1]);
			} else {
				column[0].bind(this)();
			}
		}
	}
	signature(x = this.margins.left) {
		this.addParagraph(`${get(user).profil.nom} ${get(user).profil.prenom}`, { x: x });
		this.addParagraph(get(user).profil.adresse, { x: x });
		this.addParagraph(`${get(user).profil.cp} ${get(user).profil.localite}`, { x: x });
		this.addParagraph(get(user).profil.inami, { x: x });
	}
}

function addHeader(
	doc,
	text,
	yPosition,
	{ fontSize = 16, fontWeight = 'bold', fontFamily = 'helvetica', fontStyle }
) {
	doc.setFontSize(fontSize);
	doc.setFont(fontFamily, fontWeight);
	doc.text(text, margins.left, get(yPosition));
	if (fontStyle == 'underline') {
		underlineText(doc, text, yPosition);
	}
	yPosition.update((y) => y + fontSize + 10); // Update Y position for next element
}

// Function to draw a checkbox
function addCheckbox(doc, isChecked, { x = 20, y = null, size = 5 }, yPosition) {
	if (y === null) {
		y = get(yPosition);
		yPosition.update((y) => y + size + 6); // Update Y position for next element
	}
	doc.rect(x, y, size, size);
	if (isChecked) {
		doc.setFont('zapfdingbats');
		doc.setFontSize(size);
		doc.text('4', x + 1, y + size);
	}
}
