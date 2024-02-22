<script>
	import { listen } from '@tauri-apps/api/event';
	import { goto } from '$app/navigation';

	const proxy = new Proxy(
		{ domLoaded: false, updateStatus: 'awaiting' },
		{
			set: (obj, prop, value) => {
				console.log('set', obj, prop, value);
				if (prop === 'updateStatus' && value === 'downloading') {
					obj.updateStatus = value;
					document.getElementById('status').innerText =
						"Téléchargement en cours..., l'application va bientôt redémarrer";
				}
				if (prop === 'updateStatus' && value === 'done') {
					obj.updateStatus = value;
					document.getElementById('status').innerText = 'Téléchargement terminé';
				}
				if (prop === 'domLoaded' && value === true) {
					obj.domLoaded = value;
					document.getElementById('status').innerText = 'DOM chargé';
				}
				if (obj.domLoaded && obj.updateStatus === 'done') {
					goto('/');
				}
				return true;
			},
			get: (obj, prop) => {
				console.log('get', obj, prop);
				return obj[prop];
			}
		}
	);
	listen('dom-loaded', () => {
		console.log('DOM is loaded');
		if (proxy.domLoaded === false) {
			proxy.domLoaded = true;
		}
	});
	listen('update-status', (status) => {
		console.log('update-status', status);
		if (proxy.updateStatus !== 'done') {
			proxy.updateStatus = status.payload.status;
		}
	});
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-700 dark:to-secondary-700">
	<!--? CENTERED CARD -->
	<div
		style="height: 500px;"
		class="card relative w-[350px] space-y-2 overflow-hidden px-6 py-4 dark:border dark:border-gray-400">
		<div
			class="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-600 opacity-25 dark:opacity-50">
		</div>
		<div
			class="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-sky-600 opacity-25 dark:opacity-60">
		</div>
		<div class="card-header">
			<h2 class="mb-2 text-center text-5xl font-bold text-purple-600 dark:text-purple-400">
				Kiné Helper
			</h2>
			<p style="margin-top: 30px;" class="text-center text-2xl text-gray-600 dark:text-gray-300">
				Open-source & gratuit pour tous les kinés
			</p>
			<div id="status" class="mt-10 flex flex-col justify-center space-y-2 text-lg">
				<div class="flex items-center justify-between">
					<h5>Chargement de l'interface</h5>
					{@html proxy.domLoaded
						? '<div style="margin: 4px;" class="border-secondary-500 text-4xl w-5 h-5 border-2 rounded-full animate-spin border-b-primary-500"></div>'
						: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 stroke-secondary-300 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>'}
				</div>
				<div class="flex items-center justify-between">
					<h5>Recherche de mises à jours</h5>
					{@html proxy.domLoaded
						? '<div style="margin: 5px;" class="border-secondary-500 text-4xl w-5 h-5 border-2 rounded-full animate-spin border-t-primary-500"></div>'
						: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 stroke-secondary-300 h-7"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>'}
				</div>
			</div>
		</div>
	</div>
</div>
