import { PDFGeneration } from './kineHelperPdfs';
import { get } from 'svelte/store';
import { user } from '../stores/UserStore';
import dayjs from 'dayjs';

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
	constructor(formData, patient, sp) {
		super(
			`facture-patient ${patient.nom} ${patient.prenom} du ${dayjs(formData.created_at).format(
				'DD-MM-YYYY'
			)}.pdf`,
			formData,
			patient,
			sp,
			8
		);
		this.attestations = formData.attestations ?? sp.attestations.filter((a) =>
			formData.attestationsIds.includes(a.attestation_id)
		);
		if (formData.attestations) {
			delete this.formData.attestations;
		}
	}

	buildPdf() {
		console.log('formData', this.formData);
		this.header(dayjs(this.formData.date).format('DD/MM/YYYY'));
		this.yPosition.update(10);
		this.addCenteredText('Facture', { fontSize: this.headingFontSize });
		this.yPosition.update(10);
		this.addParagraph(
			this.patient.sexe
				? this.patient.sexe === 'M'
					? `Cher Mr ${this.patient.nom},`
					: `Chère Mme ${this.patient.nom},`
				: 'Madame, Monsieur,'
		);
		this.yPosition.update(5);
		this.addParagraph(
			`	Pouvez-vous verser la somme de ${this.formData.total ?? '0'} € sur le compte ${
				get(user).profil.iban
			} pour les prestations de kinésithérapie dispensées ? Veuillez mentionner en communication : "kiné-${
				this.patient.nom
			}".`
		);
		if (!this.patient.tiers_payant) {
			this.yPosition.update(3);
			this.addParagraph(
				'	Veuillez envoyer le(s) document(s) joint(s) à cette lettre à votre mutuelle pour être remboursé. Je vous invite à faire une copie de chacun des documents avant d’envoyer l’original à votre mutuelle.'
			);
		}
		this.yPosition.update(5);
		this.addParagraph(
			'Recevez, ' +
				(this.patient.sexe
					? this.patient.sexe === 'M'
						? 'cher Mr '
						: 'chère Mme '
					: 'Madame, Monsieur,') +
				this.patient.nom +
				', mes meilleures salutations.'
		);
		if (this.formData.with_details && this.formData.codes && this.attestations) {
			this.yPosition.update(10);
			this.addParagraph('Détail des prestations :', { fontWeight: 'bold' });
			this.yPosition.update(1);
			if (this.attestations.reduce((acc, att) => acc || att.with_indemnity, false)) {
				this.addParagraph(
					`(I) = indemnité (code ${this.formData.codes.get('indemnites')[0].code_reference})`,
					{ fontSize: 8 }
				);
			}
			if (
				this.attestations.reduce((acc, att) => acc || att.with_rapport, false) &&
				this.formData.codes.get('rapports').length > 0
			) {
				this.addParagraph(
					`(R) = rapport (code ${this.formData.codes.get('rapports')[0].code_reference})`,
					{ fontSize: 8 }
				);
			}
			if (this.attestations.reduce((acc, att) => acc || att.with_intake, false)) {
				this.addParagraph(
					`(Intake) - (code ${this.formData.codes.get('intake')[0].code_reference})`,
					{ fontSize: 8 }
				);
			}
			this.yPosition.update(3);
			this.buildDetail();
		}
	}

	buildDetail() {
		let lignes = [];
		for (const attestation of this.attestations) {
			let seances =
				attestation.seances ??
				this.sp.seances.filter((s) => s.attestation_id === attestation.attestation_id);
			for (const protoSeance of seances) {
				let seance = protoSeance.obj ?? protoSeance;
				let seance_ref = '';
				let seance_date = dayjs(seance.date).format('DD-MM-YYYY');
				seance_ref += this.formData.codes.get(seance.code_id).code_reference;
				if (attestation.with_rapport) {
					seance_ref += ' (R)';
				}
				if (attestation.with_indemnity) {
					seance_ref += ' (I)';
				}
				lignes.push({ Code: seance_ref, Date: seance_date });
			}
		}
		this.fullWidthTable(lignes.slice(0, lignes.length > 10 ? 10 : lignes.length), ['Code', 'Date']);
		if (lignes.length > 10) {
			this.fullWidthTable(
				lignes.slice(10, lignes.length > 20 ? 20 : lignes.length),
				['Code', 'Date'],
				{ x: this.pageWidth / 3 + this.margins.left - 12 }
			);
		}
		if (lignes.length > 20) {
			this.fullWidthTable(
				lignes.slice(20, lignes.length > 30 ? 30 : lignes.length),
				['Code', 'Date'],
				{ x: (this.pageWidth / 3) * 2 + this.margins.left - 24 }
			);
		}
		if (lignes.length > 30) {
			this.doc.addPage();
			this.yPosition.set(this.margins.top);
			this.addParagraph('Détail des prestations (suite) :', { fontWeight: 'bold' });
			this.yPosition.update(3);
			this.fullWidthTable(lignes.slice(30, lignes.length > 50 ? 50 : lignes.length), [
				'Code',
				'Date'
			]);
			if (lignes.length > 50) {
				this.fullWidthTable(
					lignes.slice(50, lignes.length > 70 ? 70 : lignes.length),
					['Code', 'Date'],
					{ x: this.pageWidth / 3 + this.margins.left - 12 }
				);
			}
			if (lignes.length > 70) {
				this.fullWidthTable(
					lignes.slice(70, lignes.length > 90 ? 90 : lignes.length),
					['Code', 'Date'],
					{ x: (this.pageWidth / 3) * 2 + this.margins.left - 24 }
				);
			}
			if (lignes.length > 90) {
				this.doc.addPage();
				this.yPosition.set(this.margins.top);
				this.addParagraph('Détail des prestations (suite) :', { fontWeight: 'bold' });
				this.yPosition.update(3);
				this.fullWidthTable(lignes.slice(90, lignes.length > 110 ? 110 : lignes.length), [
					'Code',
					'Date'
				]);
				if (lignes.length > 110) {
					this.fullWidthTable(
						lignes.slice(110, lignes.length > 130 ? 130 : lignes.length),
						['Code', 'Date'],
						{ x: this.pageWidth / 3 + this.margins.left - 12 }
					);
				}
				if (lignes.length > 130) {
					this.fullWidthTable(
						lignes.slice(130, lignes.length > 150 ? 150 : lignes.length),
						['Code', 'Date'],
						{ x: (this.pageWidth / 3) * 2 + this.margins.left - 24 }
					);
				}
			}
		}
	}
}
