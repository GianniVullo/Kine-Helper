import { SOAPService } from "../SOAPService";

export class GetETK extends SOAPService {
    constructor(parameters) {
        super(parameters);
        // Set the endpoint based on environment
        this.endpoint = parameters.environment === 'production' 
            ? 'https://services.ehealth.fgov.be/etee/v1/ETKDepot'
            : 'https://services-acpt.ehealth.fgov.be/etee/v1/ETKDepot';
        
        // Set SOAP headers
        this.headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': '' // Empty as per WSDL
        };
        
        // Store search criteria
        this.searchCriteria = parameters.searchCriteria || {
            type: 'CBE',
            value: '0820563481',
            applicationId: 'MYCARENET'
        };
    }

    async createEnveloppe() {
        // Create the SOAP body with GetEtkRequest
        const body = await this.createBody();
        
        // Create WS-Security header with SAML token
        const header = await this.wssecHeader({ 
            hasBST: false, // Using SAML token
            body: body 
        });
        
        // Wrap in SOAP envelope
        this.enveloppe = this.enveloppeWrapper(header.xmlString, body.xmlString);
    }

    async createBody() {
        const bodyId = crypto.randomUUID();
        
        const bodyContent = `<etkdepot:GetEtkRequest xmlns:etkdepot="urn:be:fgov:ehealth:etkdepot:1_0:protocol">
            <etkdepot:SearchCriteria>
                <etkdepot:Identifier>
                    <etkdepot:Type>${this.escapeXml(this.searchCriteria.type)}</etkdepot:Type>
                    <etkdepot:Value>${this.escapeXml(this.searchCriteria.value)}</etkdepot:Value>
                    <etkdepot:ApplicationID>${this.escapeXml(this.searchCriteria.applicationId)}</etkdepot:ApplicationID>
                </etkdepot:Identifier>
            </etkdepot:SearchCriteria>
        </etkdepot:GetEtkRequest>`;
        
        return {
            uuid: bodyId,
            xmlString: `<SOAP-ENV:Body xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${bodyId}">${bodyContent}</SOAP-ENV:Body>`,
            // Method to calculate hash for signature
            hash: async function() {
                // This should canonicalize and hash the body
                // You'll need to implement or call your existing hash function
                const canonicalized = `<SOAP-ENV:Body xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="id-${bodyId}">${bodyContent}</SOAP-ENV:Body>`;
                // Call your existing invoke function for hashing
                return await invoke('sha256_hash_bytes', { data: canonicalized });
            }
        };
    }

    // Helper method to escape XML special characters
    escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }

    // Override or extend the response handler to parse ETK response
    async handleResponse(response, text) {
        // Parse the SOAP response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        // Check for SOAP faults
        const faultElement = xmlDoc.getElementsByTagName("Fault")[0];
        if (faultElement) {
            const faultCode = faultElement.getElementsByTagName("faultcode")[0]?.textContent;
            const faultString = faultElement.getElementsByTagName("faultstring")[0]?.textContent;
            const systemError = xmlDoc.getElementsByTagName("SystemError")[0];
            
            if (systemError) {
                const errorCode = systemError.getElementsByTagName("Code")[0]?.textContent;
                const errorMessage = systemError.getElementsByTagName("Message")[0]?.textContent;
                throw new Error(`ETK Depot System Error: ${errorCode} - ${errorMessage}`);
            }
            
            throw new Error(`SOAP Fault: ${faultCode} - ${faultString}`);
        }
        
        // Extract the ETK from the response
        const etkResponse = xmlDoc.getElementsByTagName("GetEtkResponse")[0];
        if (!etkResponse) {
            throw new Error("No GetEtkResponse found in SOAP response");
        }
        
        // Check for errors in the response
        const errorElements = etkResponse.getElementsByTagName("Error");
        if (errorElements.length > 0) {
            const errors = [];
            for (let i = 0; i < errorElements.length; i++) {
                const code = errorElements[i].getElementsByTagName("Code")[0]?.textContent;
                const message = errorElements[i].getElementsByTagName("Message")[0]?.textContent;
                errors.push(`${code}: ${message}`);
            }
            throw new Error(`ETK Depot returned errors: ${errors.join(", ")}`);
        }
        
        // Extract the ETK certificate
        const etkElement = etkResponse.getElementsByTagName("ETK")[0];
        if (!etkElement) {
            // Check for MatchingEtk elements (multiple matches)
            const matchingEtks = etkResponse.getElementsByTagName("MatchingEtk");
            if (matchingEtks.length > 0) {
                throw new Error(`Multiple ETKs found (${matchingEtks.length}). Please refine your search criteria.`);
            }
            throw new Error("No ETK found in response");
        }
        
        const etkBase64 = etkElement.textContent;
        
        // Return the ETK certificate and metadata
        return {
            etk: etkBase64,
            searchCriteria: {
                type: this.searchCriteria.type,
                value: this.searchCriteria.value,
                applicationId: this.searchCriteria.applicationId
            },
            timestamp: new Date().toISOString()
        };
    }

    // Override the perform method to handle the response
    async perform() {
        console.log('Fetching ETK from depot...');
        console.log('Search criteria:', this.searchCriteria);
        
        // Generate envelope
        await this.createEnveloppe();
        
        if (this.onCreateEnveloppe) {
            await this.onCreateEnveloppe(this.enveloppe);
        }
        
        console.log('Sending GetETK request to:', this.endpoint);
        
        // Send the request
        const response = await fetch(this.endpoint, {
            method: 'POST',
            body: this.enveloppe,
            headers: this.headers
        });
        
        const text = await response.text();
        
        // Parse and handle the response
        const etkData = await this.handleResponse(response, text);
        
        if (this.onResponse) {
            await this.onResponse(response, text, etkData);
        }
        
        return etkData;
    }
}

// Usage example:
/*
const etkService = new GetETK({
    samlToken: samlToken, // Your SAML token from STS
    certificate: certificate, // Your eHealth certificate
    pin: pin, // Your PIN for signing
    environment: 'acceptance', // or 'production'
    searchCriteria: {
        type: 'CBE',
        value: '0820563481',
        applicationId: 'MYCARENET'
    },
    onCreateEnveloppe: async (envelope) => {
        console.log('Created envelope:', envelope);
    },
    onResponse: async (response, text, etkData) => {
        console.log('Received ETK:', etkData);
        // Cache the ETK for later use
        localStorage.setItem('mycarenet_etk', JSON.stringify(etkData));
    }
});

try {
    const etkData = await etkService.perform();
    console.log('Successfully retrieved ETK:', etkData.etk);
} catch (error) {
    console.error('Error fetching ETK:', error);
}
*/