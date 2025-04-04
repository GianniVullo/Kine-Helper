<script>
	import { t } from '../../i18n';
	import { get } from 'svelte/store';

	let { aOrB, value = $bindable(), error } = $props();

	let annexeAOptions = {
		[get(t)('annexeA', 'a.title')]: [
			{
				value: 0,
				label: get(t)('annexeA', 'a.1')
			},
			{
				value: 1,
				label: get(t)('annexeA', 'a.2')
			},
			{
				value: 2,
				label: get(t)('annexeA', 'a.3')
			},
			{
				value: 3,
				label: get(t)('annexeA', 'a.4')
			},
			{
				value: 4,
				label: get(t)('annexeA', 'a.5')
			}
		],
		[get(t)('annexeA', 'b')]: {
			value: 5
		},
		[get(t)('annexeA', 'c')]: {
			value: 6
		},
		[get(t)('annexeA', 'd')]: {
			value: 7
		},
		[get(t)('annexeA', 'e')]: [
			{
				value: 8,
				label: get(t)('annexeA', 'e.1')
			},
			{
				value: 9,
				label: get(t)('annexeA', 'e.2')
			},
			{
				value: 10,
				label: get(t)('annexeA', 'e.3')
			}
		],
		[get(t)('annexeA', 'f')]: {
			value: 11
		},
		[get(t)('annexeA', 'g')]: {
			value: 12
		},
		[get(t)('annexeA', 'h')]: [
			{ value: 13, label: get(t)('annexeA', 'h.1') },
			{
				value: 14,
				label: get(t)('annexeA', 'h.2')
			},
			{
				value: 15,
				label: get(t)('annexeA', 'h.3')
			}
		],
		[get(t)('annexeA', 'i')]: {
			value: 16
		},
		[get(t)('annexeA', 'j')]: {
			value: 17
		},
		[get(t)('annexeA', 'k')]: {
			value: 18
		}
	};
	let annexeAIdx = [
		'a',
		'a2',
		'a3',
		'a4',
		'a5',
		'b',
		'c',
		'd',
		'e',
		'e2',
		'e3',
		'f',
		'g',
		'h',
		'h2',
		'h3',
		'i',
		'j',
		'k'
	];
	let annexeBOptions = {
		[get(t)('annexeB', 'a')]: {
			value: 0
		},
		[get(t)('annexeB', 'b')]: {
			value: 1
		},
		[get(t)('annexeB', 'c')]: {
			value: 2
		},
		[get(t)('annexeB', 'd')]: {
			value: 3
		},
		[get(t)('annexeB', 'e')]: {
			value: 4
		},
		[get(t)('annexeB', 'f')]: {
			value: 5
		},
		[get(t)('annexeB', 'g')]: {
			value: 6
		},
		[get(t)('annexeB', 'h')]: { value: 7 }
	};
</script>

<h5 class="text-surface-500 dark:text-surface-300 my-2 select-none">
	{$t('form.annexeA', 'validation.sp')}
</h5>

{#if error}
	<p class="text-sm text-red-500">{error}</p>
{/if}
{#each Object.entries(aOrB === 'A' ? annexeAOptions : annexeBOptions) as item, idx}
	<div class="flex flex-col">
		{#if Array.isArray(item[1])}
			<div class="mb-4 flex flex-col space-y-4">
				<h5>{item[0]}</h5>
				<div class="flex flex-col space-y-4 pr-10 pl-5">
					{#each item[1] as subItem, idx}
						<label
							class:!text-sm={value && value !== subItem.value}
							class="text-surface-300 has-[:checked]:border-secondary-400 has-[:checked]:bg-surface-700 has-[:checked]:text-surface-100 dark:border-surface-400 dark:hover:bg-surface-800 flex cursor-pointer rounded-lg border px-2 py-2 duration-200 has-[:checked]:border-2 has-[:checked]:text-lg"
							for={item[0].substring(0, 2) + idx.toString()}>
							<input
								class="invisible"
								type="radio"
								bind:group={value}
								value={subItem.value}
								name="situation_pathologique"
								id={item[0].substring(0, 2) + idx.toString()} />
							<div>{@html subItem.label}</div>
						</label>
					{/each}
				</div>
			</div>
		{:else}
			<label
				for={aOrB === 'A' ? annexeAIdx[idx] : item[0].substring(0, 2)}
				class="text-surface-300 has-[:checked]:!border-secondary-400 has-[:checked]:bg-surface-700 has-[:checked]:text-surface-100 dark:border-surface-400 dark:hover:bg-surface-800 mb-4 flex cursor-pointer rounded-lg border px-2 py-2 pr-10 pl-5 duration-200 has-[:checked]:border-2 has-[:checked]:text-lg">
				<div>{@html item[0]}</div>
				<input
					class="invisible"
					type="radio"
					value={item[1].value}
					bind:group={value}
					name="situation_pathologique"
					id={aOrB === 'A' ? annexeAIdx[idx] : item[0].substring(0, 2)} /></label>
		{/if}
	</div>
{/each}

<style>
	input[type='radio'] {
		/* Add if not using autoprefixer */
		-webkit-appearance: none;
		appearance: none;
		/* For iOS < 15 to remove gradient background */
		background-color: #fff;
		/* Not removed via appearance */
		margin: 0;
	}
</style>
