import Node from './node.js';
import NodeType from './type.js';
import HTMLElement from './html.js';

export default class CommentNode extends Node {
	public constructor(public rawText: string, parentNode: HTMLElement, range?: [ number, number ]) {
		super(parentNode, range);
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	public nodeType = NodeType.COMMENT_NODE;

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	public get text() {
		return this.rawText;
	}

	public toString() {
		return `<!--${this.rawText}-->`;
	}
}
