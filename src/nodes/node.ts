import { decode, encode } from 'he';
import NodeType from './type';
import HTMLElement from './html';
/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export default abstract class Node {
	abstract nodeType: NodeType;
	public childNodes: Node[];
	public classList: HTMLElement["classList"]
	public rawAttrs: string;
	public rawTagName: string;
	public id : string;
	public range: readonly [number, number];
	abstract text: string;
	abstract rawText: string;
	// abstract get rawText(): string;
	abstract toString(): string;
	abstract clone(): Node;
	public constructor(
		public parentNode = null as HTMLElement | null,
		range?: [number, number]
	) {
		Object.defineProperty(this, 'range', {
			enumerable: false,
			writable: true,
			configurable: true,
			value: range ?? [-1, -1]
		});
	}
	/**
	 * Remove current node
	 */
	public remove() {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			this.parentNode.childNodes = children.filter((child) => {
				return this !== child;
			});
			this.parentNode = null;
		}
		return this;
	}
	public get innerText() {
		return this.rawText;
	}
	public get textContent() {
		return decode(this.rawText);
	}
	public set textContent(val: string) {
		this.rawText = encode(val);
	}
}
