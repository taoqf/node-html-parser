# Fast HTML Parser [![NPM version](https://badge.fury.io/js/node-html-parser.png)](http://badge.fury.io/js/node-html-parser) [![Build Status](https://travis-ci.org/taoqf/node-html-parser.svg?branch=master)](https://travis-ci.org/taoqf/node-html-parser)

Fast HTML Parser is a _very fast_ HTML parser. Which will generate a simplified
DOM tree, with basic element query support.

Per the design, it intends to parse massive HTML files in lowest price, thus the
performance is the top priority.  For this reason, some malformatted HTML may not
be able to parse correctly, but most usual errors are covered (eg. HTML4 style
no closing `<li>`, `<td>` etc).

## Install

```shell
npm install --save node-html-parser
```

## Performance

Faster than htmlparser2!

```shell
node-html-parser:1.94548 ms/file ± 2.15709
libxmljs        :5.28893 ms/file ± 3.69863
htmlparser      :24.9625 ms/file ± 168.380
htmlparser2     :3.34011 ms/file ± 4.76959
parse5          :13.9589 ms/file ± 9.84068
high5           :6.98078 ms/file ± 4.47575
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
root.setContent('<li>Hello World</li>');
root.toString();	// <li>Hello World</li>
```

```js
var HTMLParser = require('node-html-parser');

var root = HTMLParser.parse('<ul id="list"><li>Hello World</li></ul>');
```

## API

### parse(data[, options])

Parse given data, and return root of the generated DOM.

- **data**, data to parse
- **options**, parse options

  ```js
  {
    lowerCaseTagName: false,  // convert tag name to lower case (hurt performance heavily)
    script: false,            // retrieve content in <script> (hurt performance slightly)
    style: false,             // retrieve content in <style> (hurt performance slightly)
    pre: false,               // retrieve content in <pre> (hurt performance slightly)
    comment: false            // retrieve comments (hurt performance slightly)
  }
  ```

### HTMLElement#text

Get unescaped text value of current node and its children. Like `innerText`.
(slow for the first time)

### HTMLElement#rawText

Get escpaed (as-it) text value of current node and its children. May have
`&amp;` in it. (fast)

### HTMLElement#structuredText

Get structured Text

### HTMLElement#trimRight()

Trim element from right (in block) after seeing pattern in a TextNode.

### HTMLElement#structure

Get DOM structure

### HTMLElement#removeWhitespace()

Remove whitespaces in this sub tree.

### HTMLElement#querySelectorAll(selector)

Query CSS selector to find matching nodes.

Note: only `tagName`, `#id`, `.class` selectors supported. And not behave the
same as standard `querySelectorAll()` as it will _stop_ searching sub tree after
find a match.

### HTMLElement#querySelector(selector)

Query CSS Selector to find matching node.

### HTMLElement#appendChild(node)

Append a child node to childNodes

### HTMLElement#insertAdjacentHTML(where, html)

parses the specified text as HTML and inserts the resulting nodes into the DOM tree at a specified position.

### HTMLElement#firstChild

Get first child node

### HTMLElement#lastChild

Get last child node

### HTMLElement#setAttribute(key: string, value: string)

Set `value` to `key` attribute.

### HTMLElement#removeAttribute(key: string)

Remove `key` attribute.

### HTMLElement#getAttribute(key: string)

Get `key` attrubte.

### HTMLElement#toString()

Same as [outerHTML](#htmlelementouterhtml)

### HTMLElement#innerHTML

Get innerHTML.

### HTMLElement#outerHTML

Get outerHTML.

### HTMLElement#setContent(content: string | Node | Node[])

Set content. **Notice**: Do not set content of the **root** node.
