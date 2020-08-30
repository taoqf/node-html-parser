import NodeType from './type';
import Node from './node';

/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
export default class TextNode extends Node {
	constructor(value: string) {
		super();
		this._rawText = value;
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	nodeType = NodeType.textNode;

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	get text(): string {
		return this._rawText;
	}

	/**
	 * Detect if the node contains only white space.
	 * @return {bool}
	 */
	get isWhitespace(): boolean {
		return /^(\s|&nbsp;)*$/.test(this._rawText);
	}

	toString(): string {
		return this._rawText;
	}
}
