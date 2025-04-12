<script>
	import { onMount } from 'svelte';
	import { EditorState } from 'prosemirror-state';
	import { EditorView } from 'prosemirror-view';
	import { DOMParser } from 'prosemirror-model';
	import { baseKeymap, toggleMark, setBlockType, wrapIn } from 'prosemirror-commands';
	import { keymap } from 'prosemirror-keymap';
	import { history } from 'prosemirror-history';
	import { getSchema } from './editorSchema.js';
	import { wrapInList } from 'prosemirror-schema-list';
	import { buildKeymap } from './mapKeys.js';
	import { gapCursor } from 'prosemirror-gapcursor';
	import { dropCursor } from 'prosemirror-dropcursor';
	import { buildInputRules } from './inputRules.js';
	import {
		boldIcon,
		italicIcon,
		strikethroughIcon,
		underlineIcon,
		h1Icon,
		h2Icon,
		h3Icon,
		listBulletIcon,
		listOrderedIcon,
		blockquoteIcon
	} from './icons.svelte';

	let editorDiv;
	let view;
	let schema;
	let commands = {};

	function execCommand(command) {
		const cmd = commands[command];
		if (cmd) {
			cmd()(view.state, view.dispatch, view);
			view.focus();
		}
	}

	function applyColor(color) {
		const { text_color } = schema.marks;
		if (!text_color) return;

		const markType = text_color;

		// Return a ProseMirror command
		return function (state, dispatch) {
			const { from, to } = state.selection;
			if (dispatch) {
				dispatch(state.tr.addMark(from, to, markType.create({ color })));
			}
			return true;
		};
	}

	function toggleBlockType(targetType, attrs, baseType) {
		return function (state, dispatch) {
			const isActive = targetType === state.selection.$from.parent.type;

			if (isActive) {
				return setBlockType(baseType)(state, dispatch);
			} else {
				return setBlockType(targetType, attrs)(state, dispatch);
			}
		};
	}

	onMount(() => {
		schema = getSchema();
		console.log('schema', schema);

		commands = {
			bold: () => toggleMark(schema.marks.strong),
			italic: () => toggleMark(schema.marks.em),
			underline: () => toggleMark(schema.marks.underline),
			strikethrough: () => toggleMark(schema.marks.strikethrough),
			heading: () => toggleBlockType(schema.nodes.heading, { level: 1 }, schema.nodes.paragraph),
			heading2: () => toggleBlockType(schema.nodes.heading, { level: 2 }, schema.nodes.paragraph),
			heading3: () => toggleBlockType(schema.nodes.heading, { level: 3 }, schema.nodes.paragraph),
			blockquote: () => wrapIn(schema.nodes.blockquote),
			bulletList: () => wrapInList(schema.nodes.bullet_list),
			orderedList: () => wrapIn(schema.nodes.ordered_list)
		};
		view = new EditorView(editorDiv, {
			state: EditorState.create({
				doc: DOMParser.fromSchema(schema).parse(document.createElement('div')),
				plugins: [
					history(),
					buildInputRules(schema),
					keymap(buildKeymap(schema)),
					keymap(baseKeymap),
					dropCursor(),
					gapCursor()
				]
			})
		});

		return () => view.destroy();
	});
</script>

{#snippet menuItem(onclick, icon, iconCSS)}
	<button class="" {onclick}>{@render icon("inline-flex size-5 items-center justify-center rounded-full text-gray-400 hover:text-gray-500")}</button>
{/snippet}

<div class="flex space-x-2 md:space-x-5 py-2">
	{@render menuItem(() => execCommand('bold'), boldIcon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('italic'), italicIcon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('underline'), underlineIcon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('strikethrough'), strikethroughIcon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('heading'), h1Icon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('heading2'), h2Icon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('heading3'), h3Icon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('blockquote'), blockquoteIcon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('bulletList'), listBulletIcon, 'size-5 text-gray-900')}
	{@render menuItem(() => execCommand('orderedList'), listOrderedIcon, 'size-5 text-gray-900')}
	<input
		type="color"
		onchange={(e) => {
			const color = e.target.value;
			applyColor(color)(view.state, view.dispatch, view);
			view.focus();
		}} />
</div>

<div
	bind:this={editorDiv}
	class="editor prose block min-h-64 w-full max-w-full rounded-md bg-white px-3 pt-1.5 pb-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
</div>

<style>
</style>
