import { get } from 'svelte/store';
import { file_exists, open_file, read_file, remove_file, save_to_disk } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';
import { invoke } from '@tauri-apps/api/core';
import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from 'pdf-lib';
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs';

/**
 * BetterPDFGeneration is here to leverage another way of working with pdf. Previously we used jsPDF that creates PDF from scratch. This was ambitious and, frankly, a bad idea. First of all because every content required a considerable work, was very hard to maintain against the changes that might occur throughout the year because of all the Riziv updates.
 * Here I want to switch to a canva based pdf generation. We proceed in 3 steps :
 * 		- create and maintain a Google Doc of these documents
 * 		- store these canvas into Tauri's Resources folder. (or even better, store them on the supabase S3 server to achieve maximum flexibility (we could even imagine that everyone could start customizing their docs (no need for that yet but its a cool idea)) and minimal download for my servers )
 * 		- use PDF-lib Javascript package to create the pdfs on user's demand by simply writing missing data on the docs pdf bytes and saving the results as a new pdf on the user's computer.
 *
 * KEY Takes
 * 		- The API needs to stay the same around the PDF manipulations : path builder, save, delete, open, print, etc.
 * 		- The API needs to change around the building steps. We can still keep some generics tho like signing, etc
 */
export class BetterPDFGeneration {
	yPosition = $state();
	/**
	 * * @type {string}
	 */
	canvaName;
	/**
	 * * @type {PDFDocument | null}
	 */
	doc;
	/**
	 * * @type {string}
	 */
	dirPath;
	constructor({ document, patient, sp }) {
		this.document = document;
		this.patient = patient;
		this.sp = sp;
		this.headingFontSize = 16;
		this.bodyFontSize = 10;
		this.lineSpacing = this.bodyFontSize + 1.5;
		this.tightLineSpacing = this.bodyFontSize + 1;
	}
	async initPDF() {
		let canvaBytes = await readFile(this.canvaName, { baseDir: BaseDirectory.Resource });
		this.doc = await PDFDocument.load(canvaBytes);
	}
	async buildPdf() {}

	buildDirPath() {
		return `${appState.user.id}/patient${
			this.patient.patient_id
		}/situation-pathologique-${this.sp.created_at}(${this.sp.sp_id})${
			this.dirPath.length > 0 ? '/' + this.dirPath : ''
		}`;
	}

	async buildPath() {
		let dirPath = this.buildDirPath();
		return dirPath;
	}
	async save_file() {
		await this.buildPdf();
		console.log('in save_file, pdf built');
		let docOutput = await this.doc.save();
		let dirPath = await this.buildPath();
		await save_to_disk(dirPath, this.document.id + '.pdf', docOutput);
		console.log('in save_file, pdf sent');
		return { dirPath };
	}
	async save() {
		let { dirPath } = await this.save_file();
		if (!appState.db) {
			await appState.init({});
		}
		await appState.db.insert('documents', this.document);
	}

	async delete() {
		console.log('arrived in delete');
		let path = await this.get_path();
		try {
			if (await file_exists(path)) {
				console.log('the file exists');
				await remove_file(path, { recursive: false });
				console.log('the file is removed');
			}
			return { error: null };
		} catch (error) {
			return { error };
		}
	}

	async open() {
		let path = await this.get_path();
		console.log('path', path);
		/**
		 *! Pour l'instant j'ai eu recours à des fonctions écrites en Rust pour
		 *! manipuler le filesystem mais il serait préférable d'utiliser le plugin
		 *! Tauri-fs à la place
		 */
		if (!(await file_exists(path))) {
			//* Si le pdf n'existe pas dans le filesystem on le crée
			await this.save_file();
		}
		console.log('try open facture');
		try {
			await open_file(path);
		} catch (error) {
			//* Dès lors on ouvre le dossier et on laisse l'utilisateurs s'occuper de l'ouverture lui-même
			await open_file(dirpath);
		}
	}

	async get_path() {
		let dirpath = await this.buildPath();
		let path = dirpath + (this.platform === 'windows' ? '\\' : '/') + this.document.id + '.pdf';
		return path;
	}

	async print(printerName) {
		// TODO: 1. envoyer le pdf filePath to Tauri Command print
		await invoke('print_pdf', {
			printerName,
			filePath: await this.get_path()
		});
	}

	fullWidthTable(data, headers, { x = this.margins.left, y = get(this.yPosition) } = {}) {
		const table = this.doc.table(x, y, data, headers);
	}

	// TODO add a header method that is better
	// header(date = dayjs().format('DD/MM/YYYY')) {
	// 	this.doc.setFontSize(this.bodyFontSize);
	// 	this.doc.setFont('helvetica', 'normal');
	// 	const dateText = 'Fait le ' + date;
	// 	const dateTextWidth =
	// 		(this.doc.getStringUnitWidth(dateText) * this.doc.internal.getFontSize()) /
	// 		this.doc.internal.scaleFactor;
	// 	const xPositionForDate = this.pageWidth - this.margins.right - dateTextWidth; // Subtract text width and margin from page width
	// 	// La date
	// 	this.doc.text(dateText, xPositionForDate, this.margins.top);
	// 	this.signature();
	// 	this.addParagraph('Kinésithérapeute');
	// }

	/**
	 *
	 * @param {PDFPage} page
	 * @param {{x: number, y: number, size:number, font: PDFFont, lineHeight: number, color: rgb} } param1
	 */
	signature(
		page,
		{
			x,
			y,
			size = this.bodyFontSize,
			font,
			lineHeight = this.lineSpacing,
			color = rgb(0, 0, 0)
		} = {}
	) {
		page.drawText(
			appState.user
				? `${appState.user.nom} ${appState.user.prenom}\n${appState.user.adresse}\n${appState.user.cp} ${appState.user.localite}\n${appState.user.inami}`
				: 'John Doe\n123 Main St\n1000 Brussels\n12345678901',
			{ x, y, size, font, lineHeight, color }
		);
	}
	async authSignature({
		x = this.margins.left + this.pageWidth / 2,
		y = this.pageHeight - 60
	} = {}) {
		//* fonctionnalité bonus :
		//* Si l'utilisateur place un png contennant sa signature sur un rectangle de 200x125 Kiné Helper signera le pdf pour lui
		if (await file_exists('signature.png')) {
			console.log('in authSignature the file exists');
			let img = this.uint8ArrayToBase64(await read_file('signature.png'));
			let desperateAttempt65 = new Image();
			desperateAttempt65.src = img; // lul
			this.doc.addImage(img, 'png', x, y);
		}
	}

	uint8ArrayToBase64(byteArray) {
		let binaryString = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
		return `data:image/png;base64,${window.btoa(binaryString)}`;
	}

	get patient_full_name() {
		return `${this.patient.nom} ${this.patient?.prenom}`;
	}

	formattedAddress(person) {
		return `${person.adresse}\n${person.cp} ${person.localite}`;
	}

	wrapTextPreservingUserBreaks(text, maxLen = 140) {
		return text
			.split('\n') // respect user line breaks
			.map((line) => {
				const words = line.split(' ');
				const wrapped = [];
				let currentLine = '';

				for (const word of words) {
					// Check if adding the word exceeds the limit
					if ((currentLine + ' ' + word).trim().length > maxLen) {
						wrapped.push(currentLine.trim());
						currentLine = word; // start new line
					} else {
						currentLine += ' ' + word;
					}
				}

				if (currentLine.trim()) {
					wrapped.push(currentLine.trim());
				}

				return wrapped.join('\n');
			})
			.join('\n');
	}

	drawParagraph(
		page,
		text,
		{
			x = this.leftMargin,
			y = get(this.yPosition),
			size = this.bodyFontSize,
			font = this.tR,
			lineHeight = this.lineSpacing,
			color = rgb(0, 0, 0),
			maxLen = this.maxLen || 140
		} = {}
	) {
		page.drawText(this.wrapTextPreservingUserBreaks(text, maxLen), {
			x,
			y,
			size,
			font,
			lineHeight,
			color
		});
	}
}
