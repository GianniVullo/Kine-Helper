import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { MemberDataConsultation } from './ws/MemberDataConsultation';
import { RequestSecurityToken } from './ws/RequestSecurityToken';
import { appState } from '../../../managers/AppState.svelte';
import { samlTokenExtractor } from './utils';
import { t } from '../../../i18n';
import { GetETK } from './ws/GetETK';

dayjs.extend(utc);
dayjs.extend(timezone);

export class Scenario {
	pin;
	practitionnerSSIN;
	requestId = crypto.randomUUID();

	constructor({ id, name, handler }) {
		this.id = id;
		this.name = name;
		this.handler = handler;
		this._status = 'pending';
		this.result = null;
		this.expanded = false;
	}

	async start() {
		this.handler.perform();
	}

	get status() {
		return this._status;
	}

	get statusIcon() {
		switch (this._status) {
			case 'pending':
				return '⏸';
			case 'running':
				return '⏳';
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			default:
				return '❓';
		}
	}

	get statusColor() {
		switch (this._status) {
			case 'pending':
				return '#6b7280';
			case 'running':
				return '#3b82f6';
			case 'success':
				return '#10b981';
			case 'error':
				return '#ef4444';
			default:
				return '#6b7280';
		}
	}
}

export class RSTScenario extends Scenario {
	constructor(feedbackController) {
		super('request_security_token', 'Request Security Token (STS)', null);
		const uuidForRequest = crypto.randomUUID();
		const handler = new RequestSecurityToken({
			pin: this.pin,
			ssin: this.practitionnerSSIN,
			async onCreateEnveloppe(enveloppe) {
				console.log('Enveloppe created:', enveloppe);
				feedbackController.request = {
					id: uuidForRequest,
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
					id: uuidForRequest,
					endpoint: this.endpoint,
					headers: JSON.stringify(Object.fromEntries(response.headers)),
					status: response.status,
					xml_string: xml_content,
					created_at: new Date().toISOString(),
					metadata: { scenario: 'Get SAML Token' }
				};
				const saml_token = samlTokenExtractor(xml_content);

				appState.set_eHealth({
					ssin: this.ssin,
					certificate: this.certificate,
					saml_token
				});
			}
		});
		this.handler = handler;
	}
}

export class GetETKScenario extends Scenario {
	constructor(feedbackController) {
		super('get_etk', 'Get ETK', null);
		const uuidForRequest = crypto.randomUUID();
		const handler = new GetETK({
			pin: this.pin,
			async onCreateEnveloppe(enveloppe) {
				console.log(enveloppe);
			}
		});
	}
}

export class MemberDataConsult1 extends Scenario {
	constructor(feedbackController) {
		super('member_data_consultation', 'Member Data Consultation', null);
		const uuidForRequest = crypto.randomUUID();
		const handler = new MemberDataConsultation({
			pin: this.pin,
			query: {
				ssin: '58121520763',
				not_before: dayjs.tz(dayjs().subtract(1, 'day'), 'Europe/Brussels').format(),
				not_on_or_after: dayjs.tz(dayjs().add(1, 'day'), 'Europe/Brussels').format(),
				issuer_fmt: 'Nihii11',
				issuer_val: '54403736527',
				facets: [{ type: 'insurability', requestType: 'information', contactType: 'other' }]
			},
			async onCreateEnveloppe(enveloppe) {
				console.log('Enveloppe created:', enveloppe);
				feedbackController.request = {
					id: uuidForRequest,
					endpoint: this.endpoint,
					headers: JSON.stringify(this.sts_headers),
					xml_string: enveloppe,
					created_at: new Date().toISOString(),
					metadata: { scenario: 'Member Data Consultation' }
				};
			},
			async onResponse(response, xml_content) {
				console.log('Response received:', response, xml_content);
				feedbackController.response = {
					id: uuidForRequest,
					endpoint: this.endpoint,
					headers: JSON.stringify(Object.fromEntries(response.headers)),
					status: response.status,
					xml_string: xml_content,
					created_at: new Date().toISOString(),
					metadata: { scenario: 'Member Data Consultation' }
				};
			}
		});
		this.handler = handler;
	}
}
