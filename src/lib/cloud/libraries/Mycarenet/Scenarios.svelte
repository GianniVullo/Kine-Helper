<script>
	import dayjs from 'dayjs';
	import timezone from 'dayjs/plugin/timezone.js';
	import utc from 'dayjs/plugin/utc.js';
	import { MemberDataConsultation } from './index.svelte';
	import { RequestSecurityToken } from './ws/RequestSecurityToken';
	import { appState } from '../../../managers/AppState.svelte';
	import { samlTokenExtractor } from './utils';

	dayjs.extend(utc);
	dayjs.extend(timezone);

	let { feedbackController } = $props();
	const pin = '9137';
	// Test configuration
	const tests = $state([
		{
			id: 'request_security_token',
			name: 'Request Security Token (STS)',
			handler: new RequestSecurityToken({
				pin,
				ssin: '91060827778',
				async onCreateEnveloppe(enveloppe) {
					console.log('Enveloppe created:', enveloppe);
					feedbackController.request = {
						id: 'stsToken7',
						endpoint: this.endpoint,
						headers: JSON.stringify(this.sts_headers),
						xml_string: enveloppe,
						created_at: new Date().toISOString(),
						metadata: { scenario: 'Get SAML Token' }
					};
				},
				async onResponse(response, xml_content) {
					console.log('Response received:', response, xml_content);
					feedbackController.response = {
						id: 'stsToken7',
						endpoint: this.endpoint,
						headers: JSON.stringify(Object.fromEntries(response.headers)),
						status: response.status,
						xml_string: xml_content,
						created_at: new Date().toISOString(),
						metadata: { scenario: 'Get SAML Token' }
					};
					const saml_token = samlTokenExtractor(xml_content);

					appState.set_eHealth({
						ssin: this.ssin,
						certificate: this.certificate,
						saml_token
					});
				}
			}),
			status: 'pending', // pending, running, success, error
			args: {
				ssin: '91060827778'
			},
			result: null,
			expanded: false
		},
		{
			id: 'member_data_consultation',
			name: 'Member Data Consultation',
			handler: new MemberDataConsultation({
				pin,
				query: {
					ssin: '58121520763',
					not_before: dayjs.tz(dayjs().subtract(1, 'day'), 'Europe/Brussels').format(),
					not_on_or_after: dayjs.tz(dayjs().add(1, 'day'), 'Europe/Brussels').format(),
					issuer_fmt: 'Nihii11',
					issuer_val: '54403736527',
					facets: [{ type: 'insurability', requestType: 'information', contactType: 'other' }]
				}
			}),
			status: 'pending',
			result: null,
			expanded: false,
			requiresPrevious: 'request_security_token' // Depends on STS token
		}
	]);

	// Get status icon
	function getStatusIcon(status) {
		switch (status) {
			case 'pending':
				return '⏸';
			case 'running':
				return '⏳';
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			default:
				return '❓';
		}
	}

	// Get status color
	function getStatusColor(status) {
		switch (status) {
			case 'pending':
				return '#6b7280';
			case 'running':
				return '#3b82f6';
			case 'success':
				return '#10b981';
			case 'error':
				return '#ef4444';
			default:
				return '#6b7280';
		}
	}
</script>

<div class="flex flex-col items-start justify-start space-y-5 pt-20">
	{#each tests as test}
		<div class="test-item" style="--status-color: {getStatusColor(test.status)}">
			<div class="test-header">
				<button
					onclick={async () => {
						const resp = await test.handler.perform(test.args);
						console.log('In test button with rep = ', resp);
					}}
					disabled={test.status === 'running'}
					class="test-button"
					class:disabled={test.status === 'running'}>
					<span class="status-icon">{getStatusIcon(test.status)}</span>
					<span class="test-name">{test.name}</span>
				</button>

				{#if test.result}
					<details
						open={test.expanded}
						ontoggle={(e) => (test.expanded = e.target.open)}
						class="test-details">
						<summary class="test-summary" class:error={test.status === 'error'}>
							<span class="summary-text">
								{test.status === 'success' ? 'Success' : 'Error'}
								{#if test.result.duration}
									({test.result.duration}ms)
								{/if}
							</span>
						</summary>

						<div class="details-content">
							{#if test.status === 'error'}
								<div class="error-message">
									{test.result.error || 'An error occurred'}
								</div>
							{:else}
								<div class="success-content">
									{#if test.id === 'request_security_token'}
										<div class="detail-row">
											<span class="label">Token:</span>
											<code>{test.result.token}</code>
										</div>
										<div class="detail-row">
											<span class="label">Assertion ID:</span>
											<code>{test.result.assertionId}</code>
										</div>
										<div class="detail-row">
											<span class="label">Valid Until:</span>
											<span>{new Date(test.result.validUntil).toLocaleString()}</span>
										</div>
									{:else if test.id === 'member_data_consultation'}
										<div class="detail-row">
											<span class="label">CT1/CT2:</span>
											<span
												>{test.result.data.insurability.ct1}/{test.result.data.insurability
													.ct2}</span>
										</div>
										<div class="detail-row">
											<span class="label">Mutuality:</span>
											<span>{test.result.data.insurability.mutuality}</span>
										</div>
										{#if test.result.data.globalMedicalFile}
											<div class="detail-row">
												<span class="label">GMF Holder:</span>
												<span>{test.result.data.globalMedicalFile.holder}</span>
											</div>
										{/if}
									{/if}

									<div class="detail-row">
										<span class="label">Timestamp:</span>
										<span>{new Date(test.result.timestamp).toLocaleTimeString()}</span>
									</div>
								</div>
							{/if}

							{#if test.result.response}
								<div class="response-meta">
									<div class="detail-row">
										<span class="label">Status Code:</span>
										<span class="status-code">{test.result.response.statusCode}</span>
									</div>
								</div>
							{/if}
						</div>
					</details>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.test-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30px;
		padding-bottom: 20px;
		border-bottom: 2px solid #e5e7eb;
	}

	.header h2 {
		margin: 0;
		color: #1f2937;
	}

	.actions {
		display: flex;
		gap: 10px;
	}

	.btn-primary,
	.btn-secondary {
		padding: 8px 16px;
		border-radius: 6px;
		border: none;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover {
		background: #2563eb;
	}

	.btn-secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-secondary:hover {
		background: #e5e7eb;
	}

	.test-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.test-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		border-left: 4px solid var(--status-color);
	}

	.test-header {
		display: flex;
		align-items: stretch;
		min-height: 50px;
	}

	.test-button {
		flex: 0 0 300px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: white;
		border: none;
		cursor: pointer;
		font-size: 15px;
		font-weight: 500;
		color: #1f2937;
		transition: background 0.2s;
	}

	.test-button:hover:not(.disabled) {
		background: #f9fafb;
	}

	.test-button.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.status-icon {
		font-size: 18px;
	}

	.test-details {
		flex: 1;
		border-left: 1px solid #e5e7eb;
	}

	.test-summary {
		padding: 12px 16px;
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		background: #f9fafb;
		min-height: 50px;
	}

	.test-summary:hover {
		background: #f3f4f6;
	}

	.test-summary.error {
		background: #fef2f2;
	}

	.test-summary.error:hover {
		background: #fee2e2;
	}

	.test-summary::marker {
		content: '';
	}

	.test-summary::before {
		content: '▶';
		margin-right: 8px;
		transition: transform 0.2s;
		display: inline-block;
	}

	details[open] .test-summary::before {
		transform: rotate(90deg);
	}

	.summary-text {
		font-size: 14px;
		font-weight: 500;
	}

	.details-content {
		padding: 16px;
		background: white;
		font-size: 14px;
	}

	.error-message {
		color: #dc2626;
		padding: 8px 12px;
		background: #fef2f2;
		border-radius: 4px;
	}

	.detail-row {
		display: flex;
		padding: 8px 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.label {
		flex: 0 0 140px;
		font-weight: 500;
		color: #6b7280;
	}

	code {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 12px;
		background: #f3f4f6;
		padding: 2px 6px;
		border-radius: 3px;
	}

	.status-code {
		font-weight: 600;
		color: #10b981;
	}

	.response-meta {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid #e5e7eb;
	}
</style>
