<script>
	import EditorJS from '@editorjs/editorjs';
	import { onMount } from 'svelte';
	import Header from '@editorjs/header';
	import Paragraph from '@editorjs/paragraph';
	let editor = $state();
	// let editor;

	onMount(() => {
		editor = new EditorJS({
			placeholder: 'Start writing your content here...',
			holder: 'editorjs',
			autofocus: true,
			tools: {
				header: {
					class: Header,
					inlineToolbar: ['link'],
					config: {
						placeholder: 'Enter a header',
						levels: [1, 2, 3],
						defaultLevel: 2
					}
				},
				paragraph: {
					class: Paragraph,
					inlineToolbar: true
				}
				// Add other tools as needed
			},
			data: {
				time: 1751791485944,
				blocks: [
					{
						id: 'mhTl6ghSkV',
						type: 'paragraph',
						data: {
							text: 'Hey. Meet the new Editor. On this picture you can see it in action. Then, try a demo 🤓'
						}
					},
					{
						id: 'l98dyx3yjb',
						type: 'header',
						data: {
							text: 'Key features',
							level: 3
						}
					}
				]
			},
			onReady: () => {
				console.log('Editor.js is ready');
			},
			i18n: {
				/**
				 * @type {I18nDictionary}
				 */
			}
		});
	});
</script>

testing
<div class="prose" id="editorjs"></div>
<button
	onclick={() => {
		editor
			.save()
			.then((outputData) => {
				console.log('Data saved: ', outputData);
			})
			.catch((error) => {
				console.error('Saving failed: ', error);
			});
	}}>Save</button>
