const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/324
describe('issue 324 toString of deeply nested html', function () {
	it('serializes deep nesting without overflowing the stack', function () {
		const depth = 10000;
		const html = '<div>'.repeat(depth) + 'x' + '</div>'.repeat(depth);
		const root = parse(html);
		root.toString().should.eql(html);
		root.firstChild.outerHTML.should.eql(html);
		root.innerHTML.should.eql(html);
	});
	it('keeps void tags, comments and attributes', function () {
		const html = '<p class="a">x<br><!-- c --><img src="i.png"><span>y</span></p>';
		const root = parse(html, { comment: true });
		root.toString().should.eql(html);
		root.firstChild.innerHTML.should.eql('x<br><!-- c --><img src="i.png"><span>y</span>');
	});
});
