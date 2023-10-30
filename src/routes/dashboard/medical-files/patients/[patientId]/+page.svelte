<script>
    import { page } from '$app/stores';
    import { patients } from '../../../../../lib/stores/PatientStore'
    let tabs = ["Prescriptions", "Documents", "Attestations", "Séances"]
    let selectedId = tabs[0]

    console.log($page.params);
    console.log($patients.find(values => values.patient_id == $page.params.patientId));
    $: patient = $patients.find(pat => pat.patient_id == $page.params.patientId)
</script>

<section class="bg-gray-100 min-h-screen p-8">
    <!-- Breadcrumb -->
    <div class="mb-6">
        <a href="/medical-files" class="text-blue-600 hover:underline">Fichiers médicaux</a>
        <span class="mx-2 text-gray-400">/</span>
        <span class="font-bold text-gray-700">{patient.nom} {patient.prenom}</span>
    </div>

    <!-- Pathological Situations List -->
    <div>
        <!-- TABBED PANE -->
        {#each patient.situation_pathologiques ?? [] as ps}
        <details class="border rounded mb-4">
            <summary class="bg-gray-200 cursor-pointer p-4 hover:bg-gray-300">
                {ps.created_at}
            </summary>
            <div class="p-4">
                <!-- Tabbed Panel -->
                <div>
                    <div class="border-b mb-4">
                        <button class="py-2 px-4 hover:bg-gray-200">Prescriptions</button>
                        <button class="py-2 px-4 hover:bg-gray-200">Documents</button>
                        <button class="py-2 px-4 hover:bg-gray-200">Attestations</button>
                        <button class="py-2 px-4 hover:bg-gray-200">Séances</button>
                    </div>

                    <!-- Prescriptions Tab Content -->
                    <div>
                        {#each ps.prescriptions as prescription}
                        <details class="border rounded mb-4">
                            <summary class="bg-gray-300 cursor-pointer p-2 hover:bg-gray-400">
                                {prescription.date} - {prescription.prescripteur}
                            </summary>
                            <div class="p-2">
                                <p><strong>Numéro de prescription:</strong> {prescription.prescription_id}</p>
                                <p><strong>Prescripteur:</strong> {prescription.prescripteur}</p>
                                <!-- ... More attributes here ... -->
                            </div>
                        </details>
                        {/each}
                    </div>

                    <!-- Other tabs' content would follow a similar structure, adapting for their respective data -->
                </div>
            </div>
        </details>
        {:else}
        Merde
        {/each}
    </div>
</section>
