<script>
	import dayjs from 'dayjs';
	import timezone from 'dayjs/plugin/timezone.js';
	import utc from 'dayjs/plugin/utc.js';
	import {
		MycarenetHistory,
		EidCardSigningForm,
		RequestResponseTracing,
		SecurityTokenService,
		MemberDataConsultation
	} from '../../../lib/cloud/libraries/Mycarenet/index.svelte.js';
	import { appState } from '../../../lib/managers/AppState.svelte.js';
	import FormSection from '../../../lib/components/forms/blocks/FormSection.svelte';
	import PageTitle from '../../../lib/cloud/components/layout/PageTitle.svelte';
	import Scenarios from '../../../lib/cloud/libraries/Mycarenet/Scenarios.svelte';
	import { RequestSecurityToken } from '../../../lib/cloud/libraries/Mycarenet/ws/RequestSecurityToken.js';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	let feedbackController = new MycarenetHistory();
	let initialized = feedbackController.init();

	// Then register the languages you need
</script>

<div class="bg-slate-900">
	<div class="px-8 py-12 invert">
		<PageTitle titre="Développement Mycarenet">
			<div class="">
				<button
					class="m-2 rounded-full bg-amber-200 px-4 py-2"
					onclick={async () => await feedbackController.setLast()}>
					SET Request & Response to last in history
				</button>
				<button
					class="m-2 rounded-full bg-amber-200 px-4 py-2"
					onclick={() => console.log('Appstate:', appState.eHealth)}>
					Check Appstate
				</button>
				<button
					class="m-2 rounded-full bg-amber-200 px-4 py-2"
					onclick={async () => {
						dayjs.extend(utc);
						dayjs.extend(timezone);
						const memberDataController = new MemberDataConsultation({});
						const enveloppe = await memberDataController.createMemberDataEnveloppe({
							query: {
								ssin: '58121520763',
								not_before: dayjs.tz(dayjs().subtract(1, 'day'), 'Europe/Brussels').format(),
								not_on_or_after: dayjs.tz(dayjs().add(1, 'day'), 'Europe/Brussels').format(),
								issuer_fmt: 'Nihii11',
								issuer_val: '54403736527',
								facets: [{ type: 'insurability', requestType: 'information', contactType: 'other' }]
							},
							pin: '9137'
						});
						// console.log('Enveloppe:', enveloppe);
						document.getElementById('canon').innerText = enveloppe;
					}}>
					Build MemberDataConsultation Enveloppe
				</button>
			</div>
		</PageTitle>

		<button
			onclick={async () => {
				dayjs.extend(utc);
				dayjs.extend(timezone);
				const validity_format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
				const now = dayjs.tz(Date.now(), 'Europe/Brussels');
				const validity_start = now.format(validity_format);
				const validity_end = now.add(1, 'day').format(validity_format);

				console.log(validity_start, validity_end);
			}}>TEST SIGNEDINFO</button>

		<Scenarios bind:feedbackController />
		<div class="mt-10">
			{#await initialized then _}
				<FormSection
					gridCSS="grid gap-x-6 items-start grid-cols-6"
					titre="Historique des requêtes Mycarenet"
					description="Consultez ici les requêtes SOAP envoyées et les réponses reçues. Elles sont stockées dans une base de données locale sqlite.">
					<RequestResponseTracing {feedbackController} />
				</FormSection>
				<EidCardSigningForm
					onSuccess={async (data) => {
						const thisReqResId = crypto.randomUUID();
						const securityTokenServiceHandler = new SecurityTokenService({
							async onCreateSTSEnveloppe(enveloppe) {
								console.log('Enveloppe created:', enveloppe);
								feedbackController.request = {
									id: thisReqResId,
									endpoint: this.endpoint,
									headers: JSON.stringify(this.sts_headers),
									xml_string: enveloppe,
									created_at: new Date().toISOString(),
									metadata: { scenario: 'Get SAML Token' }
								};
							},
							async onResponse(response, xml_content) {
								console.log('Response received:', response, xml_content);
								feedbackController.response = {
									id: thisReqResId,
									endpoint: this.endpoint,
									headers: JSON.stringify(Object.fromEntries(response.headers)),
									status: response.status,
									xml_string: xml_content,
									created_at: new Date().toISOString(),
									metadata: { scenario: 'Get SAML Token' }
								};
							}
						});
						const SAMLToken = await securityTokenServiceHandler.getSAMLToken(data);
						console.log('SAML Token:', SAMLToken);
					}} />
			{:catch error}
				problem ! {error}
			{/await}
		</div>
	</div>
</div>
<h1 id="canon"></h1>
