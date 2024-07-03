import { PDFGeneration } from './kineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import dayjs from 'dayjs';
import { t } from '../i18n';

export class FactureMutuelle extends PDFGeneration {
	constructor(formData, patient, sp, obj) {
		super(
			`tinetti ${patient.nom} ${patient.prenom} du ${dayjs(formData.date).format(
				'DD-MM-YYYY'
			)}`,
			formData,
			patient,
			sp,
			9,
			'',
			obj
		);
	}
	buildPdf() {
		this.header(dayjs(this.formData.date).format('DD/MM/YYYY'));
		this.yPosition.update(10);
		this.addCenteredText(get(t)('otherModal', 'facture'), { fontSize: this.headingFontSize });
		this.yPosition.update(10);
		this.addParagraph(get(t)('shared', 'greet'));
		this.yPosition.update(3);
		this.addParagraph(
			get(t)('pdfs', 'facture.body', {
				total: this.formData.tableRows[0]['total'] ?? '0',
				iban: get(user).profil.iban
			})
		);
		if (!this.patient.ticket_moderateur) {
			this.yPosition.update(3);
			this.addParagraph(get(t)('pdfs', 'facture.noticket'));
		}
		this.yPosition.update(3);
		this.addParagraph(get(t)('pdfs', 'facture.recap'));
		this.yPosition.update(7);
		this.addParagraph(get(t)('pdfs', 'greetings'));
		this.yPosition.update(5);
		for (const row of this.formData.tableRows) {
			for (const [k, v] of Object.entries(row)) {
				this.addParagraph(k, { fontWeight: 'bold' });
				this.yPosition.update(1);
				this.addParagraph(`${v}${k === 'total' ? ' €' : ''}`);
				this.yPosition.update(3);
			}
		}
	}
}
