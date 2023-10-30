<script>
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	let clazz = '';
	export { clazz as class };
	export let loading = false;
</script>

<button on:click class="variant-filled-primary btn self-center justify-self-center {clazz}" type="submit">
	<slot>Enregistrer</slot>
	<ProgressRadial
		width="w-6 hidden ml-2 {loading ? '!block' : ''}"
		meter="stroke-secondary-500"
		track="stroke-tertiary-500/30" />
</button>
