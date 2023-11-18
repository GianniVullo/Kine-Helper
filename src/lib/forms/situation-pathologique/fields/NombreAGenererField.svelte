<script>
	import DefaultFieldWrapper from '../../abstract-fields/DefaultFieldWrapper.svelte';

	export let dejaFaites;
	export let nombreSeances;
	let previousDejaFaite = 0;
</script>

<div class="flex flex-col md:flex-row space-y-2 space-x-0 md:space-y-0 md:space-x-2">
    <DefaultFieldWrapper class="flex flex-col justify-start items-start">
        <p class="select-none text-surface-500 dark:text-surface-300">Séances déjà effectuées</p>
        <div>
            <input
                name="deja_faites"
                type="number"
                min="0"
                max="365"
                bind:value={dejaFaites}
                class="input group-[.has-error]/field:border-error-500"
                on:change={(event) => {
                    if (dejaFaites < 0) {
                        dejaFaites = 0;
                    } else {
                        nombreSeances = nombreSeances - (dejaFaites - previousDejaFaite);
                        previousDejaFaite = dejaFaites;
                    }
                }} />
        </div>
        <p class="dark:text-surface-100 text-surface-800">Le nombre de séances déjà effectuées est automatiquement soustraits du nombre à générer</p>
    </DefaultFieldWrapper>
    
    <DefaultFieldWrapper class="flex flex-col justify-start items-start">
        <p class="select-none text-surface-500 dark:text-surface-300">Séances générées</p>
        <div>
            <input
                name="nombreSeances"
                type="number"
                bind:value={nombreSeances}
                class="input group-[.has-error]/field:border-error-500"
                required
                data-pristine-required-message=""
                on:change />
        </div>
        <p class="dark:text-surface-100 text-surface-800">Seul le nombre de séances à générer est pris en compte par le générateur.</p>
    </DefaultFieldWrapper>
</div>
