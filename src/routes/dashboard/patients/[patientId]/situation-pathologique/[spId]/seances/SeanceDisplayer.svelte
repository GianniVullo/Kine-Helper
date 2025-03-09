<script>
	import { t } from '../../../../../../../lib/i18n';
	let { patient, sp } = $props();
</script>

<CardTable>
	{#snippet header()}
		<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
		<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
			>Valeur</th>
		<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Modifier</th>
		<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Supprimer</th>
		<!-- TODO Mettre  -->
		<!-- <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span class="sr-only">Modifier</span>
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span class="sr-only">Imprimer</span>
                </th> -->
	{/snippet}
	{#snippet body()}
		{#each sp.attestations as attestation}
			<tr>
				<td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
					{dayjs(attestation.date).format('DD/MM/YYYY')}
				</td>
				<td class="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
					<div class="flex items-center">
						<div class="ml-4">
							<div class="font-medium text-gray-900">{patient.nom} {patient.prenom}</div>
							{#if attestation.porte_prescr}
								<div class="mt-1 text-gray-500">
									{$t('attestation.detail', 'porte_prescr')}
								</div>
							{/if}
						</div>
					</div>
				</td>
				<td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
					<div class="text-gray-900">{patient.adresse}</div>
					<div class="mt-1 text-gray-500">{patient.cp} {patient.localite}</div>
				</td>
				<td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
					{#if patient.tiers_payant}
						<div class="text-gray-900">
							{@render iconBadge(
								`mutuelle ${attestation.mutuelle_paid ? 'a' : "n'a pas"} payé!`,
								buildingIcon,
								attestation.mutuelle_paid ? 'green' : 'red'
							)}
						</div>
					{/if}
					{#if patient.ticket_moderateur}
						<div class="mt-1 text-gray-500">
							{@render iconBadge(
								`patient ${attestation.patient_paid ? 'a' : "n'a pas"} payé!`,
								userIcon,
								attestation.patient_paid ? 'green' : 'red'
							)}
						</div>
					{/if}
				</td>
				<td class="relative whitespace-nowrap py-5 pl-3 pr-4 text-left text-sm font-medium sm:pr-0">
					<Dropdown inner="actions" className="" id={attestation.attestation_id}>
						{#snippet dropper(menuItems, menuState)}
							<div
								id={attestation.attestation_id}
								style="width: max-content;"
								class="fixed z-10 mt-2 origin-bottom-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition duration-200 focus:outline-none {menuState
									? 'scale-100 opacity-100 ease-out'
									: 'pointer-events-none scale-95 opacity-0 ease-in'}"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="mobile-menu-button"
								tabindex="-1">
								<!-- Active: "bg-gray-100 outline-none", Not Active: "" -->
								{#each menuItemsList as { href, onclick, inner, icon }}
									{@render dropdownItemWithIcon(
										href ? href(attestation) : undefined,
										onclick ? onclick(attestation) : undefined,
										inner(attestation),
										icon(attestation)
									)}
								{/each}
							</div>
						{/snippet}
					</Dropdown>
				</td>
			</tr>
		{/each}
	{/snippet}
</CardTable>
