<script>
	import { supabase } from '../../lib/stores/supabaseClient';
	import { goto } from '$app/navigation';
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<!-- Test pour les pdfs -->
<a class="rounded bg-blue-500 px-4 py-2 text-white" href="/test/pdf">Tester les PDFs</a>
<!-- Test pour les formulaires -->
<a class="rounded bg-blue-500 px-4 py-2 text-white" href="/test/authenticated-tests">Bypass auth</a>

<!-- <TinettiForm /> -->
<div class="px-4 py-12">
	<h1 class="text-2xl font-bold">Test Page</h1>
	<p class="mt-4">This is a test page to check the functionality of the application.</p>

	<form
		class="mx-auto mt-8 max-w-md rounded bg-white p-6 shadow"
		onsubmit={async (e) => {
			e.preventDefault();
			const formData = new FormData(e.target);
			let { data, error } = await supabase.auth.signInWithPassword({
				email: formData.get('email'),
				password: formData.get('password')
			});
			if (error) {
				console.error('Error signing in:', error);
				alert('Failed to sign in. Please check your credentials.');
			} else {
				goto('/test/authenticated-tests');
				// Redirect or perform further actions as needed
			}
		}}>
		<div class="mb-4">
			<label class="mb-2 block text-gray-700" for="email">Email</label>
			<input
				class="w-full rounded border px-3 py-2"
				type="email"
				id="email"
				name="email"
				required />
		</div>
		<div class="mb-6">
			<label class="mb-2 block text-gray-700" for="password">Password</label>
			<input
				class="w-full rounded border px-3 py-2"
				type="password"
				id="password"
				name="password"
				required />
		</div>
		<button class="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600" type="submit"
			>Test the cloud</button>
	</form>
</div>
