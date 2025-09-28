import { invoke } from '@tauri-apps/api/core';
import { SOAPService } from '../SOAPService';
import { gen_uuids } from '../utils';
import { SecurityElement } from '../soapHeader';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { info } from '../../logging';

export class RequestSecurityToken extends SOAPService {
	endpoint = 'https://services-acpt.ehealth.fgov.be/IAM/SecurityTokenService/v1';
	headers = {
		'Content-Type': 'text/xml; charset=utf-8',
		SOAPAction: 'urn:be:fgov:ehealth:sts:protocol:v1:RequestSecurityToken'
	};

	constructor({ onCreateEnveloppe, onResponse, certificate, pin, ssin }) {
		super({ onCreateEnveloppe, onResponse, certificate, pin });
		this.ssin = ssin;
	}

	async createEnveloppe() {
		/**----------------------------------
		 ** Définition des matières premières
		 * ----------------------------------
		 */
		this.certificate = await invoke('get_b64_certificate');
		const [body_uuid, context_uuid] = gen_uuids(2);
		/**
		 * --------------------
		 ** Définition du Body
		 * --------------------
		 */
		info(
			'------------------------------\nGenerating SOAP Header and Body\n------------------------------\n'
		);
		const body = new STSBodyElement({
			body_uuid,
			context_uuid,
			ssin: this.ssin,
			e_health_certificate: this.certificate
		});
		info('Body:', body);
		const header = await this.wssecHeader({ hasBST: true, body });
		info('STSEnveloppe done\n------------------------------');
		this.enveloppe = this.enveloppeWrapper(header.xmlString, body.xmlString);
	}
}

class STSBodyElement extends SecurityElement {
	constructor({ body_uuid, context_uuid, ssin, e_health_certificate } = {}) {
		super();
		dayjs.extend(utc);
		dayjs.extend(timezone);
		const validity_format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
		const now = dayjs.tz(Date.now(), 'Europe/Brussels');
		this.validity_start = now.format(validity_format);
		this.validity_end = now.add(1, 'day').format(validity_format);

		this.uuid = body_uuid;
		this.canonicalized = `<SOAP-ENV:Body xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${body_uuid}"><wst:RequestSecurityToken xmlns:wst="http://docs.oasis-open.org/ws-sx/ws-trust/200512" Context="${context_uuid}"><wst:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV1.1</wst:TokenType><wst:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</wst:RequestType><wst:Claims Dialect="http://docs.oasis-open.org/wsfed/authorization/200706/authclaims"><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:ehealth:1.0:certificateholder:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:person:ssin:ehealth:1.0:nihii:physiotherapist:nihii11"></auth:ClaimType><auth:ClaimType xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" Uri="urn:be:fgov:person:ssin:ehealth:1.0:professional:physiotherapist:boolean"></auth:ClaimType></wst:Claims><wst:Lifetime><wsu:Created>${this.validity_start}</wsu:Created><wsu:Expires>${this.validity_end}</wsu:Expires></wst:Lifetime><wst:KeyType>http://docs.oasis-open.org/ws-sx/wstrust/200512/PublicKey</wst:KeyType><wst:UseKey><wsse:SecurityTokenReference xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><ds:X509Data xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:X509Certificate>${e_health_certificate}</ds:X509Certificate></ds:X509Data></wsse:SecurityTokenReference></wst:UseKey></wst:RequestSecurityToken></SOAP-ENV:Body>`;
		this.xmlString = `<SOAP-ENV:Body xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${body_uuid}"><wst:RequestSecurityToken xmlns:wst="http://docs.oasis-open.org/ws-sx/ws-trust/200512" xmlns:auth="http://docs.oasis-open.org/wsfed/authorization/200706" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" Context="${context_uuid}"><wst:TokenType>http://docs.oasis-open.org/wss/oasis-wss-saml-token-profile-1.1#SAMLV1.1</wst:TokenType><wst:RequestType>http://docs.oasis-open.org/ws-sx/ws-trust/200512/Issue</wst:RequestType><wst:Claims Dialect="http://docs.oasis-open.org/wsfed/authorization/200706/authclaims"><auth:ClaimType Uri="urn:be:fgov:ehealth:1.0:certificateholder:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType Uri="urn:be:fgov:person:ssin"><auth:Value>${ssin}</auth:Value></auth:ClaimType><auth:ClaimType Uri="urn:be:fgov:person:ssin:ehealth:1.0:nihii:physiotherapist:nihii11"/><auth:ClaimType Uri="urn:be:fgov:person:ssin:ehealth:1.0:professional:physiotherapist:boolean"/></wst:Claims><wst:Lifetime><wsu:Created>${this.validity_start}</wsu:Created><wsu:Expires>${this.validity_end}</wsu:Expires></wst:Lifetime><wst:KeyType>http://docs.oasis-open.org/ws-sx/wstrust/200512/PublicKey</wst:KeyType><wst:UseKey><wsse:SecurityTokenReference><ds:X509Data><ds:X509Certificate>${e_health_certificate}</ds:X509Certificate></ds:X509Data></wsse:SecurityTokenReference></wst:UseKey></wst:RequestSecurityToken></SOAP-ENV:Body>`;
	}
}
