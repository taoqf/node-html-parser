import Node from './node';
import NodeType from './type';

export default class CommentNode extends Node {
	constructor(value: string) {
		super();
		this._rawText = value;
	}

	/**
	 * Node Type declaration.
	 * @type {Number}
	 */
	nodeType = NodeType.commentNode;

	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	get text(): string {
		return this._rawText;
	}

	toString(): string {
		return `<!--${this._rawText}-->`;
	}
}
