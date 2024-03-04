<script>
	import TextFieldV2 from "../abstract-fields/TextFieldV2.svelte";
    import { t } from "../../i18n";

    export let prescripteurNom;
    export let prescripteurPrenom;
    export let prescripteurInami;
</script>

<div class="flex relative flex-col px-4 py-6 space-y-2 border rounded-md my-2 border-surface-400 ">
    <h5 class="text-surface-400 absolute top-0 left-1">{$t('form.prescription', 'prescripteurfield.label')}</h5>
    <TextFieldV2 required name="prescripteur.nom" bind:value={prescripteurNom} placeholder={$t('form.prescription', 'prescripteurfield.name')} label={$t('form.prescription', 'prescripteurfield.name')} />
    <TextFieldV2 required name="prescripteur.prénom" bind:value={prescripteurPrenom} placeholder={$t('form.prescription', 'prescripteurfield.surname')} label={$t('form.prescription', 'prescripteurfield.surname')} />
    <TextFieldV2 required name="prescripteur.inami" bind:value={prescripteurInami} placeholder={$t('form.prescription', 'prescripteurfield.inami')} label={$t('form.prescription', 'prescripteurfield.inami')} />
</div>
