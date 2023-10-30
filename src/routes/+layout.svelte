<script>
	import '../app.css';
	import { LightSwitch, Toast } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" />
<!--! DEBUG STUFF -->
<div class="fixed bottom-0 left-28 flex w-full items-start justify-start">
	<a class="bg-slate-400 p-2" href="/dashboard">Dashboard</a>
	<a class="bg-slate-400 p-2" href="/">Back to login</a>
	<LightSwitch></LightSwitch>
</div>
<slot />
