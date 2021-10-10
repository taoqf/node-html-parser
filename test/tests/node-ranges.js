const { parse, HTMLElement, TextNode, CommentNode } = require('@test/test-target');
const hp2 = require('htmlparser2')
const mochaEach = require('mocha-each');

// Use https://astexplorer.net/ to compare
const html = `
Leading text


<div>
  <p>Text Content</p>
  Goes Here
</div>
<input name="hello">
<!-- comment -->
<style>
  .abc {
    display: none
  }
</style>
<pre>
  block Text
</pre>
<span>The space between us</span>      <span>is vast</span>
Closing text
`;

function prepare() {
  const nodeMeta = [];
  const abbreviate = (s, maxLen = 8) =>
    (s.length > maxLen ? s.slice(0, maxLen) + '...' : s).replace(/(\r?\n)/g, '\\n');

  // Parse AST
  const hp2ast = hp2.parseDocument(html, { withEndIndices: true, withStartIndices: true });
  const ast = parse(html, { comment: true });

  // Prepare flatNodes
  ast.childNodes.forEach((n, idx, arr) => walk(arr, idx, hp2ast.childNodes));

  return { nodeMeta, ast, hp2ast };

  function walk(nodeArr, idx, mirrorArr) {
    const node = nodeArr[idx];
    const mirrorNode = mirrorArr[idx];

    const label = mirrorNode.type !== 'tag' ? `<${mirrorNode.type}: '${abbreviate(node.text)}'>` : node.tagName;
    nodeMeta.push([ label, node, mirrorNode ]);

    node.childNodes.forEach((n, idx, arr) => walk(arr, idx, mirrorNode.childNodes));
  }
}

// See: https://github.com/taoqf/node-html-parser/issues/137
describe(`Elements ranges`, function () {
  const { nodeMeta, ast } = prepare();

  before(() => {
    // Pre-check to make sure configured html is not altered
    ast.childNodes.length.should.be.greaterThan(2);
  });

  describe(`parsed elements created with proper ranges`, () => {
    mochaEach(nodeMeta).it(`%s`, (label, node, hp2Node) => {
      /* Ensure we have the right node mapping */
      const expectedProto = hp2Node.type === 'comment' ? CommentNode :
                            hp2Node.type === 'text' ? TextNode :
                            HTMLElement;
      Object.getPrototypeOf(node).constructor.should.eql(expectedProto);
      if (expectedProto === HTMLElement) node.tagName.toLocaleLowerCase().should.eql(hp2Node.name.toLocaleLowerCase());

      // Check range
      node.range.should.eql([ hp2Node.startIndex, hp2Node.endIndex + 1 ]);
    });
  });

  it(`new nodes are created with [ -1, -1 ] range by default`, () => {
    const nodes = [
      new HTMLElement('B', {}, '', null),
      new TextNode('text', null),
      new CommentNode('text', null)
    ];

    for (const node of nodes) node.range.should.eql([ -1, -1 ]);
  });
});