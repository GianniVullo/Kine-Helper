import { dev } from '$app/environment';
import dayjs from 'dayjs';
import { appState } from '../../../../../managers/AppState.svelte';
import { SecurityElement } from '../../soapHeader';
import { unescape } from 'lodash';

/**
 * @typedef {object} Facet
 * @property {'insurability' | 'globalMedicalFile' | 'chronicCondition' | 'palliativeStatus'} type
 * @property {'information' | 'invoicing'} requestType
 * @property {'other' | 'hospitalized'} contactType
 */
/**
 * @typedef {Object} AttributeQuery
 * @property {string | null} ssin
 * @property {string | null} mut_code
 * @property {string | null} reg
 * @property {string} not_before
 * @property {string} not_on_or_after
 * @property {'Nihii11' | 'CbeOrganization'} issuer_fmt
 * @property {string} issuer_val
 * @property {Facet[]} facets
 */

export class BodyElement extends SecurityElement {
	/**
	 *
	 * @param {object} param0
	 * @param {string} param0.request_uuid
	 * @param {string} param0.issueInstant
	 * @param {boolean} param0.isTest
	 * @param {string} param0.attribute_query_id
	 * @param {string} param0.mut
	 * @param {string} param0.careReceiverSSIN
	 * @param {AttributeQuery} param0.query
	 */
	constructor({
		request_uuid,
		issueInstant,
		isTest = true,
		attribute_query_id,
		mut,
		careReceiverSSIN,
		query
	}) {
		//* <mcp:CommonInput>
		this.commonInputElement = new CommonInputElement({
			packageName,
			licence_user,
			licence_pass,
			attribute_query_id: this.attribute_query_id,
			isTest
		});

		//* <mcp:Routing> (optional if there is a mutuality referenced I guess)
		this.routingElement = new RoutingElement({ ssin: careReceiverSSIN, mut });

		//* <mcp:Detail>
		this.detailElement = new DetailElement({ attribute_query_id, query });

		//? Optionnel? <mcp:Xades> I don't know what this is about...

		//* <mcn:MemberDataConsultationRequest> (Top level element)
		this.canonicalized = `<soap-env:Body xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/"><ns0:MemberDataConsultationRequest xmlns:ns0="urn:be:fgov:ehealth:mycarenet:memberdata:protocol:v1" Id="${request_uuid}" IssueInstant="${issueInstant}">${this.commonInputElement.canonicalized}${this.routingElement.canonicalized}${this.detailElement.canonicalized}}</ns0:MemberDataConsultationRequest></soap-env:Body>`;
	}
}

/**
 * @description Top level tag
 * @prop {string} xmlString - The XML string representation of the element.
 * @prop {CommonInputElement} commonInput - The CommonInput element.
 * @prop {RoutingElement} routing - The Routing element.
 * @prop {DetailElement} detail - The Detail element.
 * @prop {XadesElement} xades - The Xades element.
 */
class MemberDataConsultationRequestElement {
	constructor({ commonInput, routing, detail, xades }) {
		//* <mcn:MemberDataConsultationRequest>
		this.xmlString = `<mcn:MemberDataConsultationRequest></mcn:MemberDataConsultationRequest>`;
	}
}

/**
 * @description CommonInput = ensemble des informations nécessaires à la requête
 */
class CommonInputElement {
	constructor({ isTest = dev, attribute_query_id }) {
		this.attribute_query_id = attribute_query_id;
		this.license = {
			username: 'kinkinehelper',
			password: '2wj7wl1Et'
		};
		this.canonicalized = `<ns1:CommonInput xmlns:ns1="urn:be:fgov:ehealth:mycarenet:commons:protocol:v3"><ns2:Request xmlns:ns2="urn:be:fgov:ehealth:mycarenet:commons:core:v3"><ns2:IsTest>${isTest}</ns2:IsTest></ns2:Request><ns3:Origin xmlns:ns3="urn:be:fgov:ehealth:mycarenet:commons:core:v3"><ns3:Package><ns3:License><ns3:Username>${this.license.username}</ns3:Username><ns3:Password>${this.license.password}</ns3:Password></ns3:License></ns3:Package></ns3:Origin><ns4:InputReference xmlns:ns4="urn:be:fgov:ehealth:mycarenet:commons:core:v3">${this.attribute_query_id}</ns4:InputReference></ns1:CommonInput>`;
	}
}

/**
 * @description j'imagine que ça sert à cibler une mutualité en particulier
 */
class RoutingElement {
	constructor({ ssin, mut }) {
		//* <mcp:Routing>
		//* <mc:CareReceiver>
		const today = dayjs().format('YYYY-MM-DD');
		if (mut) {
			this.canonicalizedCareReceiver = `<ns6:CareReceiver xmlns:ns6="urn:be:fgov:ehealth:mycarenet:commons:core:v3"><ns6:RegNrWithMut>${ssin}@${mut}</ns6:RegNrWithMut><ns6:Mutuality>${mut}</ns6:Mutuality></ns6:CareReceiver>`;
		} else {
			this.canonicalizedCareReceiver = `<ns6:CareReceiver xmlns:ns6="urn:be:fgov:ehealth:mycarenet:commons:core:v3"><ns6:Ssin>${ssin}</ns6:Ssin></ns6:CareReceiver>`;
		}
		this.canonicalized = `<ns5:Routing xmlns:ns5="urn:be:fgov:ehealth:mycarenet:commons:protocol:v3">${this.canonicalizedCareReceiver}<ns7:ReferenceDate xmlns:ns7="urn:be:fgov:ehealth:mycarenet:commons:core:v3">${today}</ns7:ReferenceDate></ns5:Routing>`;
	}
}

/**
 * @description Detail = BlobType : base64(AttributeQuery.xml), avec méta obligatoires
 */
class DetailElement {
	constructor({ attribute_query_id, query }) {
		//* <mcp:Detail>
		this.attributeQueryElement = new this.attributeQueryElement({ attribute_query_id, query });
		const b64AQ = btoa(unescape(encodeURIComponent(this.attributeQueryElement.xmlString)));
		this.canonicalized = `<ns8:Detail xmlns:ns8="urn:be:fgov:ehealth:mycarenet:commons:protocol:v3" ContentEncoding="none" ContentType="text/xml">${b64AQ}</ns8:Detail>`;
	}
}

/**
 * @description Optionnel je ne sais pas à quoi ça sert
 */
class XadesElement {
	constructor() {
		//? Optionnel? <mcp:Xades>
	}
}

class AttributeQueryElement {
	/**
	 * @param {Object} param0
	 * @param {string} param0.attribute_query_id
	 * @param {AttributeQuery} param0.query
	 */
	constructor({ attribute_query_id, query }) {
		this.attribute_query_id = attribute_query_id;
		this.extensionElement = new ExtensionElement({ facets: query.facets || [] });
		this.issuerElement = new IssuerElement({
			issuer_fmt: query.issuer_fmt,
			issuer_val: query.issuer_val
		});
		this.subjectElement = new SubjectElement({ query });
		this.xmlString = `<samlp:AttributeQuery xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:ext="urn:be:cin:nippin:memberdata:samlext" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ID="_b918f174638946c3ad19a5c7bb8dbcd6" IssueInstant="2025-09-04T11:59:10Z" Version="2.0">${this.issuerElement.xmlString}${this.extensionElement.xmlString}${this.subjectElement.xmlString}</samlp:AttributeQuery>`;
	}
}

class ExtensionElement {
	/**
	 * @param {Object} param0
	 * @param {Facet[]} param0.facets
	 */
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
	 * @param {{ ssin: string, mut_code: string, reg: string, not_before: string, not_on_or_after: string } } param0
	 */
	constructor({ not_before, not_on_or_after, ssin, mut_code, reg }) {
		this.not_before = not_before;
		this.not_on_or_after = not_on_or_after;
		const name_id_element = new NameId({ ssin, mut_code, reg });
		this.xmlString = `<saml:Subject xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${name_id_element.to_xml()}<saml:SubjectConfirmation Method="urn:be:cin:nippin:memberIdentification"><saml:SubjectConfirmationData NotBefore="${this.not_before}" NotOnOrAfter="${this.not_on_or_after}"></saml:SubjectConfirmationData></saml:SubjectConfirmation></saml:Subject>`;
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
