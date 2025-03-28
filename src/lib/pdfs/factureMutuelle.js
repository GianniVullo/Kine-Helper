import { PDFGeneration } from './kineHelperPdfs';
import { get } from 'svelte/store';
import dayjs from 'dayjs';
import { t } from '../i18n';
import { appState } from '../managers/AppState.svelte';

export class FactureMutuelle extends PDFGeneration {
	constructor(formData, patient, sp, codes, attestations) {
		super(formData.id, formData, patient, sp, 9, 'factures', formData);
		const attestationsIds = attestations.map((a) => a.attestation_id);
		let seances = sp.seances.filter((s) => attestationsIds.includes(s.attestation_id));
		const has_intake = seances.some((s) => s.metadata?.intake);
		const has_rapport_ecrit = seances.some((s) => s.rapport_ecrit);
		const has_indemnite = seances.some((s) => s.indemnite);
		console.log('has_intake', has_intake);
		console.log('has_rapport_ecrit', has_rapport_ecrit);
		console.log('has_indemnite', has_indemnite);
		this.tableRows = [
			{
				Nom: `${patient.nom}\n${patient?.prenom ?? ''}`,
				NISS: patient.niss,
				Codes: this.codeRefChain(codes, has_intake, has_rapport_ecrit, has_indemnite),
				'Nbr. de prestations effectuées': `${seances.length}`,
				total: formData.total
			}
		];
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
				total: this.tableRows[0]['total'] ?? '0',
				iban: appState.user.iban
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
		for (const row of this.tableRows) {
			for (const [k, v] of Object.entries(row)) {
				this.addParagraph(k, { fontWeight: 'bold' });
				this.yPosition.update(1);
				this.addParagraph(`${v}${k === 'total' ? ' €' : ''}`);
				this.yPosition.update(3);
			}
		}
	}

	codeRefChain(codes, has_intake, has_rapport_ecrit, has_indemnite) {
		let ref = '';
		for (const [key, value] of codes.entries()) {
			console.log('key', key);
			console.log('value', value);
			switch (key) {
				case 'rapports':
					if (has_rapport_ecrit) {
						ref += value.code_reference + ' - ' + value.honoraire.toFixed(2) + '€ \n';
					}
					break;
				case 'indemnites':
					if (has_indemnite) {
						console.log('iindeminty', value[0]);
						ref += value.code_reference + ' - ' + value.honoraire.toFixed(2) + '€ \n';
					}
					break;
				case 'intake':
					if (has_intake) {
						ref += value.code_reference + ' - ' + value.honoraire.toFixed(2) + '€ \n';
					}
					break;
				default:
					ref += value.code_reference + ' - ' + value.honoraire.toFixed(2) + '€\n';
					break;
			}
		}
		console.log('ref', ref);
		return ref;
	}
}
