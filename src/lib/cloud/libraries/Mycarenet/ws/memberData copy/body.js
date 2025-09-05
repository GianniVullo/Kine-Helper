import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { SecurityElement } from '../../soapHeader';

export class MemberDataBodyElement extends SecurityElement {
	/**
	 *
	 * @param {{ query: { ssin: string, mut_code: string, reg: string, not_before: string, not_on_or_after: string, issuer_fmt: string, issuer_val: string, facets: {type: 'insurability' | 'globalMedicalFile' | 'chronicCondition' | 'palliativeStatus', requestType: 'information' | 'invoicing', contactType: 'other' | 'hospitalized'}[] } }} param0
	 */
	constructor({ query, attribute_query_uuid, body_uuid, issue_instant } = {}) {
		super();
		dayjs.extend(timezone);
		dayjs.extend(utc);
		this.uuid = attribute_query_uuid;
		this.issuer_el = new IssuerElement({
			issuer_fmt: query.issuer_fmt,
			issuer_val: query.issuer_val
		});
		this.issue_instant =
			issue_instant || dayjs.tz(Date.now(), 'Europe/Brussels').format('YYYY-MM-DDTHH:mm:ss');
		this.extension_el = new ExtensionElement({ facets: query.facets || [] });
		const subject_el = new SubjectElement({ query });
		`<SOAP-ENV:Body xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${body_uuid}"></SOAP-ENV:Body>`;
		this.canonicalized = `<SOAP-ENV:Body xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${body_uuid}"><samlp:AttributeQuery xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_${attribute_query_uuid}" IssueInstant="${issue_instant}" Version="2.0">${this.issuer_el.xmlString}${this.extension_el.xmlString}${subject_el.xmlString}</samlp:AttributeQuery></SOAP-ENV:Body>`;
		// this.canonicalize();
	}
}

class ExtensionElement {
	constructor({ facets }) {
		this.facetsList = [];
		for (const facet of facets) {
			switch (facet.type) {
				case 'insurability':
					this.facetsList.push(
						`<ext:Facet id="urn:be:cin:nippin:insurability"><Dimension id="requestType">${facet.requestType}</Dimension><Dimension id="contactType">${facet.contactType}</Dimension></ext:Facet>`
					);
					break;
				case 'globalMedicalFile':
					this.facetsList.push(`<ext:Facet id="urn:be:cin:nippin:globalMedicalFile"/>`);
					break;
				case 'chronicCondition':
					this.facetsList.push(`<ext:Facet id="urn:be:cin:nippin:chronicCondition"/>`);
					break;
				case 'palliativeStatus':
					this.facetsList.push(`<ext:Facet id="urn:be:cin:nippin:palliativeStatus"/>`);
					break;
				default:
					break;
			}
		}
		this.xmlString = `<samlp:Extensions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ext:ExtensionsType">${this.facetsList.join('')}</samlp:Extensions>`;
	}
}

export class NameId {
	constructor({ ssin, mut_code, reg }) {
		this.ssin = ssin;
		this.mut_code = mut_code;
		this.reg = reg;
	}
	to_xml() {
		if (this.ssin && this.mut_code) {
			return `<saml:NameID Format="urn:be:cin:nippin:member:ssin@mut">${this.ssin}@${this.mut_code}</saml:NameID>`;
		} else if (this.ssin) {
			return `<saml:NameID Format="urn:be:fgov:person:ssin">${this.ssin}</saml:NameID>`;
		} else if (this.reg && this.mut_code) {
			return `<saml:NameID Format="urn:be:cin:nippin:careReceiver:registrationNumber@mut">${this.reg}@${this.mut_code}</saml:NameID>`;
		}
	}
}

class SubjectElement {
	/**
	 *
	 * @param {{ query: { ssin: string, mut_code: string, reg: string, not_before: string, not_on_or_after: string } }} param0
	 */
	constructor({ query }) {
		this.query = query;
		const name_id_element = new NameId(query);
		this.xmlString = `<saml:Subject xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${name_id_element.to_xml()}<saml:SubjectConfirmation Method="urn:be:cin:nippin:memberIdentification"><saml:SubjectConfirmationData NotBefore="${query.not_before}" NotOnOrAfter="${query.not_on_or_after}"></saml:SubjectConfirmationData></saml:SubjectConfirmation></saml:Subject>`;
	}
}

class IssuerElement {
	constructor({ issuer_fmt, issuer_val }) {
		this.issuer_fmt = issuer_fmt;
		this.issuer_val = issuer_val;
		this.xmlString = `<saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Format="${
			issuer_fmt == 'Nihii11'
				? 'urn:be:cin:nippin:nihii11'
				: 'urn:be:fgov:kbo-bce:organization:cbe-number'
		}">${issuer_val}</saml:Issuer>`;
	}
}
