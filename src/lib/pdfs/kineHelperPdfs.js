import { get, writable } from 'svelte/store';
import { jsPDF } from 'jspdf';
import { user } from '../stores/UserStore';
import dayjs from 'dayjs';
import DBAdapter from '../forms/actions/dbAdapter';
import { open } from '@tauri-apps/plugin-shell';
import { patients } from '../stores/PatientStore';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';

function yPositionStore(initialValue) {
	const yStore = writable(initialValue);
	function update(y) {
		yStore.update((n) => {
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
	constructor(documentName, formData, patient, sp, docType, dirPath, obj) {
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
		this.patient = patient;
		this.sp = sp;
		this.yPosition = yPositionStore(this.margins.top);
		this.lineSpacing = 1.5;
		this.tightLineSpacing = 1.2;
		this.headingFontSize = 16;
		this.bodyFontSize = 10;
		this.docType = docType;
		this.dirPath = dirPath;
		this.data = obj;
	}
	buildPdf() {}

	buildDirPath() {
		return `${get(user).user.id}/${this.patient.nom}-${this.patient.prenom}(${
			this.patient.patient_id
		})/situation-pathologique-${this.sp.created_at}(${this.sp.sp_id})${
			this.dirPath.length > 0 ? '/' + this.dirPath : ''
		}`;
	}

	async buildPath() {
		let dataPath = await appLocalDataDir();
		let dirPath = `${dataPath}/${this.buildDirPath()}`;
		return dirPath;
	}
	async save_file() {
		this.buildPdf();
		console.log('in save_file, pdf built');
		let docOutput = this.doc.output('arraybuffer');
		let dirPath = await this.buildPath();
		await invoke('setup_path', {
			dirPath,
			fileName: this.documentName + '.pdf',
			fileContent: Array.from(new Uint8Array(docOutput))
		});
		console.log('in save_file, pdf sent');
		return { dirPath };
	}
	async save() {
		//! Finalement, comme l'API ne retourne pas le filePath je choisis d'émettre le pdf dans le dossier utilisateur et de l'ouvrir à partir du dossier utilisateur.
		let { dirPath } = await this.save_file();
		let db = new DBAdapter();
		let document = {
			form_data: this.formData,
			docType: this.docType,
			created_at: dayjs().format('YYYY-MM-DD'),
			document_id: crypto.randomUUID(),
			patient_id: this.patient.patient_id,
			sp_id: this.sp.sp_id,
			user_id: get(user).user.id
		};
		await db.save('documents', document);
		this.data = document;
		patients.update((p) => {
			p.find((p) => p.patient_id === this.patient.patient_id)
				.situations_pathologiques.find((sp) => sp.sp_id === this.sp.sp_id)
				.documents.push(document);
			return p;
		});
		console.log(
			'in pdfGeneration with path ==',
			dirPath + '/' + this.documentName.replaceAll(' ', ' ')
		);
	}

	async delete() {
		let db = new DBAdapter();
		await db.delete('documents', ['document_id', this.data.document_id]);
		let dirpath = await this.buildPath();
		let path = dirpath + '/' + this.documentName + '.pdf';
		if (await invoke('file_exists', { path })) {
			await invoke('delete_file', { path });
		}
		patients.update((ps) => {
			let p = ps.find((p) => p.patient_id === this.patient.patient_id);
			let sp = p.situations_pathologiques.find((sp) => sp.sp_id === this.sp.sp_id);
			sp.documents = sp.documents.filter((d) => d.document_id !== this.data.document_id);
			return ps;
		});
	}

	async open() {
		let dirpath = await this.buildPath();
		let path = dirpath + '/' + this.documentName + '.pdf';
		console.log('path', path);
		let exists = await invoke('file_exists', { path });
		console.log('exists', exists);
		if (exists) {
			console.log('try open facture');
			await open(path);
		} else {
			await this.save_file();
			await open(path);
		}
	}

	fullWidthTable(data, headers, { x = this.margins.left, y = get(this.yPosition) } = {}) {
		const table = this.doc.table(x, y, data, headers);
	}

	header(date = dayjs().format('DD/MM/YYYY')) {
		this.doc.setFontSize(this.bodyFontSize);
		this.doc.setFont('helvetica', 'normal');
		const dateText = 'Fait le ' + date;
		const dateTextWidth =
			(this.doc.getStringUnitWidth(dateText) * this.doc.internal.getFontSize()) /
			this.doc.internal.scaleFactor;
		const xPositionForDate = this.pageWidth - this.margins.right - dateTextWidth; // Subtract text width and margin from page width
		// La date
		this.doc.text(dateText, xPositionForDate, this.margins.top);
		this.signature();
		this.addParagraph('Kinésithérapeute');
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
		this.addParagraph(text, { maxWidth: width, x: textstart, fontWeight: 'bold', fontSize });
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
			y = undefined //* y start of columns pack
		} = {}
	) {
		console.log('in addRow');
		if (y) {
			this.yPosition.set(y);
		}
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
	async authSignature({
		x = this.margins.left + this.pageWidth / 2,
		y = this.pageHeight - 60
	} = {}) {
		console.log('in authSignature');
		let dirPath = await appLocalDataDir();
		console.log('in authSignature', dirPath);
		let path = `${dirPath}/signature.png`;
		if (await invoke('file_exists', { path })) {
			console.log('in authSignature the file exists');
			let img = this.uint8ArrayToBase64(Uint8Array.from(await invoke('retrieve_file', { path })));
			let desperateAttempt65 = new Image();
			desperateAttempt65.src = img;
			this.doc.addImage(img, 'png', x, y);
		}
	}

	uint8ArrayToBase64(byteArray) {
		let binaryString = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
		return `data:image/png;base64,${window.btoa(binaryString)}`;
	}
}
