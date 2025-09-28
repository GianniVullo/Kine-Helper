<script>
	import { appState } from '../../../managers/AppState.svelte';
	import { RSTScenario, Scenario, MemberDataConsult1 } from './ScenariosReactivity.svelte.js';
	let { feedbackController } = $props();

	/**
	 * @type {Scenario[]}
	 */
	let scenarios = $state([
		new RSTScenario(feedbackController),
		new MemberDataConsult1(feedbackController)
	]);
</script>

<button
	onclick={async () => {
		const resp = await scenarios[1].handler;
		console.log('In button with resp = ', resp);
		await resp.createEnveloppe();
		await feedbackController.db.execute(
			'INSERT INTO requests (id, endpoint, soapAction, xml_string, created_at) VALUES (?, ?, ?, ?, ?)',
			[
				resp.id ?? crypto.randomUUID(),
				resp.endpoint,
				resp.soapAction,
				resp.enveloppe,
				new Date().toISOString()
			]
		);
	}}>Run First Scenario</button>

<div class="flex flex-col items-start justify-start space-y-5 pt-20">
	{#each scenarios as test}
		<div class="test-item" style="--status-color: {test.statusColor}">
			<div class="test-header">
				<button
					onclick={async () => {
						const resp = await test.handler.perform();
						console.log('In test button with rep = ', resp);
					}}
					disabled={test.status === 'running'}
					class="test-button"
					class:disabled={test.status === 'running'}>
					<span class="status-icon">{test.statusIcon}</span>
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
							{#if test.result.response}
								<div class="response-meta">
									<div class="detail-row">
										<span class="label">Status Code:</span>
										<span class="status-code">{test.result.response.statusCode}</span>
									</div>
								</div>
							{/if}
							{#if test.result.xml_content}
								<div class="detail-row">
									<span class="label">XML Content:</span>
									<pre><code>{test.result.xml_content}</code></pre>
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
