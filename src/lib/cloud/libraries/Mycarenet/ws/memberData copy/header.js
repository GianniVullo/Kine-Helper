import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
export class SignedInfoElementMemberData extends SecurityElement {
	constructor({ body_uuid, body_digest, ts_uuid, ts_digest, str_uuid, saml_digest } = {}) {
		super();
		this.canonicalized = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:CanonicalizationMethod><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"></ds:SignatureMethod><ds:Reference URI="#id-${body_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${body_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#TS-${ts_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${ts_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#STR-${str_uuid}"><ds:Transforms><ds:Transform Algorithm="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#STR-Transform"><wsse:TransformationParameters xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:CanonicalizationMethod></wsse:TransformationParameters></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${saml_digest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
		this.xmlString = `<ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/><ds:Reference URI="#id-${body_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${body_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#TS-${ts_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${ts_digest}</ds:DigestValue></ds:Reference><ds:Reference URI="#X509-${bst_uuid}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><ds:DigestValue>${bst_digest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`;
	}

	async hash() {
		terminal.log('Canonicalized SignedInfo:', this.canonicalized);
		this.digest = await invoke('sha256_hash_bytes', { data: this.canonicalized });
		terminal.log('SignedInfo digest (base64):', this.digest);
		return this.digest;
	}
}

//! HERE might be the error
{
	/* <ds:KeyInfo Id="KI-${key_info_uuid}"><wsse:SecurityTokenReference wsu:Id="STR-${str_uuid}"><wsse:Reference URI="#X509-${bst_uuid}" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3"/></wsse:SecurityTokenReference></ds:KeyInfo> */
}
export class KeyInfoElementMemberData {
	constructor({ saml_assertion_id, key_info_uuid, str_uuid } = {}) {
		this.xmlString = `<ds:KeyInfo Id="KI-${key_info_uuid}"><wsse:SecurityTokenReference wsse11:TokenType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV1.1"><wsse:KeyIdentifier ValueType="http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.0#SAMLAssertionID">${saml_assertion_id}</wsse:KeyIdentifier></wsse:SecurityTokenReference></ds:KeyInfo>`;
	}
}

export class MemberDataConsultationHeaderElement {
	/**
	 *
	 * @param {{ ts: TimeStampElement, saml_token: AssertionElement, signed_info: SignedInfoElement, signature_uuid: string, str_uuid: string, key_info_uuid: string, signature_value: string }} param0
	 */
	constructor({
		ts,
		saml_token,
		signed_info,
		signature_uuid,
		str_uuid,
		key_info_uuid,
		signature_value
	} = {}) {
		this.keyInfoElement = new KeyInfoElementMemberData({ key_info_uuid, str_uuid });
		this.xmlString = `<SOAP-ENV:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" SOAP-ENV:mustUnderstand="1">${ts.xmlString}${saml_token.xmlString}<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="SIG-${signature_uuid}">${signed_info.xmlString}<ds:SignatureValue>${signature_value}</ds:SignatureValue>${this.keyInfoElement.xmlString}</ds:Signature></wsse:Security></SOAP-ENV:Header>`;
	}
}
