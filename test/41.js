const { parse } = require('..');

// https://github.com/taoqf/node-html-parser/issues/41
describe('#exchangeChild()', function () {
	it('replace child current element', function () {
		const root1 = parse('<div><a></a></div>');
		const root2 = parse('<a id=el></a>');
		const div = root1.firstChild;
		div.exchangeChild(div.firstChild, root2.firstChild);
		root1.toString().should.eql('<div><a id=el></a></div>');
	});

	it('get next sibling', function () {
		const root = parse('<div><a></a><b></b>ccc</div>');
		const a = root.querySelector('a');
		const b = root.querySelector('b');
		a.nextSibling.should.eql(b);
		should.notEqual(b.nextSibling, null);
	});

	it('get next element sibling', function () {
		const root = parse('<div><a></a><b></b>ccc</div>');
		const a = root.querySelector('a');
		const b = root.querySelector('b');
		a.nextElementSibling.should.eql(b);
		should.equal(b.nextElementSibling, null);
	});
});
