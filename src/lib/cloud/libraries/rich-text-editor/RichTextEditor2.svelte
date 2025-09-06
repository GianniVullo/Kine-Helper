<script>
	import { onMount, onDestroy } from 'svelte';
	import { t } from '../../../i18n';
	import EditorJS from '@editorjs/editorjs';
	import Header from '@editorjs/header';
	import List from '@editorjs/list';
	import Checklist from '@editorjs/checklist';
	import Quote from '@editorjs/quote';
	import Warning from '@editorjs/warning';
	import Table from '@editorjs/table';
	import Delimiter from '@editorjs/delimiter';
	import InlineCode from '@editorjs/inline-code';
	import Marker from '@editorjs/marker';
	import Underline from '@editorjs/underline';
	import ColorPicker from 'editorjs-color-picker';
	import TemplateBlock from './TemplateBlock';

	// Translation keys dictionary for reference
	const i18nKeys = {
		richTextEditor: {
			placeholder: 'Commencer à écrire votre rapport patient...',
			title: 'Patient Report',
			header: {
				placeholder: 'Écrivez un titre'
			},
			quote: {
				placeholder: 'Entrez une citation',
				captionPlaceholder: 'Auteur de la citation'
			},
			warning: {
				titlePlaceholder: 'Titre',
				messagePlaceholder: 'Message'
			},
			blockTunes: {
				clickToTune: 'Click to tune',
				orDragToMove: 'or drag to move',
				delete: 'Delete',
				moveUp: 'Move up',
				moveDown: 'Move down'
			},
			inlineToolbar: {
				convertTo: 'Convert to'
			},
			toolbar: {
				add: 'Add block'
			},
			toolNames: {
				text: 'Text',
				heading: 'Heading',
				list: 'List',
				warning: 'Warning',
				checklist: 'Checklist',
				quote: 'Quote',
				delimiter: 'Delimiter',
				table: 'Table',
				bold: 'Bold',
				italic: 'Italic',
				inlineCode: 'Inline Code',
				underline: 'Underline',
				marker: 'Highlight'
			},
			tools: {
				warning: {
					title: 'Title',
					message: 'Message'
				},
				stub: {
					cannotDisplay: 'The block can not be displayed correctly.'
				}
			},
			saveStatus: {
				justSaved: 'Just saved',
				minutesAgo: 'Saved {minutes} minutes ago',
				hoursAgo: 'Saved {hours} hours ago',
				savedOn: 'Saved on {date}'
			},
			buttons: {
				clear: 'Clear',
				saving: 'Saving...',
				saveReport: 'Save Report'
			},
			tips: {
				label: 'Tips:',
				tabForBlocks: 'Press <kbd>Tab</kbd> to see available blocks',
				slashForCommands: 'Use <kbd>/</kbd> for quick commands'
			}
		}
	};

	// Props
	let {
		placeholder = $t(
			'richTextEditor',
			'placeholder',
			{},
			'Commencer à écrire votre rapport patient...'
		),
		autofocus = false,
		minHeight = 300,
		data = { blocks: [] },
		readOnly = false,
		onSave = null,
		onChange = null
	} = $props();

	// State
	let editor = $state(null);
	let editorHolder = $state(null);
	let isSaving = $state(false);
	let lastSaved = $state(null);

	// Initialize EditorJS
	onMount(() => {
		if (!editorHolder) return;

		editor = new EditorJS({
			holder: editorHolder,
			placeholder: placeholder,
			autofocus: autofocus,
			minHeight: minHeight,
			readOnly: readOnly,
			data: data,

			tools: {
				header: {
					class: Header,
					config: {
						placeholder: $t('richTextEditor', 'header.placeholder', {}, 'Écrivez un titre'),
						levels: [1, 2, 3, 4],
						defaultLevel: 2
					},
					shortcut: 'CMD+SHIFT+H'
				},
				list: {
					class: List,
					inlineToolbar: true,
					config: {
						defaultStyle: 'unordered'
					},
					shortcut: 'CMD+SHIFT+L'
				},
				checklist: {
					class: Checklist,
					inlineToolbar: true
				},
				quote: {
					class: Quote,
					inlineToolbar: true,
					config: {
						quotePlaceholder: $t('richTextEditor', 'quote.placeholder', {}, 'Entrez une citation'),
						captionPlaceholder: $t(
							'richTextEditor',
							'quote.captionPlaceholder',
							{},
							'Auteur de la citation'
						)
					},
					shortcut: 'CMD+SHIFT+O'
				},
				warning: {
					class: Warning,
					inlineToolbar: true,
					config: {
						titlePlaceholder: $t('richTextEditor', 'warning.titlePlaceholder', {}, 'Titre'),
						messagePlaceholder: $t('richTextEditor', 'warning.messagePlaceholder', {}, 'Message')
					}
				},
				table: {
					class: Table,
					inlineToolbar: true,
					config: {
						rows: 2,
						cols: 3,
						withHeadings: true
					},
					shortcut: 'CMD+ALT+T'
				},
				delimiter: Delimiter,
				inlineCode: {
					class: InlineCode,
					shortcut: 'CMD+SHIFT+C'
				},
				marker: {
					class: Marker,
					shortcut: 'CMD+SHIFT+M'
				},
				underline: {
					class: Underline,
					shortcut: 'CMD+U'
				},
				ColorPicker: {
					class: ColorPicker
				},
				TemplateBlock: {
					class: TemplateBlock,
					config: {
						templates: {}
					}
				}
			},

			onChange: async (api, event) => {
				if (onChange) {
					const content = await api.saver.save();
					onChange(content);
				}
			},

			i18n: {
				messages: {
					ui: {
						blockTunes: {
							toggler: {
								'Click to tune': $t(
									'richTextEditor',
									'blockTunes.clickToTune',
									{},
									'Click to tune'
								),
								'or drag to move': $t(
									'richTextEditor',
									'blockTunes.orDragToMove',
									{},
									'or drag to move'
								)
							}
						},
						inlineToolbar: {
							converter: {
								'Convert to': $t('richTextEditor', 'inlineToolbar.convertTo', {}, 'Convert to')
							}
						},
						toolbar: {
							toolbox: {
								Add: $t('richTextEditor', 'toolbar.add', {}, 'Add block')
							}
						}
					},

					toolNames: {
						Text: $t('richTextEditor', 'toolNames.text', {}, 'Text'),
						Heading: $t('richTextEditor', 'toolNames.heading', {}, 'Heading'),
						List: $t('richTextEditor', 'toolNames.list', {}, 'List'),
						Warning: $t('richTextEditor', 'toolNames.warning', {}, 'Warning'),
						Checklist: $t('richTextEditor', 'toolNames.checklist', {}, 'Checklist'),
						Quote: $t('richTextEditor', 'toolNames.quote', {}, 'Quote'),
						Delimiter: $t('richTextEditor', 'toolNames.delimiter', {}, 'Delimiter'),
						Table: $t('richTextEditor', 'toolNames.table', {}, 'Table'),
						Bold: $t('richTextEditor', 'toolNames.bold', {}, 'Bold'),
						Italic: $t('richTextEditor', 'toolNames.italic', {}, 'Italic'),
						InlineCode: $t('richTextEditor', 'toolNames.inlineCode', {}, 'Inline Code'),
						Underline: $t('richTextEditor', 'toolNames.underline', {}, 'Underline'),
						Marker: $t('richTextEditor', 'toolNames.marker', {}, 'Highlight')
					},

					tools: {
						warning: {
							Title: $t('richTextEditor', 'tools.warning.title', {}, 'Title'),
							Message: $t('richTextEditor', 'tools.warning.message', {}, 'Message')
						},
						stub: {
							'The block can not be displayed correctly.': $t(
								'richTextEditor',
								'tools.stub.cannotDisplay',
								{},
								'The block can not be displayed correctly.'
							)
						}
					},

					blockTunes: {
						delete: {
							Delete: $t('richTextEditor', 'blockTunes.delete', {}, 'Delete')
						},
						moveUp: {
							'Move up': $t('richTextEditor', 'blockTunes.moveUp', {}, 'Move up')
						},
						moveDown: {
							'Move down': $t('richTextEditor', 'blockTunes.moveDown', {}, 'Move down')
						}
					}
				}
			}
		});
	});

	// Cleanup
	onDestroy(() => {
		if (editor && editor.destroy) {
			editor.destroy();
		}
	});

	// Save function
	async function saveReport() {
		if (!editor) return;

		isSaving = true;
		try {
			const outputData = await editor.save();
			lastSaved = new Date();

			if (onSave) {
				await onSave(outputData);
			}

			return outputData;
		} catch (error) {
			console.error('Saving failed:', error);
			throw error;
		} finally {
			isSaving = false;
		}
	}

	// Clear editor
	async function clearEditor() {
		if (!editor) return;
		await editor.clear();
	}

	// Load new data
	async function loadData(newData) {
		if (!editor) return;
		await editor.render(newData);
	}

	// Export functions for parent component
	export { saveReport, clearEditor, loadData };

	// Format last saved time
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
			{#if lastSaved}
				<span class="save-status">{formatLastSaved(lastSaved)}</span>
			{/if}
		</div>
		<div class="editor-actions">
			<button onclick={clearEditor} class="btn btn-secondary" disabled={readOnly}>
				{$t('richTextEditor', 'buttons.clear', {}, 'Clear')}
			</button>
			<button onclick={saveReport} class="btn btn-primary" disabled={isSaving || readOnly}>
				{isSaving
					? $t('richTextEditor', 'buttons.saving', {}, 'Saving...')
					: $t('richTextEditor', 'buttons.saveReport', {}, 'Save Report')}
			</button>
		</div>
	</div>

	<div class="editor-container" bind:this={editorHolder}></div>

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

<style>
	.editor-wrapper {
		max-width: 900px;
		margin: 0 auto;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: visible;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 30px;
		border-bottom: 1px solid #e8e8e8;
		background: #fafafa;
	}

	.editor-title {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.editor-title h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		color: #333;
	}

	.save-status {
		font-size: 12px;
		color: #888;
		font-weight: 400;
	}

	.editor-actions {
		display: flex;
		gap: 10px;
	}

	.btn {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		outline: none;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #4a90e2;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #357abd;
	}

	.btn-secondary {
		background: #e8e8e8;
		color: #333;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #d0d0d0;
	}

	.editor-container {
		padding: 30px;
		min-height: 400px;
		overflow: visible;
	}

	.editor-footer {
		padding: 15px 30px;
		background: #fafafa;
		border-top: 1px solid #e8e8e8;
	}

	.editor-tips {
		display: flex;
		align-items: center;
		gap: 15px;
		font-size: 13px;
		color: #666;
	}

	.tip-label {
		font-weight: 600;
		color: #333;
	}

	.tip {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	kbd {
		padding: 2px 6px;
		background: white;
		border: 1px solid #d0d0d0;
		border-radius: 3px;
		font-family: monospace;
		font-size: 11px;
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
	}

	/* EditorJS specific styles */
	:global(.ce-block__content) {
		max-width: 100%;
	}

	:global(.ce-toolbar__content) {
		max-width: 100%;
	}

	:global(.cdx-block) {
		max-width: 100%;
	}

	:global(.ce-header) {
		font-weight: 600;
		color: #333;
	}

	:global(.ce-paragraph) {
		line-height: 1.6;
		color: #444;
	}

	:global(.cdx-checklist__item-checkbox) {
		margin-right: 8px;
	}

	:global(.cdx-warning) {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 4px;
		padding: 12px;
	}

	:global(.cdx-warning__title) {
		font-weight: 600;
		margin-bottom: 6px;
	}

	:global(.cdx-quote) {
		border-left: 3px solid #4a90e2;
		padding-left: 20px;
		font-style: italic;
	}

	:global(.tc-wrap) {
		--color-border: #e8e8e8;
		--color-background: #fafafa;
	}
</style>
