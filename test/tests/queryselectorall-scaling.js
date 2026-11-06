const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/332
describe('querySelectorAll on large and deep documents', function () {
	it('returns matches in document order', function () {
		const root = parse(
			'<div id="a"><p id="b"><span id="c"></span></p><span id="d"></span></div><span id="e"><span id="f"></span></span>'
		);
		root.querySelectorAll('span').map((el) => el.id).should.eql(['c', 'd', 'e', 'f']);
		root.querySelectorAll('*').map((el) => el.id).should.eql(['a', 'b', 'c', 'd', 'e', 'f']);
	});

	it('stays linear in the number of siblings', function () {
		const count = 100000;
		const root = parse('<div>' + '<img src="x">'.repeat(count) + '</div>');
		const start = Date.now();
		root.querySelectorAll('img').length.should.eql(count);
		(Date.now() - start).should.be.below(1000);
	});

	it('handles deep nesting without overflowing the stack', function () {
		const depth = 10000;
		const root = parse('<div>'.repeat(depth) + 'x' + '</div>'.repeat(depth));
		root.querySelectorAll('div').length.should.eql(depth);
	});
});
