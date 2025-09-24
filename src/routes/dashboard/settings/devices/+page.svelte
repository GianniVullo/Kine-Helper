<script>
	import { t } from '../../../../lib/i18n';
	import { platform } from '@tauri-apps/plugin-os';
	import WindowsSelectionField from '../../../../lib/components/forms/fields/WindowsSelectionField.svelte';
	import { toast } from '../../../../lib/cloud/libraries/overlays/notificationUtilities.svelte';
	import { appState } from '../../../../lib/managers/AppState.svelte';
	import { errorIcon, successIcon } from '../../../../lib/ui/svgs/IconSnippets.svelte';
	import { Field, FormSection } from '../../../../lib/components/forms/blocks';
	import { untrack } from 'svelte';
	import SimpleSelect from '../../../../lib/components/forms/fields/SimpleSelect.svelte';
	import BoutonPrincipal from '../../../../lib/components/BoutonPrincipal.svelte';
	import { info } from '../../../../lib/cloud/libraries/logging';

	let imprimanteMatricielleP = new Promise(async (resolve, reject) => {
		let { data: iM, error } = await appState.db.getRawPrinter();
		if (error) {
			info('error getting the imprimante', error);
			reject(error);
		}
		imprimanteMatricielle = iM?.name;
		pinNumber = iM?.metadata?.is_nine_pin;
		info(pinNumber);
		resolve(iM);
	});

	let imprimanteMatricielle = $state();
	let pinNumber = $state();
	async function changePrinter() {
		const { data: imprimante, error: imprimanteQueryError } = await appState.db.getRawPrinter();
		info('imprimante', imprimante);
		if (imprimanteQueryError) {
			toast.trigger({
				titre: 'Erreur!',
				description: imprimanteQueryError,
				leading: errorIcon,
				leadingCSS: 'size-6 text-red-400',
				timeout: 5000
			});
			return;
		}
		if (imprimante === imprimanteMatricielle) return;
		if (!imprimante) {
			const { data: _, error } = await appState.db.execute(
				'INSERT INTO appareils (id, name, metadata, role) VALUES ($1, $2, $3, $4)',
				[
					crypto.randomUUID(),
					imprimanteMatricielle,
					JSON.stringify({ is_nine_pin: pinNumber }),
					'raw_printer'
				]
			);
			if (!error) {
				toast.trigger({
					titre: 'Imprimante ajoutée avec succès.',
					description: 'Vos attestations seront désormais imprimées sur ' + imprimanteMatricielle,
					leading: successIcon,
					leadingCSS: 'size-6 text-green-400',
					timeout: 5000
				});
			} else {
				toast.trigger({
					titre: 'Erreur!',
					description: error,
					leading: errorIcon,
					leadingCSS: 'size-6 text-red-400',
					timeout: 5000
				});
			}
		} else {
			const { data: _, error } = await appState.db.execute(
				'UPDATE appareils SET name = $1, metadata = $2 WHERE role = $3',
				[imprimanteMatricielle, JSON.stringify({ is_nine_pin: pinNumber }), 'raw_printer']
			);
			if (!error) {
				toast.trigger({
					titre: 'Imprimante modifiée avec succès.',
					description: 'Vos attestations seront désormais imprimées sur ' + imprimanteMatricielle,
					leading: successIcon,
					leadingCSS: 'size-6 text-green-400',
					timeout: 5000
				});
			} else {
				toast.trigger({
					titre: 'Erreur!',
					description: error,
					leading: errorIcon,
					leadingCSS: 'size-6 text-red-400',
					timeout: 5000
				});
			}
		}
		modified = false;
	}
	let modified = $state(false);
	$effect(() => {
		imprimanteMatricielle;
		pinNumber;
		console.log('bite');
		appState.db.getRawPrinter().then(({ data: value, error }) => {
			info('imprimanteMatricielle', value);

			if (imprimanteMatricielle !== value?.name || pinNumber !== value?.metadata?.is_nine_pin) {
				untrack(() => (modified = true));
			} else {
				untrack(() => (modified = false));
			}
		});
	});
</script>

<main class="mt-10 flex h-full w-full grid-cols-6 flex-col overflow-y-scroll">
	{#await imprimanteMatricielleP then _}
		<FormSection titre="Périphériques" description={$t('settings', 'printer')}>
			{#if platform() === 'windows'}
				{info('platform is windows')}
				<div class="col-span-full">
					<WindowsSelectionField
						cb={() => {
							info('in cb');
						}}
						bind:printerField={imprimanteMatricielle} />
				</div>
			{:else}
				<div class="col-span-4">
					<Field
						field={{
							id: 'printer',
							name: 'printer',
							type: 'text',
							titre: "Nom de l'imprimante",
							help: "Entrez le nom de l'imprimante que vous souhaitez utiliser pour imprimer les attestations.",
							placeholder: "Nom de l'imprimante"
						}}
						class="input"
						type="text"
						name="printer"
						bind:value={imprimanteMatricielle} />
				</div>
			{/if}
			<div class="col-span-2">
				<SimpleSelect
					name="is_nine_pin"
					bind:value={pinNumber}
					inline
					label={$t('printerSetup', 'pins.label')}
					options={[
						{ value: true, label: '9' },
						{ value: false, label: '12/24' }
					]} />
			</div>

			<div class="col-span-full">
				<BoutonPrincipal onclick={changePrinter} disabled={!modified} inner={$t('shared', 'save')} />
			</div>
		</FormSection>
	{:catch error}
		<p class="text-error-600">{error}</p>
	{/await}
</main>
