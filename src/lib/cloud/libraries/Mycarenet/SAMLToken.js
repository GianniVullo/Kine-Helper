import dayjs from 'dayjs';
import { DOMParser } from '@xmldom/xmldom';
import { SecurityElement } from './soapHeader';

export class SAMLToken {
	raw_assertion_xml = '';
	not_on_or_after = null;

	constructor({ raw_assertion_xml, not_on_or_after }) {
		this.raw_assertion_xml = raw_assertion_xml;
		this.not_on_or_after = not_on_or_after;
	}

	is_about_to_expire(skew_secs = 180) {
		let skewed_now = dayjs().add(skew_secs, 'seconds');
		return skewed_now.isAfter(dayjs(this.not_on_or_after));
	}
}

export class AssertionElement extends SecurityElement {
	constructor({ raw_saml_assertion } = {}) {
		super();
		this.xmlString = raw_saml_assertion;
		console.log('Raw SAML Assertion:', raw_saml_assertion);
		this.uuid = this.toDOMElement()
			.getElementsByTagName('Assertion')[0]
			.getAttribute('AssertionID');
	}

	get canonicalized() {
		return this.canonicalized_saml(this.extractSAMLTemplateVariables());
	}

	get assertionId() {
		const parser = new DOMParser();
		const doc = parser.parseFromString(this.xmlString, 'text/xml');

		// Root Assertion attributes
		const assertion = doc.documentElement;
		return assertion.getAttribute('AssertionID');
	}

	extractSAMLTemplateVariables() {
		const parser = new DOMParser();
		const doc = parser.parseFromString(this.xmlString, 'text/xml');

		// Extract all needed variables for the template
		const templateVars = {};

		// Root Assertion attributes
		const assertion = doc.documentElement;
		templateVars.assertionId = assertion.getAttribute('AssertionID');
		templateVars.issueInstant = assertion.getAttribute('IssueInstant');

		// Conditions
		const conditions = doc.getElementsByTagName('Conditions')[0];
		if (conditions) {
			templateVars.notBefore = conditions.getAttribute('NotBefore');
			templateVars.notOnOrAfter = conditions.getAttribute('NotOnOrAfter');
		}

		// AuthenticationStatement
		const authStatement = doc.getElementsByTagName('AuthenticationStatement')[0];
		if (authStatement) {
			templateVars.authenticationInstant = authStatement.getAttribute('AuthenticationInstant');
		}

		// NameIdentifier (appears twice in template, same values)
		const nameIdentifiers = doc.getElementsByTagName('NameIdentifier');
		if (nameIdentifiers.length > 0) {
			const nameId = nameIdentifiers[0];
			templateVars.nameQualifier = nameId.getAttribute('NameQualifier');
			templateVars.subjectName = nameId.textContent;
		}

		// X509 Certificate from SubjectConfirmation (holder of key)
		const keyInfoElements = doc.getElementsByTagName('ds:KeyInfo');
		if (keyInfoElements.length > 0) {
			const holderCert = keyInfoElements[0].getElementsByTagName('ds:X509Certificate')[0];
			if (holderCert) {
				templateVars.holderOfKeyCertificate = holderCert.textContent;
			}
		}

		// Extract practitioner SSIN and NIHII from attributes
		const attributes = doc.getElementsByTagName('Attribute');
		for (let i = 0; i < attributes.length; i++) {
			const attr = attributes[i];
			const attrName = attr.getAttribute('AttributeName');
			const attrValueElement = attr.getElementsByTagName('AttributeValue')[0];
			const attrValue = attrValueElement ? attrValueElement.textContent : null;

			if (
				attrName === 'urn:be:fgov:person:ssin' ||
				attrName === 'urn:be:fgov:ehealth:1.0:certificateholder:person:ssin'
			) {
				templateVars.practitionerSSIN = attrValue;
			} else if (attrName.includes('nihii11')) {
				templateVars.nihii = attrValue;
			} else if (attrName.includes('professional') && attrName.includes('boolean')) {
				templateVars.isProfessional = attrValue;
			}
		}

		// Signature details
		const signature = doc.getElementsByTagName('ds:Signature')[0];
		if (signature) {
			// URI for the reference (should be #assertionId)
			templateVars.uri_id = `#${templateVars.assertionId}`;

			// Digest value
			const digestValue = signature.getElementsByTagName('ds:DigestValue')[0];
			if (digestValue) {
				templateVars.digestValue = digestValue.textContent;
			}

			// Signature value
			const signatureValue = signature.getElementsByTagName('ds:SignatureValue')[0];
			if (signatureValue) {
				templateVars.signatureValue = signatureValue.textContent;
			}

			// Signing certificate (from signature KeyInfo)
			const sigKeyInfo = signature.getElementsByTagName('ds:KeyInfo')[0];
			if (sigKeyInfo) {
				const signingCert = sigKeyInfo.getElementsByTagName('ds:X509Certificate')[0];
				if (signingCert) {
					templateVars.signingCertificate = signingCert.textContent;
				}
			}
		}

		return templateVars;
	}

	canonicalized_saml({
		assertionId,
		issueInstant,
		notBefore,
		notOnOrAfter,
		authenticationInstant,
		nameQualifier,
		subjectName,
		holderOfKeyCertificate,
		practitionerSSIN,
		nihii,
		isProfessional,
		uri_id,
		digestValue,
		signatureValue,
		signingCertificate
	}) {
		return `<Assertion xmlns="urn:oasis:names:tc:SAML:1.0:assertion" AssertionID="${assertionId}" IssueInstant="${issueInstant}" Issuer="urn:be:fgov:ehealth:sts:1_0" MajorVersion="1" MinorVersion="1"><Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}"></Conditions><AuthenticationStatement AuthenticationInstant="${authenticationInstant}" AuthenticationMethod="urn:oasis:names:tc:SAML:1.0:am:X509-PKI"><Subject><NameIdentifier Format="urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName" NameQualifier="${nameQualifier}">${subjectName}</NameIdentifier><SubjectConfirmation><ConfirmationMethod>urn:oasis:names:tc:SAML:1.0:cm:holder-of-key</ConfirmationMethod><ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Data><ds:X509Certificate>${holderOfKeyCertificate}</ds:X509Certificate></ds:X509Data></ds:KeyInfo></SubjectConfirmation></Subject></AuthenticationStatement><AttributeStatement><Subject><NameIdentifier Format="urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName" NameQualifier="${nameQualifier}">${subjectName}</NameIdentifier></Subject><Attribute AttributeName="urn:be:fgov:ehealth:1.0:certificateholder:person:ssin" AttributeNamespace="urn:be:fgov:identification-namespace"><AttributeValue>${practitionerSSIN}</AttributeValue></Attribute><Attribute AttributeName="urn:be:fgov:person:ssin" AttributeNamespace="urn:be:fgov:identification-namespace"><AttributeValue>${practitionerSSIN}</AttributeValue></Attribute><Attribute AttributeName="urn:be:fgov:person:ssin:ehealth:1.0:nihii:physiotherapist:nihii11" AttributeNamespace="urn:be:fgov:certified-namespace:ehealth"><AttributeValue>${nihii}</AttributeValue></Attribute><Attribute AttributeName="urn:be:fgov:person:ssin:ehealth:1.0:professional:physiotherapist:boolean" AttributeNamespace="urn:be:fgov:certified-namespace:ehealth"><AttributeValue>${isProfessional}</AttributeValue></Attribute></AttributeStatement><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:CanonicalizationMethod><ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"></ds:SignatureMethod><ds:Reference URI="${uri_id}"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"></ds:Transform><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod><ds:DigestValue>${digestValue}</ds:DigestValue></ds:Reference></ds:SignedInfo><ds:SignatureValue>${signatureValue}</ds:SignatureValue><ds:KeyInfo><ds:X509Data><ds:X509Certificate>${signingCertificate}</ds:X509Certificate></ds:X509Data></ds:KeyInfo></ds:Signature></Assertion>`;
	}
}
