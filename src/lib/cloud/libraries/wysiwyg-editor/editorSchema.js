import OrderedMap from 'orderedmap';
import { Schema } from 'prosemirror-model';
import { nodes as basicNodes, marks as basicMarks } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';

// Custom underline mark
const underlineMark = {
	underline: {
		parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
		toDOM() {
			return ['u', 0];
		}
	}
};

const strikethroughMark = {
	strikethrough: {
		parseDOM: [{ tag: 's' }, { tag: 'del' }, { style: 'text-decoration=line-through' }],
		toDOM() {
			return ['s', 0];
		}
	}
};

const textColorMark = {
	text_color: {
		attrs: { color: {} },
		parseDOM: [
			{
				style: 'color',
				getAttrs: (value) => ({ color: value })
			}
		],
		toDOM(mark) {
			return ['span', { style: `color: ${mark.attrs.color}` }, 0];
		}
	}
};

// Extend the basic schema
export const getSchema = () =>
	new Schema({
		nodes: addListNodes(OrderedMap.from(basicNodes), 'paragraph block*', 'block'),
		marks: {
			...basicMarks,
			underline: underlineMark.underline,
			strikethrough: strikethroughMark.strikethrough,
            text_color: textColorMark.text_color
		}
	});
