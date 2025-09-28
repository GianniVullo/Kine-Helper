import { createEnveloppe, gen_uuids, samlTokenExtractor } from '../../utils.js';
import { TimeStampElement } from '../../soapHeader';
import { AssertionElement } from '../../SAMLToken.js';
import { invoke } from '@tauri-apps/api/core';
import { terminal } from 'virtual:terminal';
import { fetch } from '@tauri-apps/plugin-http';
import { appState } from '../../../../../managers/AppState.svelte.js';

/**
 * @typedef {Object} AttributeQuery
 * @property {string | null} ssin
 * @property {string | null} mut_code
 * @property {string | null} reg
 * @property {string} not_before
 * @property {string} not_on_or_after
 * @property {'Nihii11' | 'CbeOrganization'} issuer_fmt
 * @property {string} issuer_val
 * @property {{type: 'insurability' | 'globalMedicalFile' | 'chronicCondition' | 'palliativeStatus', requestType: 'information' | 'invoicing', contactType: 'other' | 'hospitalized'}[]} facets
 */

/**
 * Here we will use query params to define what the uuser wants to fetch from mycarenet and build the AttributeQuery accordingly
 */
export class MemberDataConsultation {
	endpoint = 'https://services-acpt.ehealth.fgov.be/MyCareNet/MemberData/v1';
	headers = {
		'Content-Type': 'text/xml; charset=utf-8',
		SOAPAction: 'urn:be:fgov:ehealth:mycarenet:memberdata:protocol:v1:MemberDataConsultation'
	};

	constructor({ onCreateEnveloppe, onResponse } = {}) {
		this.onCreateEnveloppe = onCreateEnveloppe;
		this.onResponse = onResponse;
	}

	/**
	 *
	 * @param {{query: AttributeQuery, pin: string}} param0
	 */
	async getMemberData({ query, pin }) {
		terminal.group();
		terminal.log('getSAMLToken called');
		terminal.log('Generating STS Enveloppe');
		const enveloppe = await this.createMemberDataEnveloppe({ query });
		if (this.onCreateEnveloppe) {
			await this.onCreateEnveloppe(enveloppe);
		}
		terminal.log('Enveloppe:', enveloppe);
		const response = await fetch(this.endpoint, {
			method: 'POST',
			body: enveloppe,
			headers: this.headers
		});
		const text = await response.text();
		if (this.onResponse) {
			await this.onResponse(text);
		}

		const saml_token = samlTokenExtractor(text);

		appState.set_eHealth({
			ssin,
			certificate: e_health_certificate,
			saml_token
		});
		terminal.warn('SAML Token received:', saml_token);

		terminal.groupEnd();
	}

	/**
	 *
	 * @param {{query: AttributeQuery, pin: string}} param0
	 */
	async createMemberDataEnveloppe({ query, pin }) {
		/**----------------------------------
		 ** Définition des matières premières
		 * ----------------------------------
		 */
		const [body_uuid, attribute_query_uuid, ts_uuid, key_info_uuid, str_uuid, signature_uuid] =
			gen_uuids(7);
		/**
		 * -----------------------------------------------
		 ** Définition des constituants de notre enveloppe
		 * -----------------------------------------------
		 */

		terminal.log(
			'------------------------------\nGenerating SOAP Header and Body\n------------------------------\n'
		);
		terminal.group();
		const body = new MemberDataBodyElement({
			query,
			attribute_query_uuid,
			body_uuid
		});
		terminal.log('Body done');
		const ts = new TimeStampElement({ ts_uuid });
		terminal.log('Timestamp done');
		console.log('AppState eHealth:', appState.eHealth.saml_token.raw_assertion_xml);
		const saml_token = new AssertionElement({
			raw_saml_assertion: appState.eHealth.saml_token.raw_assertion_xml
		});
		terminal.log('SAML Token done');
		const signedInfo = new SignedInfoElementMemberData({
			body_uuid,
			body_digest: await body.hash(),
			ts_uuid: ts.uuid,
			ts_digest: await ts.hash(),
			str_uuid,
			saml_digest: saml_token.hash()
		});
		terminal.log('SignedInfo done');
		// we do not need the signature value in a var as it is stored in the SignedInfoElement instance
		const hash = await signedInfo.hash();
		terminal.log('SignedInfo hash (base64):', hash);
		terminal.log('Invoking sign_eid_data with pin', pin);
		const signature_value = await invoke('sign_eid_data', { hash, pin });
		const header = new MemberDataConsultationHeaderElement({
			ts,
			saml_token,
			signature_uuid,
			str_uuid,
			key_info_uuid,
			signed_info: signedInfo,
			signature_value
		});
		terminal.log('Header:', header);
		terminal.log('Body:', body);
		terminal.groupEnd();
		terminal.log('STSEnveloppe done\n------------------------------');
		return createEnveloppe(header.xmlString, body.xmlString);
	}
}
