import { createEnveloppe, gen_uuids, samlTokenExtractor } from '../utils.js';
import {
	BinarySecurityTokenElement,
	STSBodyElement,
	STSHeader,
	TimeStampElement,
	SignedInfoElement
} from '../soapHeader';
import { invoke } from '@tauri-apps/api/core';
import { terminal } from 'virtual:terminal';
import { fetch } from '@tauri-apps/plugin-http';
import {} from '@tauri-apps/plugin-clipboard-manager';
import { appState } from '../../../../managers/AppState.svelte.js';

export class SecurityTokenService {
	endpoint = 'https://services-acpt.ehealth.fgov.be/IAM/SecurityTokenService/v1';
	headers = {
		'Content-Type': 'text/xml; charset=utf-8',
		SOAPAction: 'urn:be:fgov:ehealth:sts:protocol:v1:RequestSecurityToken'
	};
	certificate;

	constructor({ onCreateSTSEnveloppe, onResponse } = {}) {
		this.onCreateSTSEnveloppe = onCreateSTSEnveloppe;
		this.onResponse = onResponse;
	}

	async getSAMLToken({ ssin, pin }) {
		terminal.group();
		terminal.log('getSAMLToken called');
		terminal.log('Generating STS Enveloppe');
		const enveloppe = await this.createSTSEnveloppe({ ssin, pin });
		if (this.onCreateSTSEnveloppe) {
			await this.onCreateSTSEnveloppe(enveloppe);
		}
		terminal.log('Enveloppe:', enveloppe);
		const response = await fetch(this.endpoint, {
			method: 'POST',
			body: enveloppe,
			headers: this.headers
		});
		const text = await response.text();
		if (this.onResponse) {
			await this.onResponse(response, text);
		}

		const saml_token = samlTokenExtractor(text);

		appState.set_eHealth({
			ssin,
			certificate: this.certificate,
			saml_token
		});
		terminal.warn('SAML Token received:', saml_token);

		terminal.groupEnd();
	}

	async createSTSEnveloppe({ ssin, pin }) {
		/**----------------------------------
		 ** Définition des matières premières
		 * ----------------------------------
		 */
		this.certificate = await invoke('get_b64_certificate');
		const [body_uuid, context_uuid, ts_uuid, bst_uuid, key_info_uuid, str_uuid, signature_uuid] =
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
		const body = new STSBodyElement({
			body_uuid,
			context_uuid,
			ssin,
			e_health_certificate: this.certificate
		});
		terminal.log('Body done');
		const ts = new TimeStampElement({ ts_uuid });
		terminal.log('Timestamp done');
		const bst = new BinarySecurityTokenElement({ bst_uuid, e_health_certificate: this.certificate });
		terminal.log('BinarySecurityToken done');
		const signedInfo = new SignedInfoElement({
			body_uuid: body.uuid,
			body_digest: await body.hash(),
			ts_uuid: ts.uuid,
			ts_digest: await ts.hash(),
			bst_uuid: bst.uuid,
			bst_digest: await bst.hash()
		});
		terminal.log('SignedInfo done');
		// we do not need the signature value in a var as it is stored in the SignedInfoElement instance
		const hash = await signedInfo.hash();
		terminal.log('SignedInfo hash (base64):', hash);
		terminal.log('Invoking sign_eid_data with pin', pin);
		const signature_value = await invoke('sign_eid_data', { hash, pin });
		const header = new STSHeader({
			ts,
			bst,
			body,
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
