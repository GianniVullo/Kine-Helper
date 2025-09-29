export class PrinterFineTuner {
	expandedSections = $state({
		identification: false,
		prestations: false,
		prescription: false,
		signature: false,
		remboursement: false
	});
	defaultValues = {
		initial_spacing_mm: 12,
		spacing_scale: 100,
		// Identification section
		id_name_to_mutuality: 108,
		id_mutuality_to_niss: 46,
		id_niss_to_address: 62,
		id_address_to_postal: 46,
		id_postal_to_next: 141,

		// Prestations section
		prest_name_to_table: 396,
		prest_line_0: 36,
		prest_line_1: 35,
		prest_line_2: 36,
		prest_line_3: 35,
		prest_line_4: 36,
		prest_line_5: 37,
		prest_line_6: 35,
		prest_line_7: 36,
		prest_line_8: 35,
		prest_line_9: 39,

		// Prescription section
		presc_spacing_0: 33,
		presc_spacing_1: 37,
		presc_spacing_2: 37,
		presc_spacing_3: 33,
		presc_spacing_4: 100,
		presc_spacing_5: 29,
		presc_spacing_6: 21,
		presc_spacing_7: 29,
		presc_spacing_8: 31,

		// Signature section
		sign_total_to_name: 112,
		sign_internal: 37,

		// Fixed spacings
		sign_name_line_spacing: 37,
		sign_after_location: 120,
		remb_to_bce: 79,
		remb_bce_to_date: 87,
		remb_date_to_total: 87
	};

	constructor() {
		this.sectionFields = {
			identification: [
				this.formatField('id_name_to_mutuality', 'Nom → Mutualité'),
				this.formatField('id_mutuality_to_niss', 'Mutualité → NISS'),
				this.formatField('id_niss_to_address', 'NISS → Adresse'),
				this.formatField('id_address_to_postal', 'Adresse → Code postal'),
				this.formatField('id_postal_to_next', 'Code postal → Section suivante')
			],
			prestations: [
				this.formatField('prest_name_to_table', 'Nom patient → Début du tableau'),
				this.formatField('prest_line_0', 'Ligne numéro 1'),
				this.formatField('prest_line_1', 'Ligne numéro 2'),
				this.formatField('prest_line_2', 'Ligne numéro 3'),
				this.formatField('prest_line_3', 'Ligne numéro 4'),
				this.formatField('prest_line_4', 'Ligne numéro 5'),
				this.formatField('prest_line_5', 'Ligne numéro 6'),
				this.formatField('prest_line_6', 'Ligne numéro 7'),
				this.formatField('prest_line_7', 'Ligne numéro 8'),
				this.formatField('prest_line_8', 'Ligne numéro 9'),
				this.formatField('prest_line_9', 'Ligne numéro 10')
			],
			prescription: [
				this.formatField('presc_spacing_0', `Espacement n°${0 + 1}`),
				this.formatField('presc_spacing_1', `Espacement n°${1 + 1}`),
				this.formatField('presc_spacing_2', `Espacement n°${2 + 1}`),
				this.formatField('presc_spacing_3', `Espacement n°${3 + 1}`),
				this.formatField('presc_spacing_4', `Espacement n°${4 + 1}`),
				this.formatField('presc_spacing_5', `Espacement n°${5 + 1}`),
				this.formatField('presc_spacing_6', `Espacement n°${6 + 1}`),
				this.formatField('presc_spacing_7', `Espacement n°${7 + 1}`),
				this.formatField('presc_spacing_8', `Espacement n°${8 + 1}`)
			],
			signature: [
				this.formatField('sign_total_to_name', 'Total -> Identification du dispensateur'),
				this.formatField('sign_internal', 'Total -> Identification du dispensateur'),
				this.formatField('sign_name_line_spacing', "Interligne de l'identification"),
				this.formatField('sign_after_location', 'Identification -> Date')
			],
			remboursement: [
				this.formatField('remb_to_bce', 'Section Identification -> n° BCE'),
				this.formatField('remb_bce_to_date', 'n° BCE -> Date'),
				this.formatField('remb_date_to_total', 'Date -> Total reçu')
			]
		};
		this.fields = {};
	}

	formatField(name, titre, help) {
		console.log('Formating', name);

		return { name, titre, help, inputType: 'number', defaultValue: this.defaultValues[name] };
	}
}
