import Database from '@tauri-apps/plugin-sql';
import { terminal } from 'virtual:terminal';

export class MycarenetHistory {
	request = $state();
	response = $state();

	async init() {
		this.db = await Database.load('sqlite:mycarenet.db');
		await this.db.execute(`CREATE TABLE IF NOT EXISTS requests (
    id   TEXT PRIMARY KEY NOT NULL,
    endpoint        TEXT NOT NULL,
    soapAction      TEXT,
    xml_string      TEXT NOT NULL,
    created_at      TEXT NOT NULL);`);
		await this.db.execute(`CREATE TABLE IF NOT EXISTS responses (
    id   TEXT PRIMARY KEY NOT NULL,
    endpoint        TEXT NOT NULL,
    headers         TEXT,
    status          INTEGER,
    xml_string      TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT '2023-06-01');`);
		try {
			await this.db.execute('ALTER TABLE requests ADD COLUMN headers TEXT;');
			await this.db.execute('ALTER TABLE responses ADD COLUMN metadata TEXT;');
			await this.db.execute('ALTER TABLE requests ADD COLUMN metadata TEXT;');
		} catch (error) {
			terminal.error(error);
		}
	}

	constructor() {
		$effect(() => {
			this.request;
			if (this.request && this.request.id) {
				try {
					this.db.execute(
						'INSERT INTO requests (id, endpoint, soapAction, xml_string, created_at) VALUES (?, ?, ?, ?, ?)',
						[
							this.request.id,
							this.request.endpoint,
							this.request.soapAction,
							this.request.xml_string,
							this.request.created_at
						]
					);
				} catch (error) {
					terminal.error(error);
				}
			}
		});
		$effect(() => {
			this.response;
			if (this.response && this.response.id) {
				try {
					this.db.execute(
						'INSERT INTO responses (id, endpoint, headers, status, xml_string, created_at) VALUES (?, ?, ?, ?, ?, ?)',
						[
							this.response.id,
							this.response.endpoint,
							this.response.headers,
							this.response.status,
							this.response.xml_string,
							this.response.created_at
						]
					);
				} catch (error) {
					terminal.error(error);
				}
			}
		});
	}

	/**
	 * Prettifies the tab indentation of given XML string
	 *
	 * @param xml string - The XML to clean
	 * @return string - Prettified XML string
	 */
	prettify(which) {
		let xml;
		if (which === 'request') xml = this.request.xml_string;
		else if (which === 'response') xml = this.response.xml_string;
		else throw new Error('Invalid argument: must be "request" or "response"');

		// 1) Normalize: remove whitespace between tags, then add line breaks between tags
		xml = xml.replace(/>\s+</g, '><').replace(/(>)(<)(\/*)/g, '$1\n$2$3');

		const lines = xml.split('\n');
		let pad = 0;
		const INDENT = '    '; // 4 spaces

		const isClosing = (l) => /^<\/[^>]+>/.test(l);
		const isSelfClose = (l) => /(^<[^>]+\/>$)|(^<\?.*\?>$)|(^<!.*>$)/.test(l); // <br/>, <?xml?>, <!DOCTYPE...>, <!--...-->
		const isOpening = (l) => /^<([A-Za-z_][\w:.\-]*)(\s[^<>]*)?>$/.test(l) && !isSelfClose(l);

		const out = [];

		for (let raw of lines) {
			const line = raw.trim();

			if (isClosing(line)) pad = Math.max(0, pad - 1);
			out.push(INDENT.repeat(pad) + line);
			if (isOpening(line)) pad += 1;
		}

		// If you will inject with innerHTML and want visible breaks, convert to <br>.
		// If you will inject with textContent (recommended), keep '\n' and style with white-space: pre or pre-wrap.
		return out.join('\n');
	}
	async setLast() {
		const lastRequest = await this.db.select(
			'SELECT * FROM requests ORDER BY created_at DESC LIMIT 1'
		);
		const lastResponse = await this.db.select(
			'SELECT * FROM responses ORDER BY created_at DESC LIMIT 1'
		);
		if (lastRequest.length > 0) {
			this.request = lastRequest[0];
		}
		if (lastResponse.length > 0) {
			this.response = lastResponse[0];
		}
	}

	async requests() {
		return (await this.db.select('SELECT * FROM requests ORDER BY created_at DESC')).map((m) => {
			m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
			return m;
		});
	}
	async responses() {
		return (await this.db.select('SELECT * FROM responses ORDER BY created_at DESC')).map((m) => {
			m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
			return m;
		});
	}
	async setRequestResponseById(id) {
		this.request = (await this.requests()).find((req) => req.id === id);
		this.response = (await this.responses()).find((res) => res.id === id);
	}
}
