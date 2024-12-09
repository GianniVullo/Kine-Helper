import { UserOperationsHandler } from './abstractHandler';

function setupAttestationOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	return opsHandler;
}

export async function createAttestation(data) {
	const opsHandler = setupAttestationOpsHandler();
	opsHandler.execute(async () => {
		
	});
}

export async function updateAttestation(data) {}

export async function deleteAttestation(data) {}
