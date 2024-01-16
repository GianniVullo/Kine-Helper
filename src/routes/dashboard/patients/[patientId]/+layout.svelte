<script>
	import Title from '$lib/patient-detail/Title.svelte';
	import Arborescence from '../../../../lib/patient-detail/Arborescence.svelte';
	import {patients} from "$lib/stores/PatientStore";
	import {building} from '$app/environment';
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

{#if building}
	<Arborescence patient={patients.defaultTestPatient()} />
{/if}
{#if data.patient}
	<div class="flex h-full w-full flex-col items-start justify-start">
		<Title patient={data.patient} />
		{#if data.patient.situations_pathologiques && data.patient.situations_pathologiques.length > 0}
			<div class="flex h-full w-full flex-col md:flex-row">
				<Arborescence patient={data.patient} />
				<slot />
			</div>
		{:else}
			<div class="">
				<slot></slot>
			</div>
		{/if}
	</div>
{:else}
	Patient n'existe pas
{/if}
