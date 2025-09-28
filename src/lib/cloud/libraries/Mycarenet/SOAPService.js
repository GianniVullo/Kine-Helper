import { invoke } from '@tauri-apps/api/core';
import { BinarySecurityTokenElement, SecurityElement, TimeStampElement } from './soapHeader';
import { AssertionElement, SAMLToken } from './SAMLToken';
import { fetch } from '@tauri-apps/plugin-http';
import { gen_uuids } from './utils';
import { info } from '../logging';

/**
 * The SOAPService should be able to create an SOAP envelope. It means it should have a createEnveloppe interface, lifeCycle hooks, build WSSecurity headers
 */
export class SOAPService {
	endpoint;
	headers;

	constructor({ samlToken, onCreateEnveloppe, onResponse, certificate, pin }) {
		this.samlToken = samlToken;
		this.onCreateEnveloppe = onCreateEnveloppe;
		this.onResponse = onResponse;
		this.certificate = certificate;
		this.pin = pin;
	}

	async perform() {
		info('perform called');
		info('Generating Enveloppe');
		await this.createEnveloppe();
		if (this.onCreateEnveloppe) {
			await this.onCreateEnveloppe(this.enveloppe);
		}
		info('Enveloppe:', this.enveloppe);

		await this.sendRequest();
	}

	async sendRequest() {
		console.log('Sending request with headers:', this.headers);
		console.log('sending request to', this.endpoint);
		const response = await fetch(this.endpoint, {
			method: 'POST',
			body: this.enveloppe,
			headers: this.headers
		});
		const text = await response.text();
		if (this.onResponse) {
			await this.onResponse(response, text);
		}
	}

	async createEnveloppe() {}

	enveloppeWrapper(header, body) {
		return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">${header}${body}</SOAP-ENV:Envelope>`;
	}

	/**
	 * @param {object} param0
	 * @param {boolean} param0.hasBST - whether to use BinarySecurityToken or SAML token
	 * @param {object} param0.body - the SOAP body element, optional
	 */
	async wssecHeader({ hasBST, body }) {
		let token;
		let bst;
		let [timestampId] = gen_uuids(5);
		let siTokenInfo = {};
		if (hasBST) {
			let bst_uuid = crypto.randomUUID();
			bst = new BinarySecurityTokenElement({
				bst_uuid,
				e_health_certificate: this.certificate
			});
			siTokenInfo = { bst_uuid: bst.uuid, bst_digest: await bst.hash() };
		} else if (this.samlToken) {
			token = new AssertionElement({ raw_saml_assertion: this.samlToken.raw_assertion_xml });
			siTokenInfo = { saml: token, saml_digest: await token.hash() };
		} else {
			throw new Error('Unsupported security token type');
		}
		let ts = new TimeStampElement({ ts_uuid: timestampId });
		if (body) {
			siTokenInfo.body_uuid = body.uuid;
			siTokenInfo.body_digest = await body.hash();
		}
		let si = new SignedInfoElement({
			ts_uuid: ts.uuid,
			ts_digest: await ts.hash(),
			...siTokenInfo
		});
		console.log('SignedInfoElement:', si);
		const hash = await si.hash();
		console.log('SignedInfoElement hash:', hash);
		console.log('Using pin:', this.pin);
		const signature_value = await invoke('sign_eid_data', { hash, pin: this.pin });
		console.log('Signature value:', signature_value);
		return new SOAPHeader({
			ts,
			bst,
			signed_info: si,
			signature_uuid: crypto.randomUUID(),
			str_uuid: crypto.randomUUID(),
			key_info_uuid: crypto.randomUUID(),
			signature_value,
			saml: token
		});
	}
}

export class SOAPHeader {
	/**
	 *
	 * @param {{ ts: TimeStampElement, bst: BinarySecurityTokenElement, signed_info: SignedInfoElement, signature_uuid: string, str_uuid: string, key_info_uuid: string, signature_value: string }} param0
	 */
	constructor({
		ts,
		bst,
		saml,
		signed_info,
		signature_uuid,
		str_uuid,
		key_info_uuid,
		signature_value
	} = {}) {
		this.keyInfoElement = new KeyInfoElement({
			bst_uuid: bst?.uuid,
			key_info_uuid,
			str_uuid,
			saml_assertion_id: saml?.saml_assertion_id
		});
		let token;
		if (bst) {
			token = bst;
		} else {
			token = saml;
		}
		this.xmlString = `<SOAP-ENV:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" SOAP-ENV:mustUnderstand="1">${ts.xmlString}${token.xmlString}<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="SIG-${signature_uuid}">${signed_info.xmlString}<ds:SignatureValue>${signature_value}</ds:SignatureValue>${this.keyInfoElement.xmlString}</ds:Signature></wsse:Security></SOAP-ENV:Header>`;
	}
}

class SignedInfoElement extends SecurityElement {
	/**
	 *
	 * @param {object} param0
	 * @param {string} param0.body_uuid
	 * @param {string} param0.body_digest
	 * @param {string} param0.ts_uuid
	 * @param {string} param0.ts_digest
	 * @param {string} param0.bst_uuid
	 * @param {string} param0.bst_digest
	 * @param {SAMLToken} param0.saml
	 * @param {string} param0.str_uuid
	 */
	constructor({
		body_uuid,
		body_digest,
		ts_uuid,
		ts_digest,
		bst_uuid,
		bst_digest,
		str_uuid,
		saml,
		saml_digest
	} = {}) {
		super();
		this.canonicalized = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:CanonicalizationMethod><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"></ds:SignatureMethod>${this.bodyReference({ canonical: true, body_uuid, body_digest })}<ds:Reference URI="#TS-${ts_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${ts_digest}</ds:DigestValue></ds:Reference>${this.BSTSAMLOrNullReference({ canonical: true, saml, saml_digest, bst_uuid, bst_digest, str_uuid })}</ds:SignedInfo>`;
		this.xmlString = `<ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>${this.bodyReference({ body_uuid, body_digest })}<ds:Reference URI="#TS-${ts_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${ts_digest}</ds:DigestValue></ds:Reference>${this.BSTSAMLOrNullReference({ saml, saml_digest, bst_uuid, bst_digest, str_uuid })}</ds:SignedInfo>`;
	}

	bodyReference({ canonical = false, body_uuid, body_digest } = {}) {
		if (body_uuid && body_digest) {
			return `<ds:Reference URI="#id-${body_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"${canonical ? '></ds:Transform' : '/'}></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"${canonical ? '></ds:DigestMethod' : '/'}><ds:DigestValue>${body_digest}</ds:DigestValue></ds:Reference>`;
		}
	}

	BSTSAMLOrNullReference({ canonical = false, saml, saml_digest, bst_uuid, bst_digest, str_uuid }) {
		if (saml) {
			return `<ds:Reference URI="#STR-${str_uuid ?? crypto.randomUUID()}"><ds:Transforms><ds:Transform Algorithm="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#STR-Transform"><wsse:TransformationParameters xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"${canonical ? '></ds:CanonicalizationMethod' : '/'}></wsse:TransformationParameters></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"${canonical ? '></ds:DigestMethod' : '/'}><ds:DigestValue>${saml_digest}</ds:DigestValue></ds:Reference>`;
		} else if (bst_uuid && bst_digest) {
			return `<ds:Reference URI="#X509-${bst_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"${canonical ? '></ds:Transform' : '/'}></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"${canonical ? '></ds:DigestMethod' : '/'}><ds:DigestValue>${bst_digest}</ds:DigestValue></ds:Reference>`;
		} else {
			console.log('NO THIRD REF ?');
			return '';
		}
	}

	async hash() {
		info('Canonicalized SignedInfo:', this.canonicalized.substring(0, 20));
		// console.warn(this.canonicalized);
		this.digest = await invoke('sha256_hash_bytes', { data: this.canonicalized });
		console.log(this.digest);
		info('SignedInfo digest (base64):', this.digest);
		return this.digest;
	}
}

class KeyInfoElement {
	constructor({ bst_uuid, saml_assertion_id, key_info_uuid, str_uuid } = {}) {
		if (saml_assertion_id) {
			this.xmlString = `<ds:KeyInfo xmlns:wsse11="http://docs.oasis-open.org/wss/oasis-wss-wssecurity-secext-1.1.xsd" Id="KI-${key_info_uuid}"><wsse:SecurityTokenReference wsse11:TokenType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV1.1"><wsse:KeyIdentifier ValueType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.0#SAMLAssertionID">${saml_assertion_id}</wsse:KeyIdentifier></wsse:SecurityTokenReference></ds:KeyInfo>`;
		} else {
			this.xmlString = `<ds:KeyInfo Id="KI-${key_info_uuid}"><wsse:SecurityTokenReference wsu:Id="STR-${str_uuid}"><wsse:Reference URI="#X509-${bst_uuid}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"/></wsse:SecurityTokenReference></ds:KeyInfo>`;
		}
	}
}
