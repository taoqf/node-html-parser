import { decode, encode } from 'he';
import Node from './node';
import NodeType from './type';
import TextNode from './text';
import Matcher from '../matcher';
import { parse } from '../index';
import arr_back from '../back';

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
	public nodeType = NodeType.ELEMENT_NODE;
	/**
	 * Creates an instance of HTMLElement.
	 * @param keyAttrs	id and class attribute
	 * @param [rawAttrs]	attributes in string
	 *
	 * @memberof HTMLElement
	 */
	constructor(public tagName: string, keyAttrs: KeyAttributes, private rawAttrs = '', public parentNode = null as Node) {
		super();
		this.rawAttrs = rawAttrs || '';
		this.parentNode = parentNode || null;
		this.childNodes = [];
		if (keyAttrs.id) {
			this.id = keyAttrs.id;
		}
		if (keyAttrs.class) {
			this.classNames = keyAttrs.class.split(/\s+/);
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
	get rawText() {
		return this.childNodes.reduce((pre, cur) => {
			return pre += cur.rawText;
		}, '');
	}
	/**
	 * Get unescaped text value of current node and its children.
	 * @return {string} text content
	 */
	get text() {
		return decode(this.rawText);
	}
	/**
	 * Get structured Text (with '\n' etc.)
	 * @return {string} structured text
	 */
	get structuredText() {
		let currentBlock = [] as string[];
		const blocks = [currentBlock];
		function dfs(node: Node) {
			if (node.nodeType === NodeType.ELEMENT_NODE) {
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
			} else if (node.nodeType === NodeType.TEXT_NODE) {
				if ((node as TextNode).isWhitespace) {
					// Whitespace node, postponed output
					(currentBlock as any).prependWhitespace = true;
				} else {
					let text = node.text;
					if ((currentBlock as any).prependWhitespace) {
						text = ' ' + text;
						(currentBlock as any).prependWhitespace = false;
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

	public toString() {
		const tag = this.tagName;
		if (tag) {
			const is_un_closed = /^meta$/i.test(tag);
			const is_self_closed = /^(img|br|hr|area|base|input|doctype|link)$/i.test(tag);
			const attrs = this.rawAttrs ? ' ' + this.rawAttrs : '';
			if (is_un_closed) {
				return `<${tag}${attrs}>`;
			} else if (is_self_closed) {
				return `<${tag}${attrs} />`;
			} else {
				return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
			}
		} else {
			return this.innerHTML;
		}
	}

	get innerHTML() {
		return this.childNodes.map((child) => {
			return child.toString();
		}).join('');
	}

	public set_content(content: string | Node | Node[]) {
		if (content instanceof Node) {
			content = [content];
		} else if (typeof content == 'string') {
			const r = parse(content);
			content = r.childNodes.length ? r.childNodes : [new TextNode(content)];
		}
		this.childNodes = content;
	}

	get outerHTML() {
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
	get structure() {
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
				if (childNode.nodeType === NodeType.ELEMENT_NODE) {
					dfs(childNode as HTMLElement);
				} else if (childNode.nodeType === NodeType.TEXT_NODE) {
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
	public removeWhitespace() {
		let o = 0;
		this.childNodes.forEach((node) => {
			if (node.nodeType === NodeType.TEXT_NODE) {
				if ((node as TextNode).isWhitespace) {
					return;
				}
				node.rawText = node.rawText.trim();
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
		const stack = [] as { 0: Node; 1: 0 | 1; 2: boolean }[];
		return this.childNodes.reduce((res, cur) => {
			stack.push([cur, 0, false]);
			while (stack.length) {
				const state = arr_back(stack);
				const el = state[0];
				if (state[1] === 0) {
					// Seen for first time.
					if (el.nodeType !== NodeType.ELEMENT_NODE) {
						stack.pop();
						continue;
					}
					state[2] = matcher.advance(el as HTMLElement);
					if (state[2]) {
						if (matcher.matched) {
							res.push(el as HTMLElement);
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
	public querySelector(selector: string | Matcher) {
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
				const state = arr_back(stack);
				const el = state[0];
				if (state[1] === 0) {
					// Seen for first time.
					if (el.nodeType !== NodeType.ELEMENT_NODE) {
						stack.pop();
						continue;
					}
					state[2] = matcher.advance(el as HTMLElement);
					if (state[2]) {
						if (matcher.matched) {
							return el;
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
	public appendChild<T extends Node = Node>(node: T) {
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
	get firstChild() {
		return this.childNodes[0];
	}

	/**
	 * Get last child node
	 * @return {Node} last child node
	 */
	get lastChild() {
		return arr_back(this.childNodes);
	}

	/**
	 * Get attributes
	 * @return {Object} parsed and unescaped attributes
	 */
	get attributes() {
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
	get rawAttributes() {
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
			} else {
				return name + '=' + val;
			}
		}).join(' ');
	}

	public hasAttribute(key: string) {
		console.error(this.attributes, key);
		return key in this.attributes;
	}

	/**
	 * Get an attribute
	 * @return {string} value of the attribute
	 */
	public getAttribute(key: string) {
		return this.attributes[key];
	}

	/**
	 * Set an attribute value to the HTMLElement
	 * @param {string} key The attribute name
	 * @param {string} value The value to set
	 */
	setAttribute(key: string, value: string) {
		if (!key || arguments.length===1) {
			throw new Error(`setAttribute() requires two parameters, but ${!key ? 'key was '+key : 'value was undefined'}.`);
		}
		//Update the attributes map
		const attrs = this.attributes;
		attrs[key] = value+'';
		//Update the raw attributes
		if(this._rawAttrs) {
			this._rawAttrs[key] = encode(value+'');
		}
		//Update rawString
		this.rawAttrs = Object.keys(attrs).map(attr => attr+(attrs[attr]==='' ? '' : ('="'+encode(attrs[attr])+'"'))).join(' ');
	}

	/**
	 * Replace all the attributes of the HTMLElement by the provided attributes
	 * @param {Attributes} attributes the new attribute set
	 */
	setAttributes(attributes: Attributes) {
		if (!(attributes instanceof Object)) {
			throw new Error(`setAttributes() requires an Object as parameters but received ${typeof attributes}.`);
		}
		//Update the attributes map
		if(this.attributes) {
			Object.keys(this.attributes).forEach(key => delete this.attributes[key]);
			Object.keys(attributes).forEach(key => this.attributes[key] = attributes[key]+'');
		}
		//Update the raw attributes map
		if(this.rawAttributes) {
			Object.keys(this.rawAttributes).forEach(key => delete this.rawAttributes[key]);
			Object.keys(attributes).forEach(key => this.rawAttributes[key] = encode(attributes[key]+''));
		}
		//Update rawString
		this.rawAttrs = Object.keys(attributes).map(attr => attr+(attributes[attr]==='' ? '' : ('="'+encode(attributes[attr]+'')+'"'))).join(' ');
	}
}

