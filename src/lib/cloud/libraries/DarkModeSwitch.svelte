<script>
	import { onMount, untrack } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import BoutonSecondaireAvecIcone from '../../components/BoutonSecondaireAvecIcone.svelte';
	import { appState } from '../../managers/AppState.svelte';

	let { isOpen } = $props();

	let user_scheme = new MediaQuery('(prefers-color-scheme: dark)');

	let dark = $state(user_scheme.current ? true : false);

	$effect(() => {
		console.log(user_scheme);

		if (user_scheme.current) {
			document.body.classList.add('dark');
			untrack(() => {
				dark = true;
			});
		} else {
			document.body.classList.remove('dark');
			untrack(() => {
				dark = false;
			});
		}
	});
	$effect(() => {
		dark;
		let body = document.body;
		if (dark) {
			body.classList.add('dark');
		} else {
			body.classList.remove('dark');
		}
	});
	$effect(() => {
		appState.db.getItem('UserColorScheme').then((v) => {
			dark = v;
		});
		if (dark) {
		} else {
		}
	});
</script>

{#snippet darkicon(cls)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class={cls}>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
	</svg>
{/snippet}
{#snippet lighticon(cls)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
		class={cls}>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
	</svg>
{/snippet}

<button
	onclick={async () => {
		dark = !dark;
		await appState.db.setItem('UserColorScheme', dark ? 1 : 0);
	}}
	class={[
		'group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold  text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
		isOpen ? '' : 'justify-center text-center'
	]}>
	<span
		class={[
			'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:group-hover:border-white/20 dark:group-hover:text-white',
			isOpen ? 'bg-white' : 'bg-gray-400'
		]}>
		{#if dark}
			{@render lighticon(
				'size-4 shrink-0 text-gray-700 dark:text-gray-500 flex items-center justify-center'
			)}
		{:else}
			{@render darkicon(
				'size-4 shrink-0 text-gray-700 dark:text-gray-500 flex items-center justify-center'
			)}
		{/if}
	</span>
	{#if isOpen}
		{dark ? 'Light mode' : 'Dark mode'}
	{/if}
</button>
