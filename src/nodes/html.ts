import { selectAll, selectOne } from 'css-select';
import he from 'he';
import arr_back from '../back';
import Matcher from '../matcher';
import VoidTag from '../void-tag';
import CommentNode from './comment';
import Node from './node';
import TextNode from './text';
import NodeType from './type';

type IRawTagName =
	| 'LI'
	| 'P'
	| 'B'
	| 'TD'
	| 'TH'
	| 'H1'
	| 'H2'
	| 'H3'
	| 'H4'
	| 'H5'
	| 'H6'
	| 'li'
	| 'p'
	| 'b'
	| 'td'
	| 'th'
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'h5'
	| 'h6';

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
export type NodeInsertable = Node | string;

// https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
const Htags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup'];
const Dtags = ['details', 'dialog', 'dd', 'div', 'dt'];
const Ftags = ['fieldset', 'figcaption', 'figure', 'footer', 'form'];
const tableTags = ['table', 'td', 'tr'];
const htmlTags = ['address', 'article', 'aside', 'blockquote', 'br', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'ul'];
const kBlockElements = new Set<string>();

function addToKBlockElement(...args: string[][]) {
	const addToSet = (array: string[]) => {
		for (let index = 0; index < array.length; index++) {
			const element = array[index];
			kBlockElements.add(element);
			kBlockElements.add(element.toUpperCase());
		}
	};

	for (const arg of args) addToSet(arg);
}

addToKBlockElement(Htags, Dtags, Ftags, tableTags, htmlTags);

class DOMTokenList {
	private _set: Set<string>;
	private _afterUpdate: (t: DOMTokenList) => void;
	private _validate(c: string) {
		if (/\s/.test(c)) {
			throw new Error(
				`DOMException in DOMTokenList.add: The token '${c}' contains HTML space characters, which are not valid in tokens.`
			);
		}
	}
	public constructor(valuesInit: string[] = [], afterUpdate: (t: DOMTokenList) => void = () => null) {
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
		this._set.delete(c) && this._afterUpdate(this); // eslint-disable-line @typescript-eslint/no-unsafe-call
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
	private _parseOptions: Partial<Options>;
	private _id: string;
	public rawTagName: string; // there is not friend funciton in es
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
		if (attr == null) {
			return 'null';
		}

		return JSON.stringify(attr.replace(/"/g, '&quot;'))
			.replace(/\\t/g, '\t')
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\/g, '');
	}

	/**
	 * Creates an instance of HTMLElement.
	 * @param keyAttrs	id and class attribute
	 * @param [rawAttrs]	attributes in string
	 *
	 * @memberof HTMLElement
	 */
	public constructor(
		tagName: string,
		keyAttrs: KeyAttributes,
		public rawAttrs = '',
		parentNode = null as HTMLElement | null,
		range?: [number, number],
		private voidTag = new VoidTag(),
		_parseOptions = {} as Partial<Options>
	) {
		super(parentNode, range);
		this.rawTagName = tagName;
		this.rawAttrs = rawAttrs || '';
		this._id = keyAttrs.id || '';
		this.childNodes = [];
		this._parseOptions = _parseOptions;
		this.classList = new DOMTokenList(
			keyAttrs.class ? keyAttrs.class.split(/\s+/) : [],
			(classList) => this.setAttribute('class', classList.toString()) // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
	 * Remove Child element from childNodes array
	 * @param {HTMLElement} node     node to remove
	 */
	public removeChild(node: Node) {
		this.childNodes = this.childNodes.filter((child) => {
			return child !== node;
		});
		return this;
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
		return this;
	}
	public get tagName() {
		return this.rawTagName ? this.rawTagName.toUpperCase() : this.rawTagName;
	}
	public set tagName(newname: string) {
		this.rawTagName = newname.toLowerCase();
	}
	public get localName() {
		return this.rawTagName.toLowerCase();
	}

	public get isVoidElement() {
		return this.voidTag.isVoidElement(this.localName);
	}

	public get id() {
		return this._id;
	}
	public set id(newid: string) {
		this.setAttribute('id', newid);
	}

	/**
	 * Get escpaed (as-it) text value of current node and its children.
	 * @return {string} text content
	 */
	public get rawText() {
		// https://github.com/taoqf/node-html-parser/issues/249
		if (/^br$/i.test(this.rawTagName)) {
			return '\n';
		}
		return this.childNodes.reduce((pre, cur) => {
			return (pre += cur.rawText);
		}, '');
	}
	public get textContent() {
		return decode(this.rawText);
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
				if (kBlockElements.has((node as HTMLElement).rawTagName)) {
					if (currentBlock.length > 0) {
						blocks.push((currentBlock = []));
					}
					node.childNodes.forEach(dfs);
					if (currentBlock.length > 0) {
						blocks.push((currentBlock = []));
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
		return blocks
			.map((block) => {
				return block.join('').replace(/\s{2,}/g, ' '); // Normalize each line's whitespace
			})
			.join('\n')
			.replace(/\s+$/, ''); // trimRight;
	}

	public toString() {
		const tag = this.rawTagName;
		if (tag) {
			const attrs = this.rawAttrs ? ` ${this.rawAttrs}` : '';
			return this.voidTag.formatNode(tag, attrs, this.innerHTML);
		}
		return this.innerHTML;
	}

	public get innerHTML() {
		return this.childNodes
			.map((child) => {
				return child.toString();
			})
			.join('');
	}

	public set innerHTML(content: string) {
		const r = parse(content, this._parseOptions);
		const nodes = r.childNodes.length ? r.childNodes : [new TextNode(content, this)];
		resetParent(nodes, this);
		resetParent(this.childNodes, null);
		this.childNodes = nodes;
	}

	public set_content(content: string | Node | Node[], options = {} as Partial<Options>) {
		if (content instanceof Node) {
			content = [content];
		} else if (typeof content == 'string') {
			options = { ...this._parseOptions, ...options };
			const r = parse(content, options);
			content = r.childNodes.length ? r.childNodes : [new TextNode(r.innerHTML, this)];
		}
		resetParent(this.childNodes, null);
		resetParent(content, this);
		this.childNodes = content;
		return this;
	}

	public replaceWith(...nodes: (string | Node)[]) {
		const parent = this.parentNode;
		const content = nodes
			.map((node) => {
				if (node instanceof Node) {
					return [node];
				} else if (typeof node == 'string') {
					const r = parse(node, this._parseOptions);
					return r.childNodes.length ? r.childNodes : [new TextNode(node, this)];
				}
				return [];
			})
			.flat();
		const idx = parent.childNodes.findIndex((child) => {
			return child === this;
		});
		resetParent([this], null);
		parent.childNodes = [...parent.childNodes.slice(0, idx), ...resetParent(content, parent), ...parent.childNodes.slice(idx + 1)];
		return this;
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
	 * @return {string} structure
	 */
	public get structure() {
		const res = [] as string[];
		let indention = 0;
		function write(str: string) {
			res.push('  '.repeat(indention) + str);
		}
		function dfs(node: HTMLElement) {
			const idStr = node._id ? `#${node._id}` : '';
			const classStr = node.classList.length ? `.${node.classList.value.join('.')}` : ''; // eslint-disable-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-call
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
				node.rawText = (<TextNode>node).trimmedRawText;
			} else if (node.nodeType === NodeType.ELEMENT_NODE) {
				(node as HTMLElement).removeWhitespace();
			}
			this.childNodes[o++] = node;
		});
		this.childNodes.length = o;

		// remove whitespace between attributes
		const attrs = Object.keys(this.rawAttributes)
			.map((key) => {
				const val = this.rawAttributes[key];
				return `${key}=${JSON.stringify(val)}`;
			})
			.join(' ');
		this.rawAttrs = attrs;
		delete this._rawAttrs;
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
			adapter: Matcher,
		});
	}

	/**
	 * Query CSS Selector to find matching node.
	 * @param  {string}         selector Simplified CSS selector
	 * @return {(HTMLElement|null)}    matching node
	 */
	public querySelector(selector: string): HTMLElement | null {
		return selectOne(selector, this as HTMLElement, {
			xmlMode: true,
			adapter: Matcher,
		});
	}

	/**
	 * find elements by their tagName
	 * @param {string} tagName the tagName of the elements to select
	 */
	public getElementsByTagName(tagName: string): Array<HTMLElement> {
		const upperCasedTagName = tagName.toUpperCase();
		const re: Array<Node> = [];
		const stack: Array<number> = [];

		let currentNodeReference = this as Node;
		let index: number | undefined = 0;

		// index turns to undefined once the stack is empty and the first condition occurs
		// which happens once all relevant children are searched through
		while (index !== undefined) {
			let child: HTMLElement | undefined;
			// make it work with sparse arrays
			do {
				child = currentNodeReference.childNodes[index++] as HTMLElement | undefined;
			} while (index < currentNodeReference.childNodes.length && child === undefined);

			// if the child does not exist we move on with the last provided index (which belongs to the parentNode)
			if (child === undefined) {
				currentNodeReference = currentNodeReference.parentNode;
				index = stack.pop();

				continue;
			}

			if (child.nodeType === NodeType.ELEMENT_NODE) {
				// https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName#syntax
				if (tagName === '*' || child.tagName === upperCasedTagName) re.push(child);

				// if children are existing push the current status to the stack and keep searching for elements in the level below
				if (child.childNodes.length > 0) {
					stack.push(index);
					currentNodeReference = child;
					index = 0;
				}
			}
		}

		return re as Array<HTMLElement>;
	}

	/**
	 * find element by it's id
	 * @param {string} id the id of the element to select
	 * @returns {HTMLElement | null} the element with the given id or null if not found
	 */
	public getElementById(id: string): HTMLElement | null {
		const stack: Array<number> = [];

		let currentNodeReference = this as Node;
		let index: number | undefined = 0;

		// index turns to undefined once the stack is empty and the first condition occurs
		// which happens once all relevant children are searched through
		while (index !== undefined) {
			let child: HTMLElement | undefined;
			// make it work with sparse arrays
			do {
				child = currentNodeReference.childNodes[index++] as HTMLElement | undefined;
			} while (index < currentNodeReference.childNodes.length && child === undefined);

			// if the child does not exist we move on with the last provided index (which belongs to the parentNode)
			if (child === undefined) {
				currentNodeReference = currentNodeReference.parentNode;
				index = stack.pop();

				continue;
			}

			if (child.nodeType === NodeType.ELEMENT_NODE) {
				if (child._id === id) {
					return child;
				}

				// if children are existing push the current status to the stack and keep searching for elements in the level below
				if (child.childNodes.length > 0) {
					stack.push(index);
					currentNodeReference = child;
					index = 0;
				}
			}
		}

		return null;
	}

	/**
	 * traverses the Element and its parents (heading toward the document root) until it finds a node that matches the provided selector string. Will return itself or the matching ancestor. If no such element exists, it returns null.
	 * @param selector a DOMString containing a selector list
	 * @returns {HTMLElement | null} the element with the given id or null if not found
	 */
	public closest(selector: string): HTMLElement | null {
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
					},
				},
			});
			if (e) {
				return e as HTMLElement;
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
		this.append(node);
		return node;
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
	 * Get escaped (as-is) attributes
	 * @return {Object} parsed attributes
	 */
	public get rawAttributes() {
		if (this._rawAttrs) {
			return this._rawAttrs;
		}
		const attrs = {} as RawAttributes;
		if (this.rawAttrs) {
			const re = /([a-zA-Z()[\]#@$.?:][a-zA-Z0-9-._:()[\]#]*)(?:\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+))?/g;
			let match: RegExpExecArray;
			while ((match = re.exec(this.rawAttrs))) {
				const key = match[1];
				let val = match[2] || null;
				if (val && (val[0] === `'` || val[0] === `"`)) val = val.slice(1, val.length - 1);
				attrs[key] = attrs[key] || val;
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
		this.rawAttrs = Object.keys(attrs)
			.map((name) => {
				const val = this.quoteAttribute(attrs[name]);
				if (val === 'null' || val === '""') return name;
				return `${name}=${val}`;
			})
			.join(' ');
		// Update this._id
		if (key === 'id') {
			this._id = '';
		}
		return this;
	}

	public hasAttribute(key: string) {
		return key.toLowerCase() in this.attrs;
	}

	/**
	 * Get an attribute
	 * @return {string | undefined} value of the attribute; or undefined if not exist
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
			throw new Error("Failed to execute 'setAttribute' on 'Element'");
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
		this.rawAttrs = Object.keys(attrs)
			.map((name) => {
				const val = this.quoteAttribute(attrs[name]);
				if (val === 'null' || val === '""') return name;
				return `${name}=${val}`;
			})
			.join(' ');
		// Update this._id
		if (key === 'id') {
			this._id = value;
		}
		return this;
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
		this.rawAttrs = Object.keys(attributes)
			.map((name) => {
				const val = attributes[name];
				if (val === 'null' || val === '""') return name;
				return `${name}=${this.quoteAttribute(String(val))}`;
			})
			.join(' ');
		// Update this._id
		if ('id' in attributes) {
			this._id = attributes['id'];
		}
		return this;
	}

	public insertAdjacentHTML(where: InsertPosition, html: string) {
		if (arguments.length < 2) {
			throw new Error('2 arguments required');
		}
		const p = parse(html, this._parseOptions);
		if (where === 'afterend') {
			this.after(...p.childNodes);
		} else if (where === 'afterbegin') {
			this.prepend(...p.childNodes);
		} else if (where === 'beforeend') {
			this.append(...p.childNodes);
		} else if (where === 'beforebegin') {
			this.before(...p.childNodes);
		} else {
			throw new Error(
				`The value provided ('${where as string}') is not one of 'beforebegin', 'afterbegin', 'beforeend', or 'afterend'`
			);
		}
		return this;
	}

	/** Prepend nodes or strings to this node's children. */
	public prepend(...insertable: NodeInsertable[]) {
		const nodes = resolveInsertable(insertable);
		resetParent(nodes, this);
		this.childNodes.unshift(...nodes);
	}
	/** Append nodes or strings to this node's children. */
	public append(...insertable: NodeInsertable[]) {
		const nodes = resolveInsertable(insertable);
		resetParent(nodes, this);
		this.childNodes.push(...nodes);
	}
	/** Insert nodes or strings before this node. */
	public before(...insertable: NodeInsertable[]) {
		const nodes = resolveInsertable(insertable);
		const siblings = this.parentNode.childNodes;
		resetParent(nodes, this.parentNode);
		siblings.splice(siblings.indexOf(this), 0, ...nodes);
	}
	/** Insert nodes or strings after this node. */
	public after(...insertable: NodeInsertable[]) {
		const nodes = resolveInsertable(insertable);
		const siblings = this.parentNode.childNodes;
		resetParent(nodes, this.parentNode);
		siblings.splice(siblings.indexOf(this) + 1, 0, ...nodes);
	}

	public get nextSibling(): Node | null {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			let i = 0;
			while (i < children.length) {
				const child = children[i++];
				if (this === child) return children[i] || null;
			}
			return null;
		}
	}

	public get nextElementSibling(): HTMLElement | null {
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

	public get previousSibling(): Node | null {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			let i = children.length;
			while (i > 0) {
				const child = children[--i];
				if (this === child) return children[i - 1] || null;
			}
			return null;
		}
	}

	public get previousElementSibling(): HTMLElement | null {
		if (this.parentNode) {
			const children = this.parentNode.childNodes;
			let i = children.length;
			let find = false;
			while (i > 0) {
				const child = children[--i];
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

	/** Get all childNodes of type {@link HTMLElement}. */
	public get children(): HTMLElement[] {
		const children = [];
		for (const childNode of this.childNodes) {
			if (childNode instanceof HTMLElement) {
				children.push(childNode);
			}
		}
		return children;
	}

	/**
	 * Get the first child node.
	 * @return The first child or undefined if none exists.
	 */
	public get firstChild(): Node | undefined {
		return this.childNodes[0];
	}
	/**
	 * Get the first child node of type {@link HTMLElement}.
	 * @return The first child element or undefined if none exists.
	 */
	public get firstElementChild(): HTMLElement | undefined {
		return this.children[0];
	}

	/**
	 * Get the last child node.
	 * @return The last child or undefined if none exists.
	 */
	public get lastChild(): Node | undefined {
		return arr_back(this.childNodes);
	}
	/**
	 * Get the last child node of type {@link HTMLElement}.
	 * @return The last child element or undefined if none exists.
	 */
	public get lastElementChild(): HTMLElement | undefined {
		return this.children[this.children.length - 1];
	}

	public get childElementCount(): number {
		return this.children.length;
	}

	public get classNames() {
		return this.classList.toString();
	}

	/** Clone this Node */
	public clone() {
		return parse(this.toString(), this._parseOptions).firstChild;
	}
}

// #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
const kMarkupPattern = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][-.:0-9_a-zA-Z@\xB7\xC0-\xD6\xD8-\xF6\u00F8-\u03A1\u03A3-\u03D9\u03DB-\u03EF\u03F7-\u03FF\u0400-\u04FF\u0500-\u052F\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E00-\u1E9B\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A-\u212B\u2132\u214E\u2160-\u2188\u2C60-\u2C7F\uA722-\uA787\uA78B-\uA78E\uA790-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA7FF\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64-\uAB65\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A\uFF41-\uFF5A\x37F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*)((?:\s+[^>]*?(?:(?:'[^']*')|(?:"[^"]*"))?)*)\s*(\/?)>/gu;
// const kMarkupPattern = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][-.:0-9_a-zA-Z]*)((?:\s+[^>]*?(?:(?:'[^']*')|(?:"[^"]*"))?)*)\s*(\/?)>/g;
const kAttributePattern = /(?:^|\s)(id|class)\s*=\s*((?:'[^']*')|(?:"[^"]*")|\S+)/gi;
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
	H6: { h6: true, H6: true },
} as Record<string, Record<string, boolean>>;
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
	TH: { tr: true, table: true, TR: true, TABLE: true },
} as Record<string, Record<string, boolean>>;

export interface Options {
	lowerCaseTagName?: boolean;
	comment?: boolean;
	/**
	 * @see PR #215 for explanation
	 */
	fixNestedATags?: boolean;
	parseNoneClosedTags?: boolean;
	blockTextElements: {
		[tag: string]: boolean;
	};
	voidTag?: {
		/**
		 * options, default value is ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
		 */
		tags?: string[];
		/**
		 * void tag serialisation, add a final slash <br/>
		 */
		closingSlash?: boolean;
	};
}

const frameflag = 'documentfragmentcontainer';

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 * @param  {string} data      html
 * @return {HTMLElement}      root element
 */
export function base_parse(data: string, options = {} as Partial<Options>) {
	const voidTag = new VoidTag(options?.voidTag?.closingSlash, options?.voidTag?.tags);
	const elements = options.blockTextElements || {
		script: true,
		noscript: true,
		style: true,
		pre: true,
	};
	const element_names = Object.keys(elements);
	const kBlockTextElements = element_names.map((it) => new RegExp(`^${it}$`, 'i'));
	const kIgnoreElements = element_names.filter((it) => Boolean(elements[it])).map((it) => new RegExp(`^${it}$`, 'i'));

	function element_should_be_ignore(tag: string) {
		return kIgnoreElements.some((it) => it.test(tag));
	}

	function is_block_text_element(tag: string) {
		return kBlockTextElements.some((it) => it.test(tag));
	}

	const createRange = (startPos: number, endPos: number): [number, number] => [startPos - frameFlagOffset, endPos - frameFlagOffset];
	const root = new HTMLElement(null, {}, '', null, [0, data.length], voidTag, options);

	let currentParent = root;
	const stack = [root];
	let lastTextPos = -1;
	let noNestedTagIndex: undefined | number = undefined;
	let match: RegExpExecArray;
	// https://github.com/taoqf/node-html-parser/issues/38
	data = `<${frameflag}>${data}</${frameflag}>`;
	const { lowerCaseTagName, fixNestedATags } = options;

	const dataEndPos = data.length - (frameflag.length + 2);
	const frameFlagOffset = frameflag.length + 2;

	while ((match = kMarkupPattern.exec(data))) {
		// Note: Object destructuring here consistently tests as higher performance than array destructuring
		// eslint-disable-next-line prefer-const
		let { 0: matchText, 1: leadingSlash, 2: tagName, 3: attributes, 4: closingSlash } = match;
		const matchLength = matchText.length;
		const tagStartPos = kMarkupPattern.lastIndex - matchLength;
		const tagEndPos = kMarkupPattern.lastIndex;

		// Add TextNode if content
		if (lastTextPos > -1) {
			if (lastTextPos + matchLength < tagEndPos) {
				const text = data.substring(lastTextPos, tagStartPos);
				currentParent.appendChild(new TextNode(text, currentParent, createRange(lastTextPos, tagStartPos)));
			}
		}

		lastTextPos = kMarkupPattern.lastIndex;

		// https://github.com/taoqf/node-html-parser/issues/38
		// Skip frameflag node
		if (tagName === frameflag) continue;

		// Handle comments
		if (matchText[1] === '!') {
			if (options.comment) {
				// Only keep what is in between <!-- and -->
				const text = data.substring(tagStartPos + 4, tagEndPos - 3);
				currentParent.appendChild(new CommentNode(text, currentParent, createRange(tagStartPos, tagEndPos)));
			}
			continue;
		}

		/* -- Handle tag matching -- */
		// Fix tag casing if necessary
		if (lowerCaseTagName) tagName = tagName.toLowerCase();

		// Handle opening tags (ie. <this> not </that>)
		if (!leadingSlash) {
			/* Populate attributes */
			const attrs = {} as Record<string, string>;
			for (let attMatch; (attMatch = kAttributePattern.exec(attributes));) {
				const { 1: key, 2: val } = attMatch;
				const isQuoted = val[0] === `'` || val[0] === `"`;
				attrs[key.toLowerCase()] = isQuoted ? val.slice(1, val.length - 1) : val;
			}

			const parentTagName = currentParent.rawTagName as IRawTagName;

			if (!closingSlash && kElementsClosedByOpening[parentTagName]) {
				if (kElementsClosedByOpening[parentTagName][tagName]) {
					stack.pop();
					currentParent = arr_back(stack);
				}
			}

			// Prevent nested A tags by terminating the last A and starting a new one : see issue #144
			if (fixNestedATags && (tagName === 'a' || tagName === 'A')) {
				if (noNestedTagIndex !== undefined) {
					stack.splice(noNestedTagIndex);
					currentParent = arr_back(stack);
				}
				noNestedTagIndex = stack.length;
			}

			const tagEndPos = kMarkupPattern.lastIndex;
			const tagStartPos = tagEndPos - matchLength;

			currentParent = currentParent.appendChild(
				// Initialize range (end position updated later for closed tags)
				new HTMLElement(tagName, attrs, attributes.slice(1), null, createRange(tagStartPos, tagEndPos), voidTag, options)
			);
			stack.push(currentParent);

			if (is_block_text_element(tagName)) {
				// Find closing tag
				const closeMarkup = `</${tagName}>`;
				const closeIndex = lowerCaseTagName
					? data.toLocaleLowerCase().indexOf(closeMarkup, kMarkupPattern.lastIndex)
					: data.indexOf(closeMarkup, kMarkupPattern.lastIndex);
				const textEndPos = closeIndex === -1 ? dataEndPos : closeIndex;

				if (element_should_be_ignore(tagName)) {
					const text = data.substring(tagEndPos, textEndPos);
					if (text.length > 0 && /\S/.test(text)) {
						currentParent.appendChild(new TextNode(text, currentParent, createRange(tagEndPos, textEndPos)));
					}
				}

				if (closeIndex === -1) {
					lastTextPos = kMarkupPattern.lastIndex = data.length + 1;
				} else {
					lastTextPos = kMarkupPattern.lastIndex = closeIndex + closeMarkup.length;
					// Cause to be treated as self-closing, because no close found
					leadingSlash = '/';
				}
			}
		}

		// Handle closing tags or self-closed elements (ie </tag> or <br>)
		if (leadingSlash || closingSlash || voidTag.isVoidElement(tagName)) {
			while (true) {
				if (noNestedTagIndex != null && (tagName === 'a' || tagName === 'A')) noNestedTagIndex = undefined;
				if (currentParent.rawTagName === tagName) {
					// Update range end for closed tag
					(<[number, number]>currentParent.range)[1] = createRange(-1, Math.max(lastTextPos, tagEndPos))[1];
					stack.pop();
					currentParent = arr_back(stack);
					break;
				} else {
					const parentTagName = currentParent.tagName as 'LI' | 'A' | 'B' | 'I' | 'P' | 'TD' | 'TH';
					// Trying to close current tag, and move on
					if (kElementsClosedByClosing[parentTagName]) {
						if (kElementsClosedByClosing[parentTagName][tagName]) {
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
export function parse(data: string, options = {} as Partial<Options>) {
	const stack = base_parse(data, options);

	const [root] = stack;
	while (stack.length > 1) {
		// Handle each error elements.
		const last = stack.pop();
		const oneBefore = arr_back(stack);
		if (last.parentNode && last.parentNode.parentNode) {
			if (last.parentNode === oneBefore && last.tagName === oneBefore.tagName) {
				// Pair error case <h3> <h3> handle : Fixes to <h3> </h3>
				// this is wrong, becouse this will put the H3 outside the current right position which should be inside the current Html Element, see issue 152 for more info
				if (options.parseNoneClosedTags !== true) {
					oneBefore.removeChild(last);
					last.childNodes.forEach((child) => {
						oneBefore.parentNode.appendChild(child);
					});
					stack.pop();
				}
			} else {
				// Single error  <div> <h3> </div> handle: Just removes <h3>
				// Why remove? this is already a HtmlElement and the missing <H3> is already added in this case. see issue 152 for more info
				// eslint-disable-next-line no-lonely-if
				if (options.parseNoneClosedTags !== true) {
					oneBefore.removeChild(last);
					last.childNodes.forEach((child) => {
						oneBefore.appendChild(child);
					});
				}
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

/**
 * Resolves a list of {@link NodeInsertable} to a list of nodes,
 * and removes nodes from any potential parent.
 */
function resolveInsertable(insertable: NodeInsertable[]): Node[] {
	return insertable.map((val) => {
		if (typeof val === 'string') {
			return new TextNode(val);
		}
		val.remove();
		return val;
	});
}

function resetParent(nodes: Node[], parent: HTMLElement) {
	return nodes.map((node) => {
		node.parentNode = parent;
		return node;
	});
}
