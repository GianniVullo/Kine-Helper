// /** @type {import('./$types').PageLoad} */
// export async function load({ parent, params }) {
// 	const { patient } = await parent();
// 	console.log('the sp from update page', patient);
// 	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === params.spId);
// 	return {
// 		sp,
// 		prescription: sp.prescriptions.find(
// 			(prescription) => prescription.prescription_id === params.prescriptionId
// 		)
// 	};
// }

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [
		{
			patientId: 'test-patient',
			spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2',
			prescriptionId: '14a74ea8-9fb6-4f5b-acee-7bf09bed5285'
		}
	];
}
