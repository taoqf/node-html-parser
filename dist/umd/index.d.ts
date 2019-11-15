export declare enum NodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3
}
/**
 * Node Class as base class for TextNode and HTMLElement.
 */
export declare abstract class Node {
    nodeType: NodeType;
    childNodes: Node[];
    text: string;
    rawText: string;
    abstract toString(): String;
}
/**
 * TextNode to contain a text element in DOM tree.
 * @param {string} value [description]
 */
export declare class TextNode extends Node {
    constructor(value: string);
    /**
     * Node Type declaration.
     * @type {Number}
     */
    nodeType: NodeType;
    /**
     * Get unescaped text value of current node and its children.
     * @return {string} text content
     */
    readonly text: string;
    /**
     * Detect if the node contains only white space.
     * @return {bool}
     */
    readonly isWhitespace: boolean;
    toString(): string;
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
/**
 * HTMLElement, which contains a set of children.
 *
 * Note: this is a minimalist implementation, no complete tree
 *   structure provided (no parentNode, nextSibling,
 *   previousSibling etc).
 * @class HTMLElement
 * @extends {Node}
 */
export declare class HTMLElement extends Node {
    tagName: string;
    private rawAttrs;
    parentNode: Node;
    private _attrs;
    private _rawAttrs;
    id: string;
    classNames: string[];
    /**
     * Node Type declaration.
     */
    nodeType: NodeType;
    /**
     * Creates an instance of HTMLElement.
     * @param keyAttrs	id and class attribute
     * @param [rawAttrs]	attributes in string
     *
     * @memberof HTMLElement
     */
    constructor(tagName: string, keyAttrs: KeyAttributes, rawAttrs?: string, parentNode?: Node);
    /**
     * Remove Child element from childNodes array
     * @param {HTMLElement} node     node to remove
     */
    removeChild(node: Node): void;
    /**
     * Exchanges given child with new child
     * @param {HTMLElement} oldNode     node to exchange
     * @param {HTMLElement} newNode     new node
     */
    exchangeChild(oldNode: Node, newNode: Node): void;
    /**
     * Get escpaed (as-it) text value of current node and its children.
     * @return {string} text content
     */
    readonly rawText: string;
    /**
     * Get unescaped text value of current node and its children.
     * @return {string} text content
     */
    readonly text: string;
    /**
     * Get structured Text (with '\n' etc.)
     * @return {string} structured text
     */
    readonly structuredText: string;
    toString(): string;
    readonly innerHTML: string;
    set_content(content: string | Node | Node[]): void;
    readonly outerHTML: string;
    /**
     * Trim element from right (in block) after seeing pattern in a TextNode.
     * @param  {RegExp} pattern pattern to find
     * @return {HTMLElement}    reference to current node
     */
    trimRight(pattern: RegExp): this;
    /**
     * Get DOM structure
     * @return {string} strucutre
     */
    readonly structure: string;
    /**
     * Remove whitespaces in this sub tree.
     * @return {HTMLElement} pointer to this
     */
    removeWhitespace(): this;
    /**
     * Query CSS selector to find matching nodes.
     * @param  {string}         selector Simplified CSS selector
     * @param  {Matcher}        selector A Matcher instance
     * @return {HTMLElement[]}  matching elements
     */
    querySelectorAll(selector: string | Matcher): HTMLElement[];
    /**
     * Query CSS Selector to find matching node.
     * @param  {string}         selector Simplified CSS selector
     * @param  {Matcher}        selector A Matcher instance
     * @return {HTMLElement}    matching node
     */
    querySelector(selector: string | Matcher): HTMLElement;
    /**
     * Append a child node to childNodes
     * @param  {Node} node node to append
     * @return {Node}      node appended
     */
    appendChild<T extends Node = Node>(node: T): T;
    /**
     * Get first child node
     * @return {Node} first child node
     */
    readonly firstChild: Node;
    /**
     * Get last child node
     * @return {Node} last child node
     */
    readonly lastChild: Node;
    /**
     * Get attributes
     * @return {Object} parsed and unescaped attributes
     */
    readonly attributes: Attributes;
    /**
     * Get escaped (as-it) attributes
     * @return {Object} parsed attributes
     */
    readonly rawAttributes: RawAttributes;
}
/**
 * Matcher class to make CSS match
 *
 * @class Matcher
 */
export declare class Matcher {
    private matchers;
    private nextMatch;
    /**
     * Creates an instance of Matcher.
     * @param {string} selector
     *
     * @memberof Matcher
     */
    constructor(selector: string);
    /**
     * Trying to advance match pointer
     * @param  {HTMLElement} el element to make the match
     * @return {bool}           true when pointer advanced.
     */
    advance(el: Node): boolean;
    /**
     * Rewind the match pointer
     */
    rewind(): void;
    /**
     * Trying to determine if match made.
     * @return {bool} true when the match is made
     */
    readonly matched: boolean;
    /**
     * Rest match pointer.
     * @return {[type]} [description]
     */
    reset(): void;
    /**
     * flush cache to free memory
     */
    flushCache(): void;
}
/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 * @param  {string} data      html
 * @return {HTMLElement}      root element
 */
export declare function parse(data: string, options?: {
    lowerCaseTagName?: boolean;
    noFix?: boolean;
    script?: boolean;
    style?: boolean;
    pre?: boolean;
}): (TextNode & {
    valid: boolean;
}) | (HTMLElement & {
    valid: boolean;
});
