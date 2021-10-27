import * as he from 'he';
import NodeType from './type';
import HTMLElement from './html';

/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export default abstract class Node {
	abstract nodeType: NodeType;
	public childNodes = [] as Node[];
	public range: readonly [number, number];
	abstract text: string;
	abstract rawText: string;
	// abstract get rawText(): string;
	abstract toString(): string;
	public constructor(public parentNode = null as HTMLElement | null, range?: [number, number]) {
		Object.defineProperty(this, 'range', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: range ?? [-1, -1],
		});
	}
	public get innerText() {
		return this.rawText;
	}
	public get textContent() {
		return he.decode(this.rawText);
	}
	public set textContent(val: string) {
		this.rawText = he.encode(val);
	}
}
