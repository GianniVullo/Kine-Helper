<script>
	import TextFieldV2 from "../abstract-fields/TextFieldV2.svelte";

    export let prescripteurNom;
    export let prescripteurPrenom;
    export let prescripteurInami;
</script>

<div class="flex relative flex-col px-4 py-6 space-y-2 border rounded-md my-2 border-surface-400 ">
    <h5 class="text-surface-400 absolute top-0 left-1">Identification du prescripteur</h5>
    <TextFieldV2 required name="prescripteur.nom" bind:value={prescripteurNom} placeholder="Nom du prescripteur" label="Nom du prescripteur" />
    <TextFieldV2 required name="prescripteur.prénom" bind:value={prescripteurPrenom} placeholder="Prénom du prescripteur" label="Prénom du prescripteur" />
    <TextFieldV2 required name="prescripteur.inami" bind:value={prescripteurInami} placeholder="N°INAMI du prescripteur" label="N°INAMI du prescripteur" />
</div>
