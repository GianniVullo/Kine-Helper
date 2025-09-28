import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { SAMLToken } from './SAMLToken.js';
export function gen_uuids(count) {
	const uuids = [];
	for (let i = 0; i < count; i++) {
		uuids.push(crypto.randomUUID());
	}
	return uuids;
}

export function createEnveloppe(header, body) {
	return `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">${header}${body}</SOAP-ENV:Envelope>`;
}

export function samlTokenExtractor(samlResponse) {
	console.log(samlResponse);
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(samlResponse, 'text/xml');
	const samlTokenDoc = xmlDoc.getElementsByTagName('Assertion')[0];
	if (!samlTokenDoc) {
		throw new Error('No SAML token found in the response');
	}
	let not_on_or_after = samlTokenDoc
		.getElementsByTagName('Conditions')[0]
		.getAttribute('NotOnOrAfter');

	let samlToken = new XMLSerializer().serializeToString(samlTokenDoc);
	return new SAMLToken({ raw_assertion_xml: samlToken, not_on_or_after });
}
