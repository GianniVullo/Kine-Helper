import { PDFGeneration } from './KineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import dayjs from 'dayjs';

export class FactureMutuelle extends PDFGeneration {
	constructor(formData, patient, sp) {
		super(
			`facture-mutuelle ${patient.nom} ${patient.prenom} du ${dayjs(formData.created_at).format(
				'DD-MM-YYYY'
			)}.pdf`,
			formData,
			patient,
			sp,
			9
		);
	}
	buildPdf() {
		this.header(dayjs(this.formData.date).format('DD/MM/YYYY'));
		this.yPosition.update(10);
		this.addCenteredText('Facture', { fontSize: this.headingFontSize });
		this.yPosition.update(10);
		this.addParagraph('Madame, Monsieur,');
		this.yPosition.update(3);
		this.addParagraph(
			`Pouvez-vous verser la somme de ${
				this.formData.tableRows[0]['total'] ?? '0'
			} € sur le compte ${
				get(user).profil.iban
			} pour les prestations de kinésithérapie dispensées à vos affiliés ?`
		);
		if (!this.patient.ticket_moderateur) {
			this.yPosition.update(3);
			this.addParagraph(
				"Le patient s'est déclaré dans l'impossibilité de payer le ticket modérateur."
			);
		}
		this.yPosition.update(3);
		this.addParagraph('Vous trouverez ci-dessous le tableau récapitulatif de ce montant.');
		this.yPosition.update(7);
		this.addParagraph('Recevez, Madame, Monsieur, mes meilleures salutations.');
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
