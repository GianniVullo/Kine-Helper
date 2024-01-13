<script>
	import { patients } from '$lib/index';
	import { page } from '$app/stores';
	import { PlusIcon } from '$lib/ui/svgs/index';
	import { getContext } from 'svelte';
	import { popup, ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import dayjs from 'dayjs';

	let sp = getContext('patient').situations_pathologiques.find(
		(sp) => sp.sp_id == $page.params.spId
	);
	console.log($page.params);
	console.log(getContext('patient'));
	console.log(sp);

	let comboboxValue;

	const popupCombobox = {
		event: 'click',
		target: 'popupCombobox',
		placement: 'bottom',
		closeQuery: '.listbox-item'
	};
    let items = [
        { name: 'Facturer', href: 'books' },
        { name: 'Ajouter un document', href: 'movies' },
        { name: 'TV', href: 'television' }
    ];
</script>

		<button class="variant-ringed-primary btn justify-between" use:popup={popupCombobox}>
			<span class="capitalize">Actions</span>
			<span>↓</span>
		</button>

		<div class="py-2 shadow-xl dark:bg-surface-800 rounded-b-xl list-nav" data-popup="popupCombobox">
            {#each items as item}
                <a href={item.href} class="hover:dark:bg-surface-700 hover:bg-surface-200 p-2" data-value={item.value}>
                    <span>{item.name}</span>
                </a>
            {/each}
            <!-- <ListBox rounded="rounded-none">
				<ListBoxItem bind:group={comboboxValue} name="medium" value="books">Books</ListBoxItem>
				<ListBoxItem bind:group={comboboxValue} name="medium" value="movies">Movies</ListBoxItem>
				<ListBoxItem bind:group={comboboxValue} name="medium" value="television">TV</ListBoxItem>
			</ListBox> -->
			<div class="bg-surface-100-800-token arrow" />
		</div>


