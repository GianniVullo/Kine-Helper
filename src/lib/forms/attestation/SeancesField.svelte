<script>
	import dayjs from 'dayjs';
	import { getContext } from 'svelte';
	import { t } from '../../i18n';

	export let seances;
	let codes = getContext('codeMap');
</script>

<div class="card flex max-w-md flex-col justify-center">
	<!-- HEADER -->
	<div
		class="flex max-w-md justify-between border-b border-surface-400 bg-surface-300 px-8 py-4 font-bold dark:border-surface-600 dark:bg-surface-700"
		style="border-top-right-radius: 40px; border-top-left-radius: 40px;">
		<div class="basis-1/6">{$t('shared', 'index')}</div>
		<div class="basis-1/3">{$t('shared', 'date')}</div>
		<div class="basis-1/3">{$t('shared', 'code')}</div>
	</div>
	<!-- ROWs -->
	<div class="flex max-w-md flex-col">
		<!-- CELL -->
		{#key seances}
			{#each seances as seance, idx}
				<div
					class="flex items-center justify-between border-b border-surface-700 px-2 py-4 last:rounded-b-[40px] last:border-none even:bg-surface-600/10 sm:px-8">
					<div class="flex basis-1/6">
						{idx + 1}
					</div>
					<div class="flex basis-1/3">
						<div>
							<input
								type="date"
								name=""
								on:change={(e) => {
									if (!dayjs(seance.obj.date).format('YYYY-MM-DD').isSame(e.target.value)) {
										seance.modified = true;
										// ne pas perdre l'information de l'heure
										let time = dayjs(seance.obj.date).format('HH:mm:00');
										seance.obj.date = e.target.value + ' ' + time;
									}
								}}
								class="input"
								value={dayjs(seance.obj.date).format('YYYY-MM-DD')} />
						</div>
					</div>
					<div class="flex basis-1/3 flex-col justify-start">
						<p class="variant-filled-secondary btn btn-sm">
							{$codes.get(seance.obj.code_id).code_reference}
						</p>
						{#if seance.has_rapport}
							+ {$t('attestation.form', 'rapportEcrit')}
						{/if}
						<!-- <button
						class="variant-filled-secondary btn btn-sm"
						on:click|preventDefault={(e) => {
							modalStore.trigger(modal);
							$modalStore[0].meta = { seance: seance, code: $codes.get(seance.obj.code_id) };
						}}>
						{$codes.get(seance.obj.code_id).code_reference}
					</button> -->
					</div>
				</div>
			{/each}
		{/key}
	</div>
</div>
