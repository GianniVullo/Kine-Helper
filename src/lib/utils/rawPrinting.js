import { invoke } from '@tauri-apps/api/primitives';
export async function printAttestation() {
	let stuff = await invoke('build_document', {formData:{
		patient: {
			nom: 'Doe',
			prenom: 'John',
			mutualite: 'XYZ Mutual',
			niss: '12345678901',
			adresse: '1234 Main St',
			cp: '1000',
			localite: 'Brussels'
		},
		prescription: {
			prescripteur: {
				nom: 'Smith',
				prenom: 'Jane',
				inami: '987654321'
			},
			date: '2024-01-10',
		},
		attestation: {
            porte_prescr: true,
			date: '2024-01-10',
			total_recu: '150'
		},
		kine: {
			nom: 'Doe',
			prenom: 'Alice',
			inami: '123456789',
			adresse: '5678 Secondary St',
			cp: '1000',
			localite: 'Brussels',
			numero_bce: '246810'
		},
		situation_pathologique: {
			numero_etablissment: '5555',
			service: 'Physiotherapy'
		}
	}});
    console.log(stuff);
}
