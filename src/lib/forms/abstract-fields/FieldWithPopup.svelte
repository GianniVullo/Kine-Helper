<script>
	// import { popup } from '@skeletonlabs/skeleton';
	import InfoIcon from '../../ui/svgs/InfoIcon.svelte';
	export let target;
	export let placement = 'bottom';
	export let event = 'hover';
	export let width = 'max-w-[250px]';
	export let color = 'variant-filled-surface';

	const dejaFaitePopUp = {
		event: event,
		target: target,
		placement: placement
	};
</script>

<!-- <div class="flex">
	<slot />
	<div use:popup={dejaFaitePopUp}>
		<InfoIcon class="h-6 w-6" />
		<div data-popup={target}>
			<div class="card {color} p-4 {width}">
				<p class="text-sm">
					<slot name="content" />
				</p>
				<div class="variant-filled-surface arrow" />
			</div>
		</div>
	</div>
</div> -->
