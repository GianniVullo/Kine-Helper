<script>
	import Card from '../../../../lib/components/Card.svelte';
	import kineURL from '../../../../lib/assets/kine.avif';
	import secretaireURL from '../../../../lib/assets/secretaire.avif';
	import adminURL from '../../../../lib/assets/admin.avif';
	import ownerURL from '../../../../lib/assets/owner.avif';

	// import { isoDateTime, object, pipe, string, uuid } from 'valibot';
	// import { Formulaire } from '../../../../lib/cloud/libraries/formHandler.svelte';
	// import { Form, FormSection } from '../../../../lib/components/forms/blocks';
	// import { uuidVal } from '../../../../lib/components/forms/validators/baseValidators';
	// import SimpleSelect from '../../../../lib/components/forms/fields/SimpleSelect.svelte';

	let { membre, roles } = $props();
	/**
	 * TODO en faire un formulaire
	 */
	// let validateurs = {
	// 	id: uuidVal(),
	// 	organization_id: uuidVal(),
	// 	user_id: uuidVal(),
	// 	role_id: uuidVal(),
	// 	assigned_by: uuid(),
	// 	assigned_at: pipe(string(), isoDateTime())
	// };
	// let formHandler = new Formulaire({
	// 	validateurs,
	// 	async onValid() {},
	// 	schema: object(validateurs)
	// });

	// const fieldSchema = [
	// 	{
	// 		id: 'id',
	// 		name: 'id',
	// 		inputType: 'hidden'
	// 	},
	// 	{
	// 		id: 'organization_id',
	// 		name: 'organization_id',
	// 		inputType: 'hidden'
	// 	},
	// 	{
	// 		id: 'user_id',
	// 		name: 'user_id',
	// 		inputType: 'hidden'
	// 	},
	// 	{
	// 		id: 'assigned_by',
	// 		name: 'assigned_by',
	// 		inputType: 'hidden'
	// 	},
	// 	{
	// 		id: 'assigned_at',
	// 		name: 'assigned_at',
	// 		inputType: 'hidden'
	// 	}
	// ];

	function getImgUrl(role) {
		switch (role) {
			case 'admin':
				return adminURL;
			case 'Secretaire':
				return secretaireURL;
			case 'owner':
				return ownerURL;
			default:
				return kineURL;
		}
	}
	console.log(membre);
</script>

<!-- <Form className="grid grid-cols-6"> -->
<Card className="col-span-full md:col-span-2">
	{#snippet body()}
		<img src={getImgUrl(membre.user_roles[0].role.name)} alt="" />
	{/snippet}
	{#snippet footer()}
		<div
			class="flex w-full flex-col items-center justify-center text-center text-gray-900 dark:text-white">
			<h2 class="font-medium">{membre.prenom} {membre.nom}</h2>
			<p class="text-gray-500 dark:text-gray-400">{membre.user_roles[0].role.name}</p>
			<!-- <SimpleSelect label="" options={roles.map((r) => ({ value: r.id, label: r.name }))} /> -->
			<!-- {@render temporarySelect('Administrateur')} -->
		</div>
	{/snippet}
</Card>
<!-- </Form> -->
