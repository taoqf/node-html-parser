import type HTMLElement from './nodes/html';
import type Node from './nodes/node';
import NodeType from './nodes/type';

/**
 * Minimal Adapter interface matching css-select's Adapter<Node, ElementNode>.
 * Defined locally because css-select v5 does not export its types publicly.
 */
interface Adapter {
	isTag: (node: Node) => node is HTMLElement;
	existsOne: (test: (elem: HTMLElement) => boolean, elems: Node[]) => boolean;
	getAttributeValue: (elem: HTMLElement, name: string) => string | undefined;
	getChildren: (node: Node) => Node[];
	getName: (elem: HTMLElement) => string;
	getParent: (node: HTMLElement) => Node | null;
	getSiblings: (node: Node) => Node[];
	getText: (node: Node) => string;
	hasAttrib: (elem: HTMLElement, name: string) => boolean;
	removeSubsets: (nodes: Node[]) => Node[];
	findAll: (test: (elem: HTMLElement) => boolean, nodes: Node[]) => HTMLElement[];
	findOne: (test: (elem: HTMLElement) => boolean, elems: Node[]) => HTMLElement | null;
}

function isTag(node: Node): node is HTMLElement {
	return node && node.nodeType === NodeType.ELEMENT_NODE;
}

function getAttributeValue(elem: HTMLElement, name: string) {
	return isTag(elem) ? elem.getAttribute(name) : undefined;
}

function getName(elem: HTMLElement) {
	return ((elem && elem.rawTagName) || '').toLowerCase();
}

function getChildren(node: Node) {
	return node && node.childNodes;
}

function getParent(node: Node): Node | null {
	return node ? node.parentNode : null;
}

function getText(node: Node) {
	return node.text;
}

function removeSubsets(nodes: Node[]) {
	let idx = nodes.length;
	let node;
	let ancestor;
	let replace;

	// Check if each node (or one of its ancestors) is already contained in the
	// array.
	while (--idx > -1) {
		node = ancestor = nodes[idx];

		// Temporarily remove the node under consideration
		nodes[idx] = null;
		replace = true;

		while (ancestor) {
			if (nodes.indexOf(ancestor) > -1) {
				replace = false;
				nodes.splice(idx, 1);
				break;
			}
			ancestor = getParent(ancestor);
		}

		// If the node has been found to be unique, re-insert it.
		if (replace) {
			nodes[idx] = node;
		}
	}

	return nodes;
}

function existsOne(test: (elem: HTMLElement) => boolean, elems: Node[]): boolean {
	return elems.some((elem) => {
		return isTag(elem) ? test(elem) || existsOne(test, getChildren(elem)) : false;
	});
}

function getSiblings(node: Node) {
	const parent = getParent(node);
	return parent ? getChildren(parent) : [];
}

function hasAttrib(elem: HTMLElement, name: string) {
	return getAttributeValue(elem, name) !== undefined;
}

function findOne(test: (elem: HTMLElement) => boolean, elems: Node[]) {
	let elem = null as HTMLElement | null;

	for (let i = 0, l = elems?.length; i < l && !elem; i++) {
		const el = elems[i];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		if ((test as (node: Node) => boolean)(el)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			elem = el as HTMLElement;
		} else {
			const childs = getChildren(el);
			if (childs && childs.length > 0) {
				elem = findOne(test, childs);
			}
		}
	}

	return elem;
}

function findAll(test: (elem: HTMLElement) => boolean, nodes: Node[]): HTMLElement[] {
	let result: HTMLElement[] = [];

	for (let i = 0, j = nodes.length; i < j; i++) {
		const node = nodes[i];
		if (!isTag(node)) continue;
		if (test(node)) result.push(node);
		const childs = getChildren(node);
		if (childs) result = result.concat(findAll(test, childs));
	}

	return result;
}

const matcher: Adapter = {
	isTag,
	getAttributeValue,
	getName,
	getChildren,
	getParent,
	getText,
	removeSubsets,
	existsOne,
	getSiblings,
	hasAttrib,
	findOne,
	findAll
};

export default matcher;
