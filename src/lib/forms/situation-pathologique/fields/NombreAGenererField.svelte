<script>
	import DefaultFieldWrapper from '../../abstract-fields/DefaultFieldWrapper.svelte';
    import { t } from '../../../i18n';

	export let dejaFaites;
	export let nombreSeances;
    export let defaultSeanceNumber;
	let previousDejaFaite = 0;


</script>

<div class="flex flex-col md:flex-row space-y-2 space-x-0 md:space-y-0 md:space-x-2">
    <DefaultFieldWrapper class="flex flex-col justify-start items-start">
        <p class="select-none text-surface-500 dark:text-surface-300">{$t('form.generateur', 'alredaydone.title')}</p>
        <div>
            <input
                name="deja_faites"
                type="number"
                min="0"
                max="365"
                bind:value={dejaFaites}
                class="input group-[.has-error]/field:border-error-500" />
        </div>
        <p class="dark:text-surface-100 text-surface-800">
            {@html $t('form.generateur', 'alredaydone.help')}
        </p>
    </DefaultFieldWrapper>
    
    <DefaultFieldWrapper class="flex flex-col justify-start items-start">
        <p class="select-none text-surface-500 dark:text-surface-300">{$t('form.generateur', 'generated')}</p>
        <div class="flex space-x-2">
            <input
                name="nombreSeances"
                type="number"
                bind:value={nombreSeances}
                class="input group-[.has-error]/field:border-error-500"
                required
                data-pristine-required-message=""
                on:change />
            <button class="btn variant-ghost-secondary" on:click|preventDefault={() => defaultSeanceNumber()}>MAX</button>
        </div>
        <p class="dark:text-surface-100 text-surface-800">
            {$t('form.generateur', 'generated.help')}
        </p>
    </DefaultFieldWrapper>
</div>
