import { NodeOptions, NodeType, SourceLocation } from './type';
import HTMLElement from './html';

/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export default abstract class Node {
	abstract nodeType: NodeType;
	public childNodes = [] as Node[];
	public _source: SourceLocation;
	abstract text: string;
	abstract rawText: string;
	// abstract get rawText(): string;
	abstract toString(): string;
	public constructor(public parentNode = null as HTMLElement | null, nodeOptions: NodeOptions = {}) {
		this._source = {
			start: nodeOptions.start,
			end: nodeOptions.end,
		};
	}
	public get innerText() {
		return this.rawText;
	}
	public get textContent() {
		return this.rawText;
	}
	public set textContent(val: string) {
		this.rawText = val;
	}
}
