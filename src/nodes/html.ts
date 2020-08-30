import { decode } from 'he';
import Node from './node';
import NodeType from './type';
import TextNode from './text';
import Matcher from '../matcher';
import arrBack from '../back';
import CommentNode from './comment';

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

const kBlockElements = {
	div: true,
	p: true,
	// ul: true,
	// ol: true,
	li: true,
	// table: true,
	// tr: true,
	td: true,
	section: true,
	br: true
};

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
	public id: string;
	public classNames = [] as string[];
	/**
	 * Node Type declaration.
	 */
	public nodeType = NodeType.elementNode;
	/**
	 * Creates an instance of HTMLElement.
	 * @param keyAttrs	id and class attribute
	 * @param [rawAttrs]	attributes in string
	 *
	 * @memberof HTMLElement
	 */
	public constructor(public tagName: string, keyAttrs: KeyAttributes, private rawAttrs = '', public parentNode = null as Node) {
		super();
		this.rawAttrs = rawAttrs || '';
		this.parentNode = parentNode || null;
		this.childNodes = [];
		if (keyAttrs.id) {
			this.id = keyAttrs.id;
			if (!rawAttrs) {
				this.rawAttrs = `id="${keyAttrs.id}"`;
			}
		}
		if (keyAttrs.class) {
			this.classNames = keyAttrs.class.split(/\s+/);
			if (!rawAttrs) {
				const cls = `class="${this.classNames.join(' ')}"`;
				if (this.rawAttrs) {
					this.rawAttrs += ` ${cls}`;
				} else {
					this.rawAttrs = cls;
				}
			}
		}
	}
	/**
	 * Remove Child element from childNodes array
	 * @param {HTMLElement} node     node to remove
	 */
	public removeChild(node: Node): void {
		this.childNodes = this.childNodes.filter((child) => {
			return (child !== node);
		});
	}
	/**
	 * Exchanges given child with new child
	 * @param {HTMLElement} oldNode     node to exchange
	 * @param {HTMLElement} newNode     new node
	 */
	public exchangeChild(oldNode: Node, newNode: Node): void {
		let idx = -1;
		for (let i = 0; i < this.childNodes.length; i++) {
			if (this.childNodes[i] === oldNode) {
				idx = i;
				break;
			}
		}
		this.childNodes[idx] = newNode;
	}
	/**
	 * Get escpaed (as-it) text value of current node and its children.
	 * @return {string} text content
	 */
	public get rawText(): string {
		return this.childNodes.reduce((pre, cur) => {
			return pre += cur._rawText;
		}, '');
	}
	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	public get text(): string {
		return decode(this.rawText);
	}
	/**
	 * Get structured Text (with '\n' etc.)
	 * @return {string} structured text
	 */
	public get structuredText(): string {
		let currentBlock = [] as string[];
		const blocks = [currentBlock];
		function dfs(node: Node) {
			if (node.nodeType === NodeType.elementNode) {
				if (kBlockElements[(node as HTMLElement).tagName]) {
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
			} else if (node.nodeType === NodeType.textNode) {
				if ((node as TextNode).isWhitespace) {
					// Whitespace node, postponed output
					/* eslint-disable @typescript-eslint/no-unsafe-member-access */
					(currentBlock as any).prependWhitespace = true;
				} else {
					let text = node._rawText;
					if ((currentBlock as any).prependWhitespace) {
						text = ' ' + text;
						(currentBlock as any).prependWhitespace = false;
					/* eslint-enable @typescript-eslint/no-unsafe-member-access */
					}
					currentBlock.push(text);
				}
			}
		}
		dfs(this);
		return blocks
			.map(function (block) {
				// Normalize each line's whitespace
				return block.join('').trim().replace(/\s{2,}/g, ' ');
			})
			.join('\n').replace(/\s+$/, '');	// trimRight;
	}

	public toString(): string {
		const tag = this.tagName;
		if (tag) {
			const isVoid = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag);
			const attrs = this.rawAttrs ? ' ' + this.rawAttrs : '';
			if (isVoid) {
				return `<${tag}${attrs}>`;
			} else {
				return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
			}
		} else {
			return this.innerHTML;
		}
	}

	public get innerHTML(): string {
		return this.childNodes.map((child) => {
			return child.toString();
		}).join('');
	}

	public setContent(content: string | Node | Node[], options = {} as Options): void {
		if (content instanceof Node) {
			content = [content];
		} else if (typeof content == 'string') {
			const r = parse(content, options);
			content = r.childNodes.length ? r.childNodes : [new TextNode(content)];
		}
		this.childNodes = content;
	}

	public get outerHTML(): string {
		return this.toString();
	}

	/**
	 * Trim element from right (in block) after seeing pattern in a TextNode.
	 * @param  {RegExp} pattern pattern to find
	 * @return {HTMLElement}    reference to current node
	 */
	public trimRight(pattern: RegExp): HTMLElement {
		for (let i = 0; i < this.childNodes.length; i++) {
			const childNode = this.childNodes[i];
			if (childNode.nodeType === NodeType.elementNode) {
				(childNode as HTMLElement).trimRight(pattern);
			} else {
				const index = childNode._rawText.search(pattern);
				if (index > -1) {
					childNode._rawText = childNode._rawText.substr(0, index);
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
	public get structure(): string {
		const res = [] as string[];
		let indention = 0;
		function write(str: string) {
			res.push('  '.repeat(indention) + str);
		}
		function dfs(node: HTMLElement) {
			const idStr = node.id ? ('#' + node.id) : '';
			const classStr = node.classNames.length ? ('.' + node.classNames.join('.')) : '';
			write(node.tagName + idStr + classStr);
			indention++;
			node.childNodes.forEach((childNode) => {
				if (childNode.nodeType === NodeType.elementNode) {
					dfs(childNode as HTMLElement);
				} else if (childNode.nodeType === NodeType.textNode) {
					if (!(childNode as TextNode).isWhitespace)
						write('#text');
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
	public removeWhitespace(): HTMLElement {
		let o = 0;
		this.childNodes.forEach((node) => {
			if (node.nodeType === NodeType.textNode) {
				if ((node as TextNode).isWhitespace) {
					return;
				}
				node._rawText = node._rawText.trim();
			} else if (node.nodeType === NodeType.elementNode) {
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
	 * @param  {Matcher}        selector A Matcher instance
	 * @return {HTMLElement[]}  matching elements
	 */
	public querySelectorAll(selector: string | Matcher): HTMLElement[] {
		let matcher: Matcher;
		if (selector instanceof Matcher) {
			matcher = selector;
			matcher.reset();
		} else {
			if (selector.includes(',')) {
				const selectors = selector.split(',');
				return Array.from(selectors.reduce((pre, cur) => {
					const result = this.querySelectorAll(cur.trim());
					return result.reduce((p, c) => {
						return p.add(c);
					}, pre);
				}, new Set<HTMLElement>()));
			}
			matcher = new Matcher(selector);
		}
		interface IStack {
			0: Node;	// node
			1: number;	// children
			2: boolean;	// found flag
		}
		const stack = [] as IStack[];
		return this.childNodes.reduce((res, cur) => {
			stack.push([cur, 0, false]);
			while (stack.length) {
				const state = arrBack(stack);	// get last element
				const el = state[0];
				if (state[1] === 0) {
					// Seen for first time.
					if (el.nodeType !== NodeType.elementNode) {
						stack.pop();
						continue;
					}
					const htmlEl = el as HTMLElement;
					state[2] = matcher.advance(htmlEl);
					if (state[2]) {
						if (matcher.matched) {
							res.push(htmlEl);
							res.push(...(htmlEl.querySelectorAll(selector)));
							// no need to go further.
							matcher.rewind();
							stack.pop();
							continue;
						}
					}
				}
				if (state[1] < el.childNodes.length) {
					stack.push([el.childNodes[state[1]++], 0, false]);
				} else {
					if (state[2]) {
						matcher.rewind();
					}
					stack.pop();
				}
			}
			return res;
		}, [] as HTMLElement[]);
	}

	/**
	 * Query CSS Selector to find matching node.
	 * @param  {string}         selector Simplified CSS selector
	 * @param  {Matcher}        selector A Matcher instance
	 * @return {HTMLElement}    matching node
	 */
	public querySelector(selector: string | Matcher): HTMLElement {
		let matcher: Matcher;
		if (selector instanceof Matcher) {
			matcher = selector;
			matcher.reset();
		} else {
			matcher = new Matcher(selector);
		}
		const stack = [] as { 0: Node; 1: 0 | 1; 2: boolean }[];
		for (const node of this.childNodes) {
			stack.push([node, 0, false]);
			while (stack.length) {
				const state = arrBack(stack);
				const el = state[0];
				if (state[1] === 0) {
					// Seen for first time.
					if (el.nodeType !== NodeType.elementNode) {
						stack.pop();
						continue;
					}
					state[2] = matcher.advance(el as HTMLElement);
					if (state[2]) {
						if (matcher.matched) {
							return el as HTMLElement;
						}
					}
				}
				if (state[1] < el.childNodes.length) {
					stack.push([el.childNodes[state[1]++], 0, false]);
				} else {
					if (state[2])
						matcher.rewind();
					stack.pop();
				}
			}
		}
		return null;
	}

	/**
	 * Append a child node to childNodes
	 * @param  {Node} node node to append
	 * @return {Node}      node appended
	 */
	public appendChild<T extends Node = Node>(node: T): T {
		// node.parentNode = this;
		this.childNodes.push(node);
		if (node instanceof HTMLElement) {
			node.parentNode = this;
		}
		return node;
	}

	/**
	 * Get first child node
	 * @return {Node} first child node
	 */
	public get firstChild(): Node {
		return this.childNodes[0];
	}

	/**
	 * Get last child node
	 * @return {Node} last child node
	 */
	public get lastChild(): Node {
		return arrBack(this.childNodes);
	}

	/**
	 * Get attributes
	 * @return {Object} parsed and unescaped attributes
	 */
	public get attributes(): Attributes {
		if (this._attrs) {
			return this._attrs;
		}
		this._attrs = {};
		const attrs = this.rawAttributes;
		for (const key in attrs) {
			const val = attrs[key] || '';
			this._attrs[key] = decode(val);
		}
		return this._attrs;
	}

	/**
	 * Get escaped (as-it) attributes
	 * @return {Object} parsed attributes
	 */
	public get rawAttributes(): RawAttributes {
		if (this._rawAttrs)
			return this._rawAttrs;
		const attrs = {} as RawAttributes;
		if (this.rawAttrs) {
			const re = /\b([a-z][a-z0-9\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;
			let match: RegExpExecArray;
			while (match = re.exec(this.rawAttrs)) {
				attrs[match[1]] = match[2] || match[3] || match[4] || null;
			}
		}
		this._rawAttrs = attrs;
		return attrs;
	}

	public removeAttribute(key: string): void {
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
			} else {
				return name + '=' + val;
			}
		}).join(' ');
	}

	public hasAttribute(key: string): boolean {
		return key in this.attributes;
	}

	/**
	 * Get an attribute
	 * @return {string} value of the attribute
	 */
	public getAttribute(key: string): string | undefined {
		return this.attributes[key];
	}

	/**
	 * Set an attribute value to the HTMLElement
	 * @param {string} key The attribute name
	 * @param {string} value The value to set, or null / undefined to remove an attribute
	 */
	public setAttribute(key: string, value: string): void {
		if (arguments.length < 2) {
			throw new Error('Failed to execute \'setAttribute\' on \'Element\'');
		}
		const attrs = this.rawAttributes;
		attrs[key] = String(value);
		if (this._attrs) {
			this._attrs[key] = decode(attrs[key]);
		}
		// Update rawString
		this.rawAttrs = Object.keys(attrs).map((name) => {
			const val = JSON.stringify(attrs[name]);
			if (val === 'null' || val === '""') {
				return name;
			} else {
				return name + '=' + val;
			}
		}).join(' ');
	}

	/**
	 * Replace all the attributes of the HTMLElement by the provided attributes
	 * @param {Attributes} attributes the new attribute set
	 */
	public setAttributes(attributes: Attributes): void {
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
			} else {
				return name + '=' + JSON.stringify(String(val));
			}
		}).join(' ');
	}

	public insertAdjacentHTML(where: InsertPosition, html: string): void {
		if (arguments.length < 2) {
			throw new Error('2 arguments required');
		}
		const p = parse(html) as HTMLElement;
		if (where === 'afterend') {
			p.childNodes.forEach((n) => {
				(this.parentNode as HTMLElement).appendChild(n);
			});
		} else if (where === 'afterbegin') {
			this.childNodes.unshift(...p.childNodes);
		} else if (where === 'beforeend') {
			p.childNodes.forEach((n) => {
				this.appendChild(n);
			});
		} else if (where === 'beforebegin') {
			(this.parentNode as HTMLElement).childNodes.unshift(...p.childNodes);
		} else {
			throw new Error(`The value provided ('${where as string}') is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'`);
		}
		if (!where || html === undefined || html === null) {
			return;
		}
	}
}

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const kMarkupPattern = /<!--[^]*?(?=-->)-->|<(\/?)([a-z][-.:0-9_a-z]*)\s*([^>]*?)(\/?)>/ig;
const kAttributePattern = /(^|\s)(id|class)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig;
const kSelfClosingElements = {
	area: true,
	base: true,
	br: true,
	col: true,
	hr: true,
	img: true,
	input: true,
	link: true,
	meta: true,
	source: true
};
const kElementsClosedByOpening = {
	li: { li: true },
	p: { p: true, div: true },
	b: { div: true },
	td: { td: true, th: true },
	th: { td: true, th: true },
	h1: { h1: true },
	h2: { h2: true },
	h3: { h3: true },
	h4: { h4: true },
	h5: { h5: true },
	h6: { h6: true }
};
const kElementsClosedByClosing = {
	li: { ul: true, ol: true },
	a: { div: true },
	b: { div: true },
	i: { div: true },
	p: { div: true },
	td: { tr: true, table: true },
	th: { tr: true, table: true }
};
const kBlockTextElements = {
	script: true,
	noscript: true,
	style: true,
	pre: true
};

export interface Options {
	lowerCaseTagName?: boolean;
	script?: boolean;
	style?: boolean;
	pre?: boolean;
	comment?: boolean;
}

const frameflag = 'documentfragmentcontainer';

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 * @param  {string} data      html
 * @return {HTMLElement}      root element
 */
export function parse(data: string, options?: Options): HTMLElement & { valid: boolean };
export function parse(data: string, options?: Options & { noFix: false }): HTMLElement & { valid: boolean };
export function parse(data: string, options?: Options & { noFix: true }): (HTMLElement | TextNode) & { valid: boolean };
export function parse(data: string, options = {} as Options & { noFix?: boolean }): (HTMLElement | TextNode) & { valid: boolean } {
	const root = new HTMLElement(null, {});
	let currentParent = root;
	const stack = [root];
	let lastTextPos = -1;
	let match: RegExpExecArray;
	// https://github.com/taoqf/node-html-parser/issues/38
	data = `<${frameflag}>${data}</${frameflag}>`;
	while (match = kMarkupPattern.exec(data)) {
		if (lastTextPos > -1) {
			if (lastTextPos + match[0].length < kMarkupPattern.lastIndex) {
				// if has content
				const text = data.substring(lastTextPos, kMarkupPattern.lastIndex - match[0].length);
				currentParent.appendChild(new TextNode(text));
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
				const text = data.substring(lastTextPos - 3, lastTextPos - match[0].length + 4);
				currentParent.appendChild(new CommentNode(text));
			}
			continue;
		}
		if (options.lowerCaseTagName) {
			match[2] = match[2].toLowerCase();
		}
		if (!match[1]) {
			// not </ tags
			const attrs = {};
			for (let attMatch; attMatch = kAttributePattern.exec(match[3]);) {
				attrs[attMatch[2]] = attMatch[4] || attMatch[5] || attMatch[6];
			}

			const tagName = currentParent.tagName as 'li' | 'p' | 'b' | 'td' | 'th' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			if (!match[4] && kElementsClosedByOpening[tagName]) {
				if (kElementsClosedByOpening[tagName][match[2]]) {
					stack.pop();
					currentParent = arrBack(stack);
				}
			}
			// ignore container tag we add above
			// https://github.com/taoqf/node-html-parser/issues/38
			currentParent = currentParent.appendChild(new HTMLElement(match[2], attrs, match[3]));
			stack.push(currentParent);
			if (kBlockTextElements[match[2]]) {
				// a little test to find next </script> or </style> ...
				const closeMarkup = '</' + match[2] + '>';
				const index = (() => {
					if (options.lowerCaseTagName) {
						return data.toLocaleLowerCase().indexOf(closeMarkup, kMarkupPattern.lastIndex);
					} else {
						return data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
					}
				})();
				if (options[match[2]]) {
					let text: string;
					if (index === -1) {
						// there is no matching ending for the text element.
						text = data.substr(kMarkupPattern.lastIndex);
					} else {
						text = data.substring(kMarkupPattern.lastIndex, index);
					}
					if (text.length > 0) {
						currentParent.appendChild(new TextNode(text));
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
				if (currentParent.tagName === match[2]) {
					stack.pop();
					currentParent = arrBack(stack);
					break;
				} else {
					const tagName = currentParent.tagName as 'li' | 'a' | 'b' | 'i' | 'p' | 'td' | 'th';
					// Trying to close current tag, and move on
					if (kElementsClosedByClosing[tagName]) {
						if (kElementsClosedByClosing[tagName][match[2]]) {
							stack.pop();
							currentParent = arrBack(stack);
							continue;
						}
					}
					// Use aggressive strategy to handle unmatching markups.
					break;
				}
			}
		}
	}
	type Response = (HTMLElement | TextNode) & { valid: boolean };
	const valid = !!(stack.length === 1);
	if (!options.noFix) {
		const response = root as Response;
		response.valid = valid;
		while (stack.length > 1) {
			// Handle each error elements.
			const last = stack.pop();
			const oneBefore = arrBack(stack);
			if (last.parentNode && (last.parentNode as HTMLElement).parentNode) {
				if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
					// Pair error case <h3> <h3> handle : Fixes to <h3> </h3>
					oneBefore.removeChild(last);
					last.childNodes.forEach((child) => {
						(oneBefore.parentNode as HTMLElement).appendChild(child);
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
		response.childNodes.forEach((node) => {
			if (node instanceof HTMLElement) {
				node.parentNode = null;
			}
		});
		return response;
	} else {
		const response = new TextNode(data) as Response;
		response.valid = valid;
		return response;
	}
}
