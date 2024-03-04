<script>
	import DefaultFieldWrapper from '../../abstract-fields/DefaultFieldWrapper.svelte';
	import { daysOfWeek } from '../../../stores/dateHelpers';
	import TimeField from './TimeField.svelte';
	import { t } from '../../../i18n';

	let day_of_weekOptions = daysOfWeek.map((value, index) => {
		return {
			id: value.substring(0, 2),
			label: value,
			name: 'day_of_week',
			value: index == 6 ? '0' : `${index + 1}`
		};
	});
	export let value;
	export let with_seconde_seance;
</script>

<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
	<!-- Jour de la semaine -->
	<DefaultFieldWrapper class="flex flex-col items-start space-y-0">
		<h5 class="select-none text-surface-500 dark:text-surface-300">
			{$t('form.generateur', 'day_of_week.title')}
		</h5>
		{#each day_of_weekOptions as option (option.id)}
			<label class="flex w-full justify-between space-x-2" for={option.id}>
				<h6 class="select-none">{option.label}</h6>
				<input
					id={option.id}
					type="checkbox"
					required
					name="day_of_week"
					bind:checked={value[option.value].value}
					class="checkbox group-[.has-error]/field:border-error-500"
					data-pristine-required-message="Ce champ est requis"
					on:click={(e) => {
						if (e.shiftKey) {
							option.value;
							for (const val of Object.entries(value)) {
								console.log(val);

								if (
									option.value != '0' &&
									parseInt(val[0]) < parseInt(option.value) &&
									val[0] != '0'
								) {
									val[1].value = !val[1].value;
								}
								if (option.value == '0') {
									val[1].value = !val[1].value;
								}
							}
						}
					}} />
			</label>
		{/each}
	</DefaultFieldWrapper>
	<div class="flex flex-col space-y-2">
		{#each Object.entries(value) as [id, selected] (id)}
			{#if selected.value}
				<TimeField
					name={`${id}-time`}
					id={`${id}-time`}
					label={$t('form.generateur', 'time.label', {
						day: daysOfWeek[parseInt(id) == 0 ? 6 : parseInt(id) - 1]
					})}
					bind:value={selected.time} />
				{#if with_seconde_seance}
					<TimeField
						name={`${id}-second-seance-time`}
						id={`${id}-second-seance-time`}
						label={$t('form.generateur', 'time2.label', {
							day: daysOfWeek[parseInt(id) == 0 ? 6 : parseInt(id) - 1]
						})}
						bind:value={selected.seconde_seance_time} />
				{/if}
			{/if}
		{/each}
	</div>
</div>
