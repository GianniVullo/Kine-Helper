<script>
	import { SignUpForm, LoginForm, PasswordResetForm } from '../lib/index';
	console.log('Rendering Login Page');

	let selectedForm = 'login';
	let message = ''
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 dark:from-primary-700 dark:to-secondary-700">
	<!--? CENTERED CARD -->
	<div
		class="card relative w-[350px] space-y-2 overflow-hidden px-6 py-4 dark:border dark:border-gray-400">
		<div
			class="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-purple-600 opacity-25 dark:opacity-50">
		</div>
		<div
			class="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-sky-600 opacity-25 dark:opacity-60">
		</div>
		<div class="card-header">
			<h2 class="mb-2 text-center text-2xl font-bold text-purple-600 dark:text-purple-400">
				Kiné Helper
			</h2>
			<p class=" text-center text-sm text-gray-600 dark:text-gray-300">
				Open-source & gratuit pour tous les kinés
			</p>
		</div>
		{#if selectedForm == 'login'}
			<LoginForm {message} />
		{:else if selectedForm == 'signup'}
			<SignUpForm on:onSignupSuccess={(msg) => {
				selectedForm = 'login'
				message = msg;
			}} />
		{:else}
			<PasswordResetForm />
		{/if}
		<div class="card-footer mt-4 flex flex-col items-center justify-center space-y-2">
			{#if selectedForm == 'login'}
				<button
					on:click={() => (selectedForm = 'signup')}
					class="group text-gray-600 dark:text-gray-300"
					>Pas de compte ? <span
						class="border-purple-500 text-base duration-200 group-hover:border-b"
						>Inscrivez-vous</span
					></button>
			{:else}
				<button
					on:click={() => (selectedForm = 'login')}
					class="group text-gray-600 dark:text-gray-300"
					>{selectedForm == 'passwordReset' ? 'Ça vous est revenu ? ' : 'Déjà un compte ? '}<span
						class="border-purple-500 text-base duration-200 group-hover:border-b"
						>Connectez-vous</span
					></button>
				<!-- else content here -->
			{/if}
			{#if selectedForm !== 'passwordReset'}
				<button
					on:click={() => {
						selectedForm = 'passwordReset';
					}}
					class="text-gray-600 dark:text-gray-300">Mot de passe oublié ?</button>
			{/if}
		</div>
	</div>
</div>
