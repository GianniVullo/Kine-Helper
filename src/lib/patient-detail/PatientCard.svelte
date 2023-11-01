<script>
	// import HomeIcon from '../ui/svgs/HomeIcon.svelte'
	import ConsultIcon from '../ui/svgs/ConsultIcon.svelte';
	export let patient; // Patient object passed as a prop
</script>

<div class="group rounded-lg bg-white/90 card-hover flex flex-col cursor-default items-start justify-between p-6">
	<a class="group/consultation" href={`/dashboard/medical-files/patients/${patient.patient_id}`}>
		<div class="bg-gradient-to-r from-primary-400 to-secondary-500 h-1 opacity-50 mb-4"></div>
		<h2 class="text-xl font-medium text-surface-900">{patient.nom} {patient.prenom}</h2>
		<div class="flex items-start mt-1">
			<!-- <HomeIcon class="h-4 w-4 mr-2" /> -->
			<div class="flex flex-col border-l border-surface-400 pl-1">
				<p class="text-base text-surface-400">{patient.adresse}</p>
				<p class="text-base text-surface-400">{patient.cp} {patient.localite}</p>
			</div>
		</div>
		<div class="flex items-end mt-3">
			<ConsultIcon class="h-6 w-6 stroke-surface-600 duration-200 group-hover/consultation:text-surface-700" />
			<p
				class="text-sm text-surface-600 duration-200 group-hover/consultation:text-surface-700">
				Consulter
			</p>
		</div>
	</a>
</div>
