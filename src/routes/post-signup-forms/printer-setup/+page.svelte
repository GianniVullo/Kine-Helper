<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { open } from '@tauri-apps/plugin-shell';
	import { FormWrapper, SubmitButton, TextFieldV2 } from '../../../lib/forms/index';
	import { goto } from '$app/navigation';
	import DBAdapter from '../../../lib/forms/actions/dbAdapter';
	import { user } from '../../../lib/index';

	const modalStore = getModalStore();
	const modal = {
		type: 'confirm',
		// Data
		title: 'Confirmation demandée',
		body: 'Sans cette étape de configuration vous ne pourrez pas imprimer vos attestations. Voulez-vous poursuivre sans configurer votre imprimante matricielle ?',
		buttonTextConfirm: 'Continuer',
		buttonTextCancel: 'Annuler',
		response: (r) => {
			if (r) {
				goto('/dashboard');
			}
		}
	};

	async function gotoKineHelperbeWindows() {
		await open('https://kine-helper.be');
	}
	async function gotoKineHelperbeMacOs() {
		await open('https://kine-helper.be');
	}
	async function gotoKineHelperbeLinux() {
		await open('https://kine-helper.be');
	}
	let printer;
	const formSchema = {
		isValid
	};
	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		let db = new DBAdapter();
		await db.update('settings', [['user_id', $user.user.id]], { raw_printer: printer });
        user.update((u) => {
            u.settings.raw_printer = printer;
            return u;
        });
        goto('/dashboard');
	}
</script>

<main class="p-10">
	<h1 class="text-surface-400">Configuration de l'imprimante matricielle</h1>
	<p class="text-surface-800 dark:text-surface-200">
		Cette étape est cruciale pour l'utiliisation de Kiné Helper. <br /> Le logiciel a besoin du nom
		programmatique de votre imprimante matricielle. <br /> Pour le trouver, veuillez suivre les instructions
		ci-dessous.
	</p>
	<div class="mt-4 flex flex-col space-y-4">
		<div>
			<h5 class="text-xl text-secondary-200">Pour windows</h5>
			<button on:click={gotoKineHelperbeWindows}>explications</button>
		</div>
		<div>
			<h5 class="text-xl text-secondary-200">Pour macOs</h5>
			<button on:click={gotoKineHelperbeMacOs}>explications</button>
		</div>
		<div>
			<h5 class="text-xl text-secondary-200">Pour Linux</h5>
			<button on:click={gotoKineHelperbeLinux}>explications</button>
		</div>
	</div>
	<div class="">
		<FormWrapper
			class="group/form mt-4 flex max-w-sm flex-col items-start justify-start space-y-4"
			{formSchema}>
			<TextFieldV2
				class="min-w-[24rem] max-w-sm"
				label="Nom de l'imprimante"
				name="printer"
				bind:value={printer} />
			<div class="flex w-full justify-between">
				<SubmitButton class="!self-start" />
				<button on:click={() => modalStore.trigger(modal)} class="variant-outline-secondary btn"
					>Ignorer cette étape</button>
			</div>
		</FormWrapper>
	</div>
</main>
