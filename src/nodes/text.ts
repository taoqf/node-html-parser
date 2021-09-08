import he from 'he';
import HTMLElement from './html.js';
import Node from './node.js';
import NodeType from './type.js';

/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
export default class TextNode extends Node {
	public constructor(rawText: string, parentNode: HTMLElement, range?: [ number, number ]) {
		super(parentNode, range);
		this._rawText = rawText;
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	public nodeType = NodeType.TEXT_NODE;

	private _rawText: string;
	private _trimmedRawText?: string;
	private _trimmedText?: string;

	public get rawText() {
		return this._rawText;
	}

	/**
	 * Set rawText and invalidate trimmed caches
	 */
	public set rawText(text: string) {
		this._rawText = text;
		this._trimmedRawText = void 0;
		this._trimmedText = void 0;
	}

	/**
	 * Returns raw text with all whitespace trimmed except single leading/trailing non-breaking space
	 */
	public get trimmedRawText() {
		if (this._trimmedRawText !== undefined) return this._trimmedRawText;
		this._trimmedRawText = trimText(this.rawText);
		return this._trimmedRawText;
	}

	/**
	 * Returns text with all whitespace trimmed except single leading/trailing non-breaking space
	 */
	public get trimmedText() {
		if (this._trimmedText !== undefined) return this._trimmedText;
		this._trimmedText = trimText(this.text);
		return this._trimmedText;
	}

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	public get text() {
		return he.decode(this.rawText);
	}

	/**
	 * Detect if the node contains only white space.
	 * @return {boolean}
	 */
	public get isWhitespace() {
		return /^(\s|&nbsp;)*$/.test(this.rawText);
	}

	public toString() {
		return this.rawText;
	}
}

/**
 * Trim whitespace except single leading/trailing non-breaking space
 */
function trimText(text: string): string {
	let i = 0;
	let startPos;
	let endPos;

	while (i >= 0 && i < text.length) {
		if (/\S/.test(text[i])) {
			if (startPos === undefined) {
				startPos = i;
				i = text.length;
			} else {
				endPos = i;
				i = void 0;
			}
		}

		if (startPos === undefined) i++;
		else i--;
	}

	if (startPos === undefined) startPos = 0;
	if (endPos === undefined) endPos = text.length - 1;

	const hasLeadingSpace = startPos > 0 && /[^\S\r\n]/.test(text[startPos - 1]);
	const hasTrailingSpace = endPos < (text.length - 1) && /[^\S\r\n]/.test(text[endPos + 1]);

	return (hasLeadingSpace ? ' ' : '') + text.slice(startPos, endPos + 1) + (hasTrailingSpace ? ' ' : '');
}
