import { invoke } from '@tauri-apps/api/core';
import { terminal } from 'virtual:terminal';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { XmlCanonicalizer } from 'xmldsigjs';

export class SecurityElement {
	digest;
	async hash() {
		terminal.log('Canonicalized element to hash:', this.canonicalized?.substring(0, 20) + '...');
		this.digest = await invoke('sha256_hash_base64', { data: this.canonicalized });
		return this.digest;
	}

	toDOMElement() {
		return new DOMParser().parseFromString(this.xmlString, 'text/xml');
	}

	canonicalize() {
		let dom = this.toDOMElement();
		console.log('DOM to canonicalize:', dom, this.xmlString);
		console.log('DOM to canonicalize after reparse:', dom);
		this.canonicalized = new XmlCanonicalizer().Canonicalize(dom, {
			exclusive: true,
			withComments: false
		});
	}
}

export class TimeStampElement extends SecurityElement {
	constructor({ ts_uuid } = {}) {
		super();
		dayjs.extend(utc);
		dayjs.extend(timezone);
		this.uuid = ts_uuid;
		const now = dayjs.tz(Date.now(), 'Europe/Brussels');
		this.created = now.toISOString();
		this.expires = now.add(1, 'minute').toISOString();
		this.canonicalized = `<wsu:Timestamp xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="TS-${ts_uuid}"><wsu:Created>${this.created}</wsu:Created><wsu:Expires>${this.expires}</wsu:Expires></wsu:Timestamp>`;
		this.xmlString = `<wsu:Timestamp wsu:Id="TS-${this.uuid}"><wsu:Created>${this.created}</wsu:Created><wsu:Expires>${this.expires}</wsu:Expires></wsu:Timestamp>`;
	}
}

export class STSBodyElement extends SecurityElement {
	constructor({ body_uuid, context_uuid, ssin, e_health_certificate } = {}) {
		super();
		dayjs.extend(utc);
		dayjs.extend(timezone);
		this.validity_start = dayjs.tz(Date.now(), 'Europe/Brussels').format();
		this.validity_end = dayjs.tz(Date.now(), 'Europe/Brussels').add(1, 'day').format();

		this.uuid = body_uuid;
		this.canonicalized = `<SOAP-ENV:Body xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${body_uuid}"><wst:RequestSecurityToken xmlns:wst="http://docs.oasis-open.org/ws-sx/ws-trust/200512" Context="${context_uuid}"><wst:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV1.1</wst:TokenType><wst:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</wst:RequestType><wst:Claims Dialect="http://docs.oasis-open.org/wsfed/authorization/200706/authclaims"><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:ehealth:1.0:certificateholder:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:person:ssin:ehealth:1.0:nihii:physiotherapist:nihii11"></auth:ClaimType><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:person:ssin:ehealth:1.0:professional:physiotherapist:boolean"></auth:ClaimType></wst:Claims><wst:Lifetime><wsu:Created>${this.validity_start}</wsu:Created><wsu:Expires>${this.validity_end}</wsu:Expires></wst:Lifetime><wst:KeyType>http://docs.oasis-open.org/ws-sx/wstrust/200512/PublicKey</wst:KeyType><wst:UseKey><wsse:SecurityTokenReference xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><ds:X509Data xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Certificate>${e_health_certificate}</ds:X509Certificate></ds:X509Data></wsse:SecurityTokenReference></wst:UseKey></wst:RequestSecurityToken></SOAP-ENV:Body>`;
		this.xmlString = `<SOAP-ENV:Body xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${body_uuid}"><wst:RequestSecurityToken xmlns:wst="http://docs.oasis-open.org/ws-sx/ws-trust/200512" xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" Context="${context_uuid}"><wst:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV1.1</wst:TokenType><wst:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</wst:RequestType><wst:Claims Dialect="http://docs.oasis-open.org/wsfed/authorization/200706/authclaims"><auth:ClaimType Uri="urn:be:fgov:ehealth:1.0:certificateholder:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType Uri="urn:be:fgov:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType Uri="urn:be:fgov:person:ssin:ehealth:1.0:nihii:physiotherapist:nihii11"/><auth:ClaimType Uri="urn:be:fgov:person:ssin:ehealth:1.0:professional:physiotherapist:boolean"/></wst:Claims><wst:Lifetime><wsu:Created>${this.validity_start}</wsu:Created><wsu:Expires>${this.validity_end}</wsu:Expires></wst:Lifetime><wst:KeyType>http://docs.oasis-open.org/ws-sx/wstrust/200512/PublicKey</wst:KeyType><wst:UseKey><wsse:SecurityTokenReference><ds:X509Data><ds:X509Certificate>${e_health_certificate}</ds:X509Certificate></ds:X509Data></wsse:SecurityTokenReference></wst:UseKey></wst:RequestSecurityToken></SOAP-ENV:Body>`;
	}
}

export class BinarySecurityTokenElement extends SecurityElement {
	constructor({ bst_uuid, e_health_certificate } = {}) {
		super();
		this.uuid = bst_uuid;
		this.token = e_health_certificate;
		this.canonicalized = `<wsse:BinarySecurityToken xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" wsu:Id="X509-${bst_uuid}">${e_health_certificate}</wsse:BinarySecurityToken>`;
		this.xmlString = `<wsse:BinarySecurityToken EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" wsu:Id="X509-${bst_uuid}">${e_health_certificate}</wsse:BinarySecurityToken>`;
	}
}

export class SignedInfoElement extends SecurityElement {
	constructor({ body_uuid, body_digest, ts_uuid, ts_digest, bst_uuid, bst_digest } = {}) {
		super();
		this.canonicalized = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:CanonicalizationMethod><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"></ds:SignatureMethod><ds:Reference URI="#id-${body_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${body_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#TS-${ts_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${ts_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#X509-${bst_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${bst_digest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
		this.xmlString = `<ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#id-${body_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${body_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#TS-${ts_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${ts_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#X509-${bst_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${bst_digest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
	}

	async hash() {
		terminal.log('Canonicalized SignedInfo:', this.canonicalized);
		this.digest = await invoke('sha256_hash_bytes', { data: this.canonicalized });
		terminal.log('SignedInfo digest (base64):', this.digest);
		return this.digest;
	}
}

export class KeyInfoElement {
	constructor({ bst_uuid, key_info_uuid, str_uuid } = {}) {
		this.xmlString = `<ds:KeyInfo Id="KI-${key_info_uuid}"><wsse:SecurityTokenReference wsu:Id="STR-${str_uuid}"><wsse:Reference URI="#X509-${bst_uuid}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"/></wsse:SecurityTokenReference></ds:KeyInfo>`;
	}
}

export class STSHeader {
	/**
	 *
	 * @param {{ ts: TimeStampElement, bst: BinarySecurityTokenElement, signed_info: SignedInfoElement, signature_uuid: string, str_uuid: string, key_info_uuid: string, signature_value: string }} param0
	 */
	constructor({
		ts,
		bst,
		signed_info,
		signature_uuid,
		str_uuid,
		key_info_uuid,
		signature_value
	} = {}) {
		this.keyInfoElement = new KeyInfoElement({ bst_uuid: bst.uuid, key_info_uuid, str_uuid });
		this.xmlString = `<SOAP-ENV:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" SOAP-ENV:mustUnderstand="1">${ts.xmlString}${bst.xmlString}<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="SIG-${signature_uuid}">${signed_info.xmlString}<ds:SignatureValue>${signature_value}</ds:SignatureValue>${this.keyInfoElement.xmlString}</ds:Signature></wsse:Security></SOAP-ENV:Header>`;
	}
}
