<script>
	import DefaultFieldWrapper from '../../abstract-fields/DefaultFieldWrapper.svelte';
	import { daysOfWeek } from '../../../stores/dateHelpers';
	import { getContext, onMount } from 'svelte';

	let day_of_weekOptions = daysOfWeek.map((value, index) => {
		return {
			id: value.substring(0, 2),
			label: value,
			name: 'day_of_week',
			value: index == 6 ? '0' : `${index + 1}`
		};
	});
	export let value;
	getContext('validators')({
		day_of_week: {
			fn: (val) => {
				console.log('dans le validateur');
				let checing = true;
				if (document.getElementById(`${val}-time`).value == '') {
					checing = false;
				}
				return checing;
			},
			errorMessage: 'Veuillez indiquer une heure pour les jours sélectionnés svp'
		}
	});
	console.log(`In DateTimeWeekDayField with value == ${value}`, JSON.stringify(value));
</script>

<!--! Il faut trouver une façon de faire passer la sélection pour la version Update du formulaire -->
<div class="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
	<!-- Jour de la semaine -->
	<DefaultFieldWrapper class="flex flex-col items-start space-y-0">
		<h5 class="select-none text-surface-500 dark:text-surface-300">Jour de la semaine</h5>
		{#each day_of_weekOptions as option (option.id)}
			<label class="flex w-full justify-between space-x-2" for={option.id}>
				<h6 class="select-none">{option.label}</h6>
				<!--! C'est clairement bizarre mais c'est sur cet input que devrait se trouver le validateur -->
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
							console.log('Shift enfoncé sur ', option.value);
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
		<!-- {JSON.stringify(value)} -->
		{#each Object.entries(value) as [id, selected] (id)}
			{#if selected.value}
				<DefaultFieldWrapper class="flex flex-col items-start justify-start">
					<h5 class="select-none text-surface-500 dark:text-surface-300">
						Heure du rdv les {daysOfWeek[parseInt(id) == 0 ? 6 : parseInt(id) - 1]}
					</h5>
					<div>
						<input
							type="time"
							name={`${id}-time`}
							id={`${id}-time`}
							class="input"
							bind:value={selected.time}
							on:change={() => console.log(value)} />
					</div></DefaultFieldWrapper>
			{/if}
		{/each}
	</div>
</div>
