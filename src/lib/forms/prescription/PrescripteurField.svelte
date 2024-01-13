<script>
	import TextFieldV2 from "../abstract-fields/TextFieldV2.svelte";

    export let prescripteurNom;
    export let prescripteurPrenom;
    export let prescripteurInami;
</script>

<TextFieldV2 required name="prescripteur.nom" bind:value={prescripteurNom} placeholder="Nom du prescripteur" label="Nom du prescripteur" />
<TextFieldV2 required name="prescripteur.prénom" bind:value={prescripteurPrenom} placeholder="Prénom du prescripteur" label="Prénom du prescripteur" />
<TextFieldV2 required name="prescripteur.inami" bind:value={prescripteurInami} placeholder="N°INAMI du prescripteur" label="N°INAMI du prescripteur" />
