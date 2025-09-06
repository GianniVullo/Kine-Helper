<script>
	import { t } from '../../../i18n';
	import { RichTextEditorSetup } from './RichText.svelte.js';
	import './rtecss.css';

	let rTE = new RichTextEditorSetup({});
	function formatLastSaved(date) {
		if (!date) return '';

		const now = new Date();
		const diff = Math.floor((now - date) / 1000);

		if (diff < 60) return $t('richTextEditor', 'saveStatus.justSaved', {}, 'Just saved');
		if (diff < 3600)
			return $t(
				'richTextEditor',
				'saveStatus.minutesAgo',
				{ minutes: Math.floor(diff / 60) },
				`Saved ${Math.floor(diff / 60)} minutes ago`
			);
		if (diff < 86400)
			return $t(
				'richTextEditor',
				'saveStatus.hoursAgo',
				{ hours: Math.floor(diff / 3600) },
				`Saved ${Math.floor(diff / 3600)} hours ago`
			);
		return $t(
			'richTextEditor',
			'saveStatus.savedOn',
			{ date: date.toLocaleDateString() },
			`Saved on ${date.toLocaleDateString()}`
		);
	}
</script>

<div class="editor-wrapper">
	<div class="editor-header">
		<div class="editor-title">
			<h2>{$t('richTextEditor', 'title', {}, 'Patient Report')}</h2>
			{#if rTE.lastSaved}
				<span class="save-status">{formatLastSaved(rTE.lastSaved)}</span>
			{/if}
		</div>
		<div class="editor-actions">
			<button onclick={rTE.clearEditor} class="btn btn-secondary" disabled={rTE.editor?.readOnly}>
				{$t('richTextEditor', 'buttons.clear', {}, 'Clear')}
			</button>
			<button
				onclick={rTE.saveReport}
				class="btn btn-primary"
				disabled={rTE.isSaving || rTE.editor?.readOnly}>
				{rTE.isSaving
					? $t('richTextEditor', 'buttons.saving', {}, 'Saving...')
					: $t('richTextEditor', 'buttons.saveReport', {}, 'Save Report')}
			</button>
		</div>
	</div>

	<div class="editor-container" bind:this={rTE.editorHolder}></div>

	<div class="editor-footer">
		<div class="editor-tips">
			<span class="tip-label">{$t('richTextEditor', 'tips.label', {}, 'Tips:')}</span>
			<span class="tip"
				>{@html $t(
					'richTextEditor',
					'tips.tabForBlocks',
					{},
					'Press <kbd>Tab</kbd> to see available blocks'
				)}</span>
			<span class="tip"
				>{@html $t(
					'richTextEditor',
					'tips.slashForCommands',
					{},
					'Use <kbd>/</kbd> for quick commands'
				)}</span>
		</div>
	</div>
</div>
