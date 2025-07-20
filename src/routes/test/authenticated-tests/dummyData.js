export const dummyPatient = (user_id) => ({
	patient_id: 'b3c93c92-1234-4fbd-a7b0-ffb7d2c0eabc',
	created_at: '2025-07-15T12:34:56.000Z',
	nom: 'Dupont',
	prenom: 'Marie',
	niss: '86010112345',
	adresse: 'Rue des Lilas 12',
	cp: 1000,
	localite: 'Bruxelles',
	date_naissance: '1986-01-01',
	tel: '022345678',
	gsm: '0476123456',
	email: 'marie.dupont@example.com',
	sexe: 'F',
	mutualite: 110,
	num_affilie: '12345678901',
	tiers_payant: true,
	ticket_moderateur: false,
	bim: false,
	actif: true,
	numero_etablissement: 'BE123456789',
	service: 'Général',
	user_id,
	metadata: {
		notes: 'Patient très ponctuelle',
		allergies: ['pollen', 'pénicilline'],
		contact_urgence: {
			nom: 'Jean Dupont',
			tel: '0499123456'
		}
	}
});

export const modifiedData = {
	nom: 'Duponty',
	prenom: 'Marie-Anne',
	niss: '87010112345',
	adresse: 'Rue des Azalées 12',
	cp: 1080,
	localite: 'Ixelles',
	date_naissance: '1987-01-01',
	tel: '022345673',
	gsm: '0476123456',
	email: 'marie.dupont@example.com',
	sexe: 'F',
	mutualite: 128,
	num_affilie: null,
	tiers_payant: true,
	ticket_moderateur: false,
	bim: false,
	actif: true,
	numero_etablissement: 'BE123456789',
	service: 'Général'
};
