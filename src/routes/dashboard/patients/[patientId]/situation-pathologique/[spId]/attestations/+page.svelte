<script>
    import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
    import { page } from '$app/stores';
	import { getContext } from "svelte";
	import { selectPatients } from "../../../../../../../lib/stores/supabaseClient";
	import dayjs from "dayjs";

    let patient = getContext('patient');
    let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
    let valueSingle = sp.attestations.length > 0 ? sp.attestations[0].attestation_id : null;
    $: selected = sp.attestations.find((attestation) => attestation.attestation_id === valueSingle);
</script>

{#if sp.attestations.length > 0}
<div class="flex">
    <ListBox >
        {#each sp.attestations as attestation}
             <ListBoxItem bind:group={valueSingle} name="medium" value={attestation.attestation_id}>Attestation du {dayjs(attestation.date).format('DD/MM/YYYY')}</ListBoxItem>
        {/each}
    </ListBox>
    <div class="flex flex-col">
        {JSON.stringify(selected)}
    </div>
</div>
{:else}
    <p>Il n'y a pas encore d'attestations pour cette situation pathologique.</p>
{/if}
