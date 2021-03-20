import { NodeOptions, NodeType } from './type';
import Node from './node';
import HTMLElement from './html';

/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
export default class TextNode extends Node {
	public constructor(public rawText: string, parentNode: HTMLElement, nodeOptions: NodeOptions = {}) {
		super(parentNode, nodeOptions);
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	public nodeType = NodeType.TEXT_NODE;

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	public get text() {
		return this.rawText;
	}

	/**
	 * Detect if the node contains only white space.
	 * @return {bool}
	 */
	public get isWhitespace() {
		return /^(\s|&nbsp;)*$/.test(this.rawText);
	}

	public toString() {
		return this.text;
	}
}
