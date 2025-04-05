import { PDFGeneration } from './kineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import dayjs from 'dayjs';
import { t } from '../i18n';
import { appState } from '../managers/AppState.svelte';

/**.
 * @typedef {Object} FormData
 * @property {object} patient
 * @property {number} total
 * @property {boolean} with_details
 * @property {object?} codes
 * @property {Array<string>?} attestationIds
 */
export class FacturePatient extends PDFGeneration {
	/**
	 * @param {string} documentName - Le nom du document.
	 * @param {FormData} formData - Les infos pour créer le pdf.
	 */
	constructor(formData, patient, sp, codes, attestations) {
		super(formData.id, formData, patient, sp, 8, 'factures', formData);
		this.sp = sp;
		this.attestations = attestations;
		this.codes = codes;
		this.seances = this.sp.seances.filter((s) =>
			this.attestations.map((a) => a.attestation_id).includes(s.attestation_id)
		);
		this.seances.sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1));
	}

	buildPdf() {
		console.log('formData', this.formData);
		this.header(dayjs(this.formData.date).format('DD/MM/YYYY'));
		this.yPosition.update(10);
		this.addCenteredText(get(t)('otherModal', 'facture'), { fontSize: this.headingFontSize });
		this.yPosition.update(10);
		this.addParagraph(get(t)('shared', 'greet'));
		this.yPosition.update(5);
		this.addParagraph(
			get(t)('pdfs', 'facture.body2', {
				total: this.formData.total ?? '0',
				iban: appState.user.iban,
				patientNom: this.patient.nom
			})
		);
		if (!this.patient.tiers_payant) {
			this.yPosition.update(3);
			this.addParagraph(get(t)('pdfs', 'facture.consigne'));
		}
		this.yPosition.update(5);
		this.addParagraph(get(t)('pdfs', 'greetings'));
		if (this.codes && this.attestations) {
			this.yPosition.update(10);
			this.addParagraph('', { fontWeight: 'bold' });
			this.yPosition.update(1);
			if (this.seances.reduce((acc, att) => acc || att.indemnite, false)) {
				this.addParagraph(
					`(I) = ${get(t)('pdfs', 'facture.ind')} (code ${
						this.codes.get('indemnite').code_reference
					})`,
					{ fontSize: 8 }
				);
			}
			if (
				this.seances.reduce((acc, att) => acc || att.rapport_ecrit, false) &&
				this.codes.get('rapports').length > 0
			) {
				this.addParagraph(
					`(R) = ${get(t)('sp.update', 'label.rapport_ecrit')} (code ${
						this.codes.get('rapports').code_reference
					})`,
					{ fontSize: 8 }
				);
			}
			if (this.seances.reduce((acc, att) => acc || att.metadata?.intake, false)) {
				this.addParagraph(`(Itk) = Intake (code ${this.codes.get('intake').code_reference})`, {
					fontSize: 8
				});
			}
			this.yPosition.update(3);
			this.buildDetail();
		}
	}

	buildDetail() {
		let lignes = [];
		let prestaSuite = get(t)('pdfs', 'facture.detail');
		prestaSuite = `${prestaSuite.substring(0, prestaSuite.length - 1)} (${get(t)(
			'shared',
			'next'
		)}) :`;
		for (const protoSeance of this.seances) {
			console.log('protoSeance', protoSeance);
			let seance = protoSeance.obj ?? protoSeance;
			let seance_ref = '';
			let seance_date = dayjs(seance.date).format('DD-MM-YYYY');
			seance_ref += this.codes.get(seance.code_id).code_reference;
			console.log('seance in buildDetail', seance);
			if (seance.rapport_ecrit) {
				seance_ref += ' (R)';
			}
			if (seance.indemnite) {
				seance_ref += ' (I)';
			}
			if (seance.metadata?.intake) {
				seance_ref += ' (Itk)';
			}
			lignes.push({ Code: seance_ref, Date: seance_date });
		}
		this.fullWidthTable(lignes.slice(0, lignes.length > 10 ? 10 : lignes.length), [
			'Code',
			get(t)('shared', 'date')
		]);
		if (lignes.length > 10) {
			this.fullWidthTable(
				lignes.slice(10, lignes.length > 20 ? 20 : lignes.length),
				['Code', get(t)('shared', 'date')],
				{ x: this.pageWidth / 3 + this.margins.left - 12 }
			);
		}
		if (lignes.length > 20) {
			this.fullWidthTable(
				lignes.slice(20, lignes.length > 30 ? 30 : lignes.length),
				['Code', get(t)('shared', 'date')],
				{ x: (this.pageWidth / 3) * 2 + this.margins.left - 24 }
			);
		}
		if (lignes.length > 30) {
			this.doc.addPage();
			this.yPosition.set(this.margins.top);
			this.addParagraph(prestaSuite, { fontWeight: 'bold' });
			this.yPosition.update(3);
			this.fullWidthTable(lignes.slice(30, lignes.length > 50 ? 50 : lignes.length), [
				'Code',
				'Date'
			]);
			if (lignes.length > 50) {
				this.fullWidthTable(
					lignes.slice(50, lignes.length > 70 ? 70 : lignes.length),
					['Code', get(t)('shared', 'date')],
					{ x: this.pageWidth / 3 + this.margins.left - 12 }
				);
			}
			if (lignes.length > 70) {
				this.fullWidthTable(
					lignes.slice(70, lignes.length > 90 ? 90 : lignes.length),
					['Code', get(t)('shared', 'date')],
					{ x: (this.pageWidth / 3) * 2 + this.margins.left - 24 }
				);
			}
			if (lignes.length > 90) {
				this.doc.addPage();
				this.yPosition.set(this.margins.top);
				this.addParagraph(prestaSuite, { fontWeight: 'bold' });
				this.yPosition.update(3);
				this.fullWidthTable(lignes.slice(90, lignes.length > 110 ? 110 : lignes.length), [
					'Code',
					get(t)('shared', 'date')
				]);
				if (lignes.length > 110) {
					this.fullWidthTable(
						lignes.slice(110, lignes.length > 130 ? 130 : lignes.length),
						['Code', get(t)('shared', 'date')],
						{ x: this.pageWidth / 3 + this.margins.left - 12 }
					);
				}
				if (lignes.length > 130) {
					this.fullWidthTable(
						lignes.slice(130, lignes.length > 150 ? 150 : lignes.length),
						['Code', get(t)('shared', 'date')],
						{ x: (this.pageWidth / 3) * 2 + this.margins.left - 24 }
					);
				}
			}
		}
	}
}
