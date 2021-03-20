import he from 'he';
import { selectAll, selectOne } from 'css-select';
import Node from './node';
import { NodeOptions, NodeType } from './type';
import TextNode from './text';
import Matcher from '../matcher';
import arr_back from '../back';
import CommentNode from './comment';

// const { decode } = he;

function decode(val: string) {
	// clone string
	return JSON.parse(JSON.stringify(he.decode(val))) as string;
}

export interface KeyAttributes {
	id?: string;
	class?: string;
}

export interface Attributes {
	[key: string]: string;
}

export interface RawAttributes {
	[key: string]: string;
}

export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

const kBlockElements = new Map<string, true>();

kBlockElements.set('DIV', true);
kBlockElements.set('div', true);
kBlockElements.set('P', true);
kBlockElements.set('p', true);
// ul: true,
// ol: true,
kBlockElements.set('LI', true);
kBlockElements.set('li', true);
// table: true,
// tr: true,
kBlockElements.set('TD', true);
kBlockElements.set('td', true);
kBlockElements.set('SECTION', true);
kBlockElements.set('section', true);
kBlockElements.set('BR', true);
kBlockElements.set('br', true);

class DOMTokenList {
	private _set: Set<string>;
	private _afterUpdate: ((t: DOMTokenList) => void);
	private _validate(c: string) {
		if (/\s/.test(c)) {
			throw new Error(`DOMException in DOMTokenList.add: The token '${c}' contains HTML space characters, which are not valid in tokens.`);
		}
	}
	public constructor(valuesInit: string[] = [], afterUpdate: ((t: DOMTokenList) => void) = (() => null)) {
		this._set = new Set(valuesInit);
		this._afterUpdate = afterUpdate;
	}
	public add(c: string) {
		this._validate(c);
		this._set.add(c);
		this._afterUpdate(this); // eslint-disable-line @typescript-eslint/no-unsafe-call
	}
	public replace(c1: string, c2: string) {
		this._validate(c2);
		this._set.delete(c1);
		this._set.add(c2);
		this._afterUpdate(this); // eslint-disable-line @typescript-eslint/no-unsafe-call
	}
	public remove(c: string) {
		this._set.delete(c) &&
			this._afterUpdate(this); // eslint-disable-line @typescript-eslint/no-unsafe-call
	}
	public toggle(c: string) {
		this._validate(c);
		if (this._set.has(c)) this._set.delete(c);
		else this._set.add(c);
		this._afterUpdate(this); // eslint-disable-line @typescript-eslint/no-unsafe-call
	}
	public contains(c: string): boolean {
		return this._set.has(c);
	}
	public get length(): number {
		return this._set.size;
	}
	public values() {
		return this._set.values();
	}
	public get value(): string[] {
		return Array.from(this._set.values());
	}
	public toString() {
		return Array.from(this._set.values()).join(' ');
	}
}


/**
 * HTMLElement, which contains a set of children.
 *
 * Note: this is a minimalist implementation, no complete tree
 *   structure provided (no parentNode, nextSibling,
 *   previousSibling etc).
 * @class HTMLElement
 * @extends {Node}
 */
export default class HTMLElement extends Node {
	private _attrs: Attributes;
	private _rawAttrs: RawAttributes;
	public rawTagName: string;	// there is not friend funciton in es
	public id: string;
	public classList: DOMTokenList;

	/**
	 * Node Type declaration.
	 */
	public nodeType = NodeType.ELEMENT_NODE;

	/**
	 * Quote attribute values
	 * @param attr attribute value
	 * @returns {string} quoted value
	 */

	private quoteAttribute(attr: string) {
		if (attr === null) {
			return "null";
		}

		return JSON.stringify(attr.replace(/"/g, '&quot;'));
	}

	/**
	 * Creates an instance of HTMLElement.
	 * @param keyAttrs	id and class attribute
	 * @param [rawAttrs]	attributes in string
	 *
	 * @memberof HTMLElement
	 */
	public constructor(tagName: string, keyAttrs: KeyAttributes, private rawAttrs = '', parentNode: HTMLElement | null, nodeOptions: NodeOptions = {}) {
		super(parentNode, nodeOptions);
		this.rawTagName = tagName;
		this.rawAttrs = rawAttrs || '';
		this.id = keyAttrs.id || '';
		this.childNodes = [];
		this.classList = new DOMTokenList(
			keyAttrs.class ? keyAttrs.class.split(/\s+/) : [],
			(classList) => (
				this.setAttribute('class', classList.toString()) // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			)
		);
		if (keyAttrs.id) {
			if (!rawAttrs) {
				this.rawAttrs = `id="${keyAttrs.id}"`;
			}
		}
		if (keyAttrs.class) {
			if (!rawAttrs) {
				const cls = `class="${this.classList.toString()}"`;
				if (this.rawAttrs) {
					this.rawAttrs += ` ${cls}`;
				} else {
					this.rawAttrs = cls;
				}
			}
		}
	}

	/**
	 * Remove current element
	 */
	public remove() {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			this.parentNode.childNodes = children.filter((child) => {
				return this !== child;
			});
		}
	}
	/**
	 * Remove Child element from childNodes array
	 * @param {HTMLElement} node     node to remove
	 */
	public removeChild(node: Node) {
		this.childNodes = this.childNodes.filter((child) => {
			return (child !== node);
		});
	}
	/**
	 * Exchanges given child with new child
	 * @param {HTMLElement} oldNode     node to exchange
	 * @param {HTMLElement} newNode     new node
	 */
	public exchangeChild(oldNode: Node, newNode: Node) {
		const children = this.childNodes;
		this.childNodes = children.map((child) => {
			if (child === oldNode) {
				return newNode;
			}
			return child;
		});
	}
	public get tagName() {
		return this.rawTagName ? this.rawTagName.toUpperCase() : this.rawTagName;
	}
	public get localName() {
		return this.rawTagName.toLowerCase();
	}
	/**
	 * Get escpaed (as-it) text value of current node and its children.
	 * @return {string} text content
	 */
	public get rawText() {
		return this.childNodes.reduce((pre, cur) => {
			return (pre += cur.rawText);
		}, '');
	}
	public get textContent() {
		return this.rawText;
	}
	public set textContent(val: string) {
		const content = [new TextNode(val, this)];
		this.childNodes = content;
	}
	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	public get text() {
		return decode(this.rawText);
	}
	/**
	 * Get structured Text (with '\n' etc.)
	 * @return {string} structured text
	 */
	public get structuredText() {
		interface ICurrentBlock extends Array<string> {
			prependWhitespace?: boolean;
		}
		let currentBlock = [] as ICurrentBlock;
		const blocks = [currentBlock];
		function dfs(node: Node) {
			if (node.nodeType === NodeType.ELEMENT_NODE) {
				if (kBlockElements.get((node as HTMLElement).rawTagName)) {
					if (currentBlock.length > 0) {
						blocks.push(currentBlock = []);
					}
					node.childNodes.forEach(dfs);
					if (currentBlock.length > 0) {
						blocks.push(currentBlock = []);
					}
				} else {
					node.childNodes.forEach(dfs);
				}
			} else if (node.nodeType === NodeType.TEXT_NODE) {
				if ((node as TextNode).isWhitespace) {
					// Whitespace node, postponed output
					currentBlock.prependWhitespace = true;
				} else {
					let text = (<TextNode>node).trimmedText;
					if (currentBlock.prependWhitespace) {
						text = ` ${text}`;
						currentBlock.prependWhitespace = false;
					}
					currentBlock.push(text);
				}
			}
		}
		dfs(this);
		return blocks.map((block) => {
			// Normalize each line's whitespace
			return block.join('').replace(/\s{2,}/g, ' ');
		})
			.join('\n').replace(/\s+$/, '');	// trimRight;
	}

	public toString() {
		const tag = this.rawTagName;
		if (tag) {
			// const void_tags = new Set('area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr'.split('|'));
			// const is_void = void_tags.has(tag);
			const is_void = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag);
			const attrs = this.rawAttrs ? ` ${this.rawAttrs}` : '';
			if (is_void) {
				return `<${tag}${attrs}>`;
			}
			return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
		}
		return this.innerHTML;
	}

	public get innerHTML() {
		return this.childNodes.map((child) => {
			return child.toString();
		}).join('');
	}

	public set innerHTML(content: string) {
		//const r = parse(content, global.options); // TODO global.options ?
		const r = parse(content);
		this.childNodes = r.childNodes.length ? r.childNodes : [new TextNode(content, this)];
	}

	public set_content(content: string | Node | Node[], options = {} as Options) {
		if (content instanceof Node) {
			content = [content];
		} else if (typeof content == 'string') {
			const r = parse(content, options);
			content = r.childNodes.length ? r.childNodes : [new TextNode(content, this)];
		}
		this.childNodes = content;
	}

	public replaceWith(...nodes: (string | Node)[]) {
		const content = nodes.map((node) => {
			if (node instanceof Node) {
				return [node];
			} else if (typeof node == 'string') {
				// const r = parse(content, global.options); // TODO global.options ?
				const r = parse(node);
				return r.childNodes.length ? r.childNodes : [new TextNode(node, this)];
			}
			return [];
		}).flat();
		const idx = this.parentNode.childNodes.findIndex((child) => {
			return child === this;
		});
		this.parentNode.childNodes = [
			...this.parentNode.childNodes.slice(0, idx),
			...content,
			...this.parentNode.childNodes.slice(idx + 1),
		];
	}

	public get outerHTML() {
		return this.toString();
	}

	/**
	 * Trim element from right (in block) after seeing pattern in a TextNode.
	 * @param  {RegExp} pattern pattern to find
	 * @return {HTMLElement}    reference to current node
	 */
	public trimRight(pattern: RegExp) {
		for (let i = 0; i < this.childNodes.length; i++) {
			const childNode = this.childNodes[i];
			if (childNode.nodeType === NodeType.ELEMENT_NODE) {
				(childNode as HTMLElement).trimRight(pattern);
			} else {
				const index = childNode.rawText.search(pattern);
				if (index > -1) {
					childNode.rawText = childNode.rawText.substr(0, index);
					// trim all following nodes.
					this.childNodes.length = i + 1;
				}
			}
		}
		return this;
	}
	/**
	 * Get DOM structure
	 * @return {string} strucutre
	 */
	public get structure() {
		const res = [] as string[];
		let indention = 0;
		function write(str: string) {
			res.push('  '.repeat(indention) + str);
		}
		function dfs(node: HTMLElement) {
			const idStr = node.id ? (`#${node.id}`) : '';
			const classStr = node.classList.length ? (`.${node.classList.value.join('.')}`) : ''; // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-call
			write(`${node.rawTagName}${idStr}${classStr}`);
			indention++;
			node.childNodes.forEach((childNode) => {
				if (childNode.nodeType === NodeType.ELEMENT_NODE) {
					dfs(childNode as HTMLElement);
				} else if (childNode.nodeType === NodeType.TEXT_NODE) {
					if (!(childNode as TextNode).isWhitespace) {
						write('#text');
					}
				}
			});
			indention--;
		}
		dfs(this);
		return res.join('\n');
	}

	/**
	 * Remove whitespaces in this sub tree.
	 * @return {HTMLElement} pointer to this
	 */
	public removeWhitespace() {
		let o = 0;
		this.childNodes.forEach((node) => {
			if (node.nodeType === NodeType.TEXT_NODE) {
				if ((node as TextNode).isWhitespace) {
					return;
				}
				node.rawText = (<TextNode>node).trimmedText;
			} else if (node.nodeType === NodeType.ELEMENT_NODE) {
				(node as HTMLElement).removeWhitespace();
			}
			this.childNodes[o++] = node;
		});
		this.childNodes.length = o;
		return this;
	}

	/**
	 * Query CSS selector to find matching nodes.
	 * @param  {string}         selector Simplified CSS selector
	 * @return {HTMLElement[]}  matching elements
	 */
	public querySelectorAll(selector: string): HTMLElement[] {

		return selectAll(selector, this as HTMLElement, {
			xmlMode: true,
			adapter: Matcher
		});

		// let matcher: Matcher;
		// if (selector instanceof Matcher) {
		// 	matcher = selector;
		// 	matcher.reset();
		// } else {
		// 	if (selector.includes(',')) {
		// 		const selectors = selector.split(',');
		// 		return Array.from(selectors.reduce((pre, cur) => {
		// 			const result = this.querySelectorAll(cur.trim());
		// 			return result.reduce((p, c) => {
		// 				return p.add(c);
		// 			}, pre);
		// 		}, new Set<HTMLElement>()));
		// 	}
		// 	matcher = new Matcher(selector);
		// }
		// interface IStack {
		// 	0: Node;	// node
		// 	1: number;	// children
		// 	2: boolean;	// found flag
		// }
		// const stack = [] as IStack[];
		// return this.childNodes.reduce((res, cur) => {
		// 	stack.push([cur, 0, false]);
		// 	while (stack.length) {
		// 		const state = arr_back(stack);	// get last element
		// 		const el = state[0];
		// 		if (state[1] === 0) {
		// 			// Seen for first time.
		// 			if (el.nodeType !== NodeType.ELEMENT_NODE) {
		// 				stack.pop();
		// 				continue;
		// 			}
		// 			const html_el = el as HTMLElement;
		// 			state[2] = matcher.advance(html_el);
		// 			if (state[2]) {
		// 				if (matcher.matched) {
		// 					res.push(html_el);
		// 					res.push(...(html_el.querySelectorAll(selector)));
		// 					// no need to go further.
		// 					matcher.rewind();
		// 					stack.pop();
		// 					continue;
		// 				}
		// 			}
		// 		}
		// 		if (state[1] < el.childNodes.length) {
		// 			stack.push([el.childNodes[state[1]++], 0, false]);
		// 		} else {
		// 			if (state[2]) {
		// 				matcher.rewind();
		// 			}
		// 			stack.pop();
		// 		}
		// 	}
		// 	return res;
		// }, [] as HTMLElement[]);
	}

	/**
	 * Query CSS Selector to find matching node.
	 * @param  {string}         selector Simplified CSS selector
	 * @return {HTMLElement}    matching node
	 */
	public querySelector(selector: string) {
		return selectOne(selector, this as HTMLElement, {
			xmlMode: true,
			adapter: Matcher
		});
		// let matcher: Matcher;
		// if (selector instanceof Matcher) {
		// 	matcher = selector;
		// 	matcher.reset();
		// } else {
		// 	matcher = new Matcher(selector);
		// }
		// const stack = [] as { 0: Node; 1: 0 | 1; 2: boolean }[];
		// for (const node of this.childNodes) {
		// 	stack.push([node, 0, false]);
		// 	while (stack.length) {
		// 		const state = arr_back(stack);
		// 		const el = state[0];
		// 		if (state[1] === 0) {
		// 			// Seen for first time.
		// 			if (el.nodeType !== NodeType.ELEMENT_NODE) {
		// 				stack.pop();
		// 				continue;
		// 			}
		// 			state[2] = matcher.advance(el as HTMLElement);
		// 			if (state[2]) {
		// 				if (matcher.matched) {
		// 					return el as HTMLElement;
		// 				}
		// 			}
		// 		}
		// 		if (state[1] < el.childNodes.length) {
		// 			stack.push([el.childNodes[state[1]++], 0, false]);
		// 		} else {
		// 			if (state[2]) {
		// 				matcher.rewind();
		// 			}
		// 			stack.pop();
		// 		}
		// 	}
		// }
		// return null;
	}

	/**
	 * traverses the Element and its parents (heading toward the document root) until it finds a node that matches the provided selector string. Will return itself or the matching ancestor. If no such element exists, it returns null.
	 * @param selector a DOMString containing a selector list
	 */
	public closest(selector: string) {
		type Predicate = (node: Node) => node is HTMLElement;

		const mapChild = new Map<Node, Node>();
		let el = this as Node;
		let old = null as Node;
		function findOne(test: Predicate, elems: Node[]) {
			let elem = null as HTMLElement | null;

			for (let i = 0, l = elems.length; i < l && !elem; i++) {
				const el = elems[i];
				if (test(el)) {
					elem = el;
				} else {
					const child = mapChild.get(el);
					if (child) {
						elem = findOne(test, [child]);
					}
				}
			}
			return elem;
		}
		while (el) {
			mapChild.set(el, old);
			old = el;
			el = el.parentNode;
		}
		el = this;
		while (el) {
			const e = selectOne(selector, el, {
				xmlMode: true,
				adapter: {
					...Matcher,
					getChildren(node: Node) {
						const child = mapChild.get(node);
						return child && [child];
					},
					getSiblings(node: Node) {
						return [node];
					},
					findOne,
					findAll(): Node[] {
						return [];
					}
				}
			});
			if (e) {
				return e;
			}
			el = el.parentNode;
		}
		return null;
	}

	/**
	 * Append a child node to childNodes
	 * @param  {Node} node node to append
	 * @return {Node}      node appended
	 */
	public appendChild<T extends Node = Node>(node: T) {
		// node.parentNode = this;
		this.childNodes.push(node);
		node.parentNode = this;
		return node;
	}

	/**
	 * Get first child node
	 * @return {Node} first child node
	 */
	public get firstChild() {
		return this.childNodes[0];
	}

	/**
	 * Get last child node
	 * @return {Node} last child node
	 */
	public get lastChild() {
		return arr_back(this.childNodes);
	}

	/**
	 * Get attributes
	 * @access private
	 * @return {Object} parsed and unescaped attributes
	 */
	public get attrs() {
		if (this._attrs) {
			return this._attrs;
		}
		this._attrs = {};
		const attrs = this.rawAttributes;
		for (const key in attrs) {
			const val = attrs[key] || '';
			this._attrs[key.toLowerCase()] = decode(val);
		}
		return this._attrs;
	}

	public get attributes() {
		const ret_attrs = {} as Record<string, string>;
		const attrs = this.rawAttributes;
		for (const key in attrs) {
			const val = attrs[key] || '';
			ret_attrs[key] = decode(val);
		}
		return ret_attrs;
	}

	/**
	 * Get escaped (as-it) attributes
	 * @return {Object} parsed attributes
	 */
	public get rawAttributes() {
		if (this._rawAttrs) {
			return this._rawAttrs;
		}
		const attrs = {} as RawAttributes;
		if (this.rawAttrs) {
			const re = /\b([a-z][a-z0-9-_:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;
			let match: RegExpExecArray;
			while ((match = re.exec(this.rawAttrs))) {
				attrs[match[1]] = match[2] || match[3] || match[4] || null;
			}
		}
		this._rawAttrs = attrs;
		return attrs;
	}

	public removeAttribute(key: string) {
		const attrs = this.rawAttributes;
		delete attrs[key];
		// Update this.attribute
		if (this._attrs) {
			delete this._attrs[key];
		}
		// Update rawString
		this.rawAttrs = Object.keys(attrs).map((name) => {
			const val = JSON.stringify(attrs[name]);
			if (val === undefined || val === 'null') {
				return name;
			}
			return `${name}=${val}`;
		}).join(' ');
		// Update this.id
		if (key === 'id') {
			this.id = '';
		}
	}

	public hasAttribute(key: string) {
		return key.toLowerCase() in this.attrs;
	}

	/**
	 * Get an attribute
	 * @return {string} value of the attribute
	 */
	public getAttribute(key: string): string | undefined {
		return this.attrs[key.toLowerCase()];
	}

	/**
	 * Set an attribute value to the HTMLElement
	 * @param {string} key The attribute name
	 * @param {string} value The value to set, or null / undefined to remove an attribute
	 */
	public setAttribute(key: string, value: string) {
		if (arguments.length < 2) {
			throw new Error('Failed to execute \'setAttribute\' on \'Element\'');
		}
		const k2 = key.toLowerCase();
		const attrs = this.rawAttributes;
		for (const k in attrs) {
			if (k.toLowerCase() === k2) {
				key = k;
				break;
			}
		}
		attrs[key] = String(value);
		// update this.attrs
		if (this._attrs) {
			this._attrs[k2] = decode(attrs[key]);
		}
		// Update rawString
		this.rawAttrs = Object.keys(attrs).map((name) => {
			const val = this.quoteAttribute(attrs[name]);
			if (val === 'null' || val === '""') {
				return name;
			}
			return `${name}=${val}`;
		}).join(' ');
		// Update this.id
		if (key === 'id') {
			this.id = value;
		}
	}

	/**
	 * Replace all the attributes of the HTMLElement by the provided attributes
	 * @param {Attributes} attributes the new attribute set
	 */
	public setAttributes(attributes: Attributes) {
		// Invalidate current this.attributes
		if (this._attrs) {
			delete this._attrs;
		}
		// Invalidate current this.rawAttributes
		if (this._rawAttrs) {
			delete this._rawAttrs;
		}
		// Update rawString
		this.rawAttrs = Object.keys(attributes).map((name) => {
			const val = attributes[name];
			if (val === 'null' || val === '""') {
				return name;
			}
			return `${name}=${this.quoteAttribute(String(val))}`;

		}).join(' ');
	}

	public insertAdjacentHTML(where: InsertPosition, html: string) {
		if (arguments.length < 2) {
			throw new Error('2 arguments required');
		}
		const p = parse(html);
		if (where === 'afterend') {
			const idx = this.parentNode.childNodes.findIndex((child) => {
				return child === this;
			});
			this.parentNode.childNodes.splice(idx + 1, 0, ...p.childNodes);
			p.childNodes.forEach((n) => {
				if (n instanceof HTMLElement) {
					n.parentNode = this.parentNode;
				}
			});
		} else if (where === 'afterbegin') {
			this.childNodes.unshift(...p.childNodes);
		} else if (where === 'beforeend') {
			p.childNodes.forEach((n) => {
				this.appendChild(n);
			});
		} else if (where === 'beforebegin') {
			const idx = this.parentNode.childNodes.findIndex((child) => {
				return child === this;
			});
			this.parentNode.childNodes.splice(idx, 0, ...p.childNodes);
			p.childNodes.forEach((n) => {
				if (n instanceof HTMLElement) {
					n.parentNode = this.parentNode;
				}
			});
		} else {
			throw new Error(`The value provided ('${where as string}') is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'`);
		}
		// if (!where || html === undefined || html === null) {
		// 	return;
		// }
	}

	public get nextSibling() {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			let i = 0;
			while (i < children.length) {
				const child = children[i++];
				if (this === child) {
					return children[i] || null;
				}
			}
			return null;
		}
	}

	public get nextElementSibling(): HTMLElement {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			let i = 0;
			let find = false;
			while (i < children.length) {
				const child = children[i++];
				if (find) {
					if (child instanceof HTMLElement) {
						return child || null;
					}
				} else if (this === child) {
					find = true;
				}
			}
			return null;
		}
	}

	public get classNames() {
		return this.classList.toString();
	}
}

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.:0-9_a-z]*)\s*([^>]*?)(\/?)>/ig;
// <(?<tag>[^\s]*)(.*)>(.*)</\k<tag>>
// <([a-z][-.:0-9_a-z]*)\s*\/>
// <(area|base|br|col|hr|img|input|link|meta|source)\s*(.*)\/?>
// <(area|base|br|col|hr|img|input|link|meta|source)\s*(.*)\/?>|<(?<tag>[^\s]*)(.*)>(.*)</\k<tag>>
const kAttributePattern = /(^|\s)(id|class)\s*=\s*("([^"]*)"|'([^']*)'|(\S+))/ig;
const kSelfClosingElements = {
	area: true,
	AREA: true,
	base: true,
	BASE: true,
	br: true,
	BR: true,
	col: true,
	COL: true,
	hr: true,
	HR: true,
	img: true,
	IMG: true,
	input: true,
	INPUT: true,
	link: true,
	LINK: true,
	meta: true,
	META: true,
	source: true,
	SOURCE: true,
	embed: true,
	EMBED: true,
	param: true,
	PARAM: true,
	track: true,
	TRACK: true,
	wbr: true,
	WBR: true
};
const kElementsClosedByOpening = {
	li: { li: true, LI: true },
	LI: { li: true, LI: true },
	p: { p: true, div: true, P: true, DIV: true },
	P: { p: true, div: true, P: true, DIV: true },
	b: { div: true, DIV: true },
	B: { div: true, DIV: true },
	td: { td: true, th: true, TD: true, TH: true },
	TD: { td: true, th: true, TD: true, TH: true },
	th: { td: true, th: true, TD: true, TH: true },
	TH: { td: true, th: true, TD: true, TH: true },
	h1: { h1: true, H1: true },
	H1: { h1: true, H1: true },
	h2: { h2: true, H2: true },
	H2: { h2: true, H2: true },
	h3: { h3: true, H3: true },
	H3: { h3: true, H3: true },
	h4: { h4: true, H4: true },
	H4: { h4: true, H4: true },
	h5: { h5: true, H5: true },
	H5: { h5: true, H5: true },
	h6: { h6: true, H6: true },
	H6: { h6: true, H6: true }
};
const kElementsClosedByClosing = {
	li: { ul: true, ol: true, UL: true, OL: true },
	LI: { ul: true, ol: true, UL: true, OL: true },
	a: { div: true, DIV: true },
	A: { div: true, DIV: true },
	b: { div: true, DIV: true },
	B: { div: true, DIV: true },
	i: { div: true, DIV: true },
	I: { div: true, DIV: true },
	p: { div: true, DIV: true },
	P: { div: true, DIV: true },
	td: { tr: true, table: true, TR: true, TABLE: true },
	TD: { tr: true, table: true, TR: true, TABLE: true },
	th: { tr: true, table: true, TR: true, TABLE: true },
	TH: { tr: true, table: true, TR: true, TABLE: true }
};

export interface Options {
	lowerCaseTagName: boolean;
	comment: boolean;
	blockTextElements: {
		[tag: string]: boolean;
	};
}

const frameflag = 'documentfragmentcontainer';

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 * @param  {string} data      html
 * @return {HTMLElement}      root element
 */
export function base_parse(data: string, options = { lowerCaseTagName: false, comment: false } as Partial<Options>) {
	const elements = options.blockTextElements || {
		script: true,
		noscript: true,
		style: true,
		pre: true
	};
	const element_names = Object.keys(elements);
	const kBlockTextElements = element_names.map((it) => {
		return new RegExp(it, 'i');
	});
	const kIgnoreElements = element_names.filter((it) => {
		return elements[it];
	}).map((it) => {
		return new RegExp(it, 'i');
	});
	function element_should_be_ignore(tag: string) {
		return kIgnoreElements.some((it) => {
			return it.test(tag);
		});
	}
	function is_block_text_element(tag: string) {
		return kBlockTextElements.some((it) => {
			return it.test(tag);
		});
	}
	const root = new HTMLElement(null, {}, '', null);
	let currentParent = root;
	const stack = [root];
	let lastTextPos = -1;
	let match: RegExpExecArray;
	// https://github.com/taoqf/node-html-parser/issues/38
	data = `<${frameflag}>${data}</${frameflag}>`;
	const dataOffset = `<${frameflag}>`.length;
	const dataLastIndex = data.length - `</${frameflag}>`.length - 1;

	function nodeArgs(start: number, end: number) {
		const text = data.substring(start, end);
		const nodeOptions = {
			start: start - dataOffset,
			end: end - dataOffset,
		};
		return { text, nodeOptions };
	}

	while ((match = kMarkupPattern.exec(data))) {
		// match[0] is open or close tag, without content
		//console.dir({ ...match, input: undefined }); // debug
		if (lastTextPos > -1) {
			if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
				// if has content
				const { text, nodeOptions } = nodeArgs(lastTextPos, match.index);
				currentParent.appendChild(new TextNode(text, currentParent, nodeOptions));
			}
		}
		lastTextPos = kMarkupPattern.lastIndex;
		if (match[2] === frameflag) {
			continue;
		}
		if (match[0][1] === '!') {
			// this is a comment
			if (options.comment) {
				// Only keep what is in between <!-- and -->
				const { text, nodeOptions } = nodeArgs(
					lastTextPos - 3,
					lastTextPos - match[0].length + 4
				);
				currentParent.appendChild(new CommentNode(text, currentParent, nodeOptions));
			}
			continue;
		}
		if (options.lowerCaseTagName) {
			match[2] = match[2].toLowerCase();
		}
		if (!match[1]) {
			// open tag
			const attrs = {};
			if (match[3]) {
				for (let attMatch; (attMatch = kAttributePattern.exec(match[3]));) {
					attrs[attMatch[2].toLowerCase()] = attMatch[4] || attMatch[5] || attMatch[6];
				}
			}

			const tagName = currentParent.rawTagName as 'LI' | 'P' | 'B' | 'TD' | 'TH' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'li' | 'p' | 'b' | 'td' | 'th' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			if (!match[4] && kElementsClosedByOpening[tagName]) {
				if (kElementsClosedByOpening[tagName][match[2]]) {
					stack.pop();
					currentParent = arr_back(stack);
				}
			}
			const nodeOptions = {
				start: match.index - dataOffset,
				//end: -1, // end is unknown here
			};
			// ignore container tag we add above
			// https://github.com/taoqf/node-html-parser/issues/38
			//console.dir({ new_HTMLElement: { name: match[2], attrs, attrRaw: match[3], parent: null, nodeOptions } }); // debug
			currentParent = currentParent.appendChild(new HTMLElement(match[2], attrs, match[3], null, nodeOptions));
			stack.push(currentParent);
			if (is_block_text_element(match[2])) {
				// a little test to find next </script> or </style> ...
				const closeMarkup = `</${match[2]}>`;
				const index = (() => {
					if (options.lowerCaseTagName) {
						return data.toLocaleLowerCase().indexOf(closeMarkup, kMarkupPattern.lastIndex);
					}
					return data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
				})();
				if (element_should_be_ignore(match[2])) {
					let text: string;
					const nodeOptions = {
						start: kMarkupPattern.lastIndex - dataOffset,
						end: dataLastIndex, // TODO verify
					};
					if (index === -1) {
						// there is no matching ending for the text element.
						text = data.substr(kMarkupPattern.lastIndex);
					} else {
						text = data.substring(kMarkupPattern.lastIndex, index);
						nodeOptions.end = index - dataOffset;
					}
					if (text.length > 0) {
						currentParent.appendChild(new TextNode(text, currentParent, nodeOptions));
					}
				}
				if (index === -1) {
					lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
				} else {
					lastTextPos = kMarkupPattern.lastIndex = index + closeMarkup.length;
					match[1] = 'true';
				}
			}
		}
		if (match[1] || match[4] || kSelfClosingElements[match[2]]) {
			// </ or /> or <br> etc.
			while (true) {
				if (currentParent.rawTagName === match[2]) {
					stack.pop();
					currentParent = arr_back(stack);
					break;
				} else {
					const tagName = currentParent.tagName as 'LI' | 'A' | 'B' | 'I' | 'P' | 'TD' | 'TH';
					// Trying to close current tag, and move on
					if (kElementsClosedByClosing[tagName]) {
						if (kElementsClosedByClosing[tagName][match[2]]) {
							stack.pop();
							currentParent = arr_back(stack);
							continue;
						}
					}
					// Use aggressive strategy to handle unmatching markups.
					break;
				}
			}
		}
	}
	return stack;
}

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 */
export function parse(data: string, options = { lowerCaseTagName: false, comment: false } as Partial<Options>) {
	const stack = base_parse(data, options);
	const [root] = stack;
	while (stack.length > 1) {
		// Handle each error elements.
		const last = stack.pop();
		const oneBefore = arr_back(stack);
		if (last.parentNode && last.parentNode.parentNode) {
			if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
				// Pair error case <h3> <h3> handle : Fixes to <h3> </h3>
				oneBefore.removeChild(last);
				last.childNodes.forEach((child) => {
					oneBefore.parentNode.appendChild(child);
				});
				stack.pop();
			} else {
				// Single error  <div> <h3> </div> handle: Just removes <h3>
				oneBefore.removeChild(last);
				last.childNodes.forEach((child) => {
					oneBefore.appendChild(child);
				});
			}
		} else {
			// If it's final element just skip.
		}
	}
	// response.childNodes.forEach((node) => {
	// 	if (node instanceof HTMLElement) {
	// 		node.parentNode = null;
	// 	}
	// });
	return root;
}
