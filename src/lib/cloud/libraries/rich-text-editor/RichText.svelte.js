import { createRawSnippet, onDestroy, onMount } from 'svelte';
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
import { t } from '../../../i18n';
import { get } from 'svelte/store';

export class RichTextEditorSetup {
	editor = $state(null);
	editorHolder = $state(null);
	isSaving = $state(false);
	lastSaved = $state(null);
	constructor({
		placeholder = get(t)(
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
	}) {
		onMount(() => {
			if (!this.editorHolder) return;

			this.editor = new EditorJS({
				holder: this.editorHolder,
				placeholder: placeholder,
				autofocus: autofocus,
				minHeight: minHeight,
				readOnly: readOnly,
				data: data,

				tools: {
					header: {
						class: Header,
						config: {
							placeholder: get(t)('richTextEditor', 'header.placeholder', {}, 'Écrivez un titre'),
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
							quotePlaceholder: get(t)(
								'richTextEditor',
								'quote.placeholder',
								{},
								'Entrez une citation'
							),
							captionPlaceholder: get(t)(
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
							titlePlaceholder: get(t)('richTextEditor', 'warning.titlePlaceholder', {}, 'Titre'),
							messagePlaceholder: get(t)(
								'richTextEditor',
								'warning.messagePlaceholder',
								{},
								'Message'
							)
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
					// TemplateBlock: {
					// 	class: TemplateBlock,
					// 	config: {
					// 		templates: {}
					// 	}
					// }
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
									'Click to tune': get(t)(
										'richTextEditor',
										'blockTunes.clickToTune',
										{},
										'Click to tune'
									),
									'or drag to move': get(t)(
										'richTextEditor',
										'blockTunes.orDragToMove',
										{},
										'or drag to move'
									)
								}
							},
							inlineToolbar: {
								converter: {
									'Convert to': get(t)(
										'richTextEditor',
										'inlineToolbar.convertTo',
										{},
										'Convert to'
									)
								}
							},
							toolbar: {
								toolbox: {
									Add: get(t)('richTextEditor', 'toolbar.add', {}, 'Add block')
								}
							}
						},

						toolNames: {
							Text: get(t)('richTextEditor', 'toolNames.text', {}, 'Text'),
							Heading: get(t)('richTextEditor', 'toolNames.heading', {}, 'Heading'),
							List: get(t)('richTextEditor', 'toolNames.list', {}, 'List'),
							Warning: get(t)('richTextEditor', 'toolNames.warning', {}, 'Warning'),
							Checklist: get(t)('richTextEditor', 'toolNames.checklist', {}, 'Checklist'),
							Quote: get(t)('richTextEditor', 'toolNames.quote', {}, 'Quote'),
							Delimiter: get(t)('richTextEditor', 'toolNames.delimiter', {}, 'Delimiter'),
							Table: get(t)('richTextEditor', 'toolNames.table', {}, 'Table'),
							Bold: get(t)('richTextEditor', 'toolNames.bold', {}, 'Bold'),
							Italic: get(t)('richTextEditor', 'toolNames.italic', {}, 'Italic'),
							InlineCode: get(t)('richTextEditor', 'toolNames.inlineCode', {}, 'Inline Code'),
							Underline: get(t)('richTextEditor', 'toolNames.underline', {}, 'Underline'),
							Marker: get(t)('richTextEditor', 'toolNames.marker', {}, 'Highlight')
						},

						tools: {
							warning: {
								Title: get(t)('richTextEditor', 'tools.warning.title', {}, 'Title'),
								Message: get(t)('richTextEditor', 'tools.warning.message', {}, 'Message')
							},
							stub: {
								'The block can not be displayed correctly.': get(t)(
									'richTextEditor',
									'tools.stub.cannotDisplay',
									{},
									'The block can not be displayed correctly.'
								)
							}
						},

						blockTunes: {
							delete: {
								Delete: get(t)('richTextEditor', 'blockTunes.delete', {}, 'Delete')
							},
							moveUp: {
								'Move up': get(t)('richTextEditor', 'blockTunes.moveUp', {}, 'Move up')
							},
							moveDown: {
								'Move down': get(t)('richTextEditor', 'blockTunes.moveDown', {}, 'Move down')
							}
						}
					}
				}
			});
		});
		onDestroy(() => {
			if (this.editor && this.editor.destroy) {
				this.editor.destroy();
			}
		});
		this.onSave = onSave?.bind(this);
	}
	async clearEditor() {
		if (!this.editor) return;
		await this.editor.clear();
	}
	async loadData(newData) {
		if (!this.editor) return;
		await this.editor.render(newData);
	}
	async save() {
		if (!this.editor) return;

		this.isSaving = true;
		try {
			const outputData = await this.editor.save();
			this.lastSaved = new Date();

			if (this.onSave) {
				await this.onSave(outputData);
			}

			return outputData;
		} catch (error) {
			console.error('Saving failed:', error);
			throw error;
		} finally {
			this.isSaving = false;
		}
	}
}
