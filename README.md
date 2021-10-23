# Fast HTML Parser [![NPM version](https://badge.fury.io/js/node-html-parser.png)](http://badge.fury.io/js/node-html-parser) [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Ftaoqf%2Fnode-html-parser%2Fbadge%3Fref%3Dmain&style=flat)](https://actions-badge.atrox.dev/taoqf/node-html-parser/goto?ref=main)

Fast HTML Parser is a _very fast_ HTML parser. Which will generate a simplified
DOM tree, with element query support.

Per the design, it intends to parse massive HTML files in lowest price, thus the
performance is the top priority.  For this reason, some malformatted HTML may not
be able to parse correctly, but most usual errors are covered (eg. HTML4 style
no closing `<li>`, `<td>` etc).

## Install


```shell
npm install --save node-html-parser
```

> Note: when using Fast HTML Parser in a Typescript project the minimum Typescript version supported is `^4.1.2`.

## Performance

Faster than htmlparser2!

```shell
htmlparser      :26.7111 ms/file ± 170.066
cheerio         :24.2480 ms/file ± 17.1711
parse5          :13.7239 ms/file ± 8.68561
high5           :7.75466 ms/file ± 5.33549
htmlparser2     :5.27376 ms/file ± 8.68456
node-html-parser:2.85768 ms/file ± 2.87784
```

Tested with [htmlparser-benchmark](https://github.com/AndreasMadsen/htmlparser-benchmark).

## Usage

```ts
import { parse } from 'node-html-parser';

const root = parse('<ul id="list"><li>Hello World</li></ul>');

console.log(root.firstChild.structure);
// ul#list
//   li
//     #text

console.log(root.querySelector('#list'));
// { tagName: 'ul',
//   rawAttrs: 'id="list"',
//   childNodes:
//    [ { tagName: 'li',
//        rawAttrs: '',
//        childNodes: [Object],
//        classNames: [] } ],
//   id: 'list',
//   classNames: [] }
console.log(root.toString());
// <ul id="list"><li>Hello World</li></ul>
root.set_content('<li>Hello World</li>');
root.toString();	// <li>Hello World</li>
```

```js
var HTMLParser = require('node-html-parser');

var root = HTMLParser.parse('<ul id="list"><li>Hello World</li></ul>');
```

## Global Methods

### parse(data[, options])

Parse given data, and return root of the generated DOM.

- **data**, data to parse
- **options**, parse options

  ```js
  {
    lowerCaseTagName: false,  // convert tag name to lower case (hurt performance heavily)
    comment: false,            // retrieve comments (hurt performance slightly)
    blockTextElements: {
      script: true,	// keep text content when parsing
      noscript: true,	// keep text content when parsing
      style: true,		// keep text content when parsing
      pre: true			// keep text content when parsing
    }
  }
  ```

### valid(data[, options])

Parse given data, return true if the givent data is valid, and return false if not.

## HTMLElement Methods

### HTMLElement#trimRight()

Trim element from right (in block) after seeing pattern in a TextNode.

### HTMLElement#removeWhitespace()

Remove whitespaces in this sub tree.

### HTMLElement#querySelectorAll(selector)

Query CSS selector to find matching nodes.

Note: Full css3 selector supported since v3.0.0.

### HTMLElement#querySelector(selector)

Query CSS Selector to find matching node.

### HTMLElement#getElementsByTagName(tagName)

Get all elements with the specified tagName.

Note: * for all elements.

### HTMLElement#closest(selector)

Query closest element by css selector.

### HTMLElement#appendChild(node)

Append a child node to childNodes

### HTMLElement#insertAdjacentHTML(where, html)

parses the specified text as HTML and inserts the resulting nodes into the DOM tree at a specified position.

### HTMLElement#setAttribute(key: string, value: string)

Set `value` to `key` attribute.

### HTMLElement#setAttributes(attrs: Record<string, string>)

Set attributes of the element.

### HTMLElement#removeAttribute(key: string)

Remove `key` attribute.

### HTMLElement#getAttribute(key: string)

Get `key` attribute.

### HTMLElement#exchangeChild(oldNode: Node, newNode: Node)

Exchanges given child with new child.

### HTMLElement#removeChild(node: Node)

Remove child node.

### HTMLElement#toString()

Same as [outerHTML](#htmlelementouterhtml)

### HTMLElement#set_content(content: string | Node | Node[])

Set content. **Notice**: Do not set content of the **root** node.

### HTMLElement#remove()

Remove current element.

### HTMLElement#replaceWith(...nodes: (string | Node)[])

Replace current element with other node(s).

### HTMLElement#classList

#### HTMLElement#classList.add

Add class name.

#### HTMLElement#classList.replace(old: string, new: string)

Replace class name with another one.

#### HTMLElement#classList.remove()

Remove class name.

#### HTMLElement#classList.toggle(className: string):void

Toggle class.

#### HTMLElement#classList.contains(className: string): boolean

Get if contains

#### HTMLElement#classList.values()

get class names

## HTMLElement Properties

### HTMLElement#text

Get unescaped text value of current node and its children. Like `innerText`.
(slow for the first time)

### HTMLElement#rawText

Get escaped (as-it) text value of current node and its children. May have
`&amp;` in it. (fast)

### HTMLElement#tagName

Get tag name of HTMLElement. Notice: the returned value would be an uppercase string.

### HTMLElement#structuredText

Get structured Text

### HTMLElement#structure

Get DOM structure

### HTMLElement#firstChild

Get first child node

### HTMLElement#lastChild

Get last child node

### HTMLElement#innerHTML

Set or Get innerHTML.

### HTMLElement#outerHTML

Get outerHTML.

### HTMLElement#nextSibling

Returns a reference to the next child node of the current element's parent.

### HTMLElement#nextElementSibling

Returns a reference to the next child element of the current element's parent.

### HTMLElement#textContent

Get or Set textContent of current element, more efficient than [set_content](#htmlelementset_contentcontent-string--node--node).

### HTMLElement#attributes

Get all attributes of current element. **Notice: do not try to change the returned value.**

### HTMLElement#classList

Get all attributes of current element. **Notice: do not try to change the returned value.**

### HTMLElement#range

Corresponding source code start and end indexes (ie [ 0, 40 ])
