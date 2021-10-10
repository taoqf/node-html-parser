const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/85
describe('#remove()', function () {
	it('remove current element', function () {
		const root = parse('<div><a id=el></a></div>');
		const div = root.firstChild;
		const a = root.querySelector('#el');
		div.childNodes.length.should.eql(1);
		a.remove();
		div.childNodes.length.should.eql(0);
		root.toString().should.eql('<div></div>')
	});

	it('remove element not in html', function () {
		const root = parse('<div></div><a id=el></a>');
		const a = root.querySelector('#el');
		// root.childNodes[0].should.eql('abc');
		// root.childNodes[0].childNodes[0].should.eql('abc');
		root.childNodes.length.should.eql(2);
		a.remove();
		root.childNodes.length.should.eql(1);
		root.toString().should.eql('<div></div>')
	});

	it('remove current element without method remove', function () {
		const root = parse('<div><a id=el></a></div>');
		const div = root.firstChild;
		const a = root.querySelector('#el');
		div.childNodes.length.should.eql(1);
		const children = div.childNodes;
		div.childNodes = children.filter((child) => {
			return a !== child;
		});
		div.childNodes.length.should.eql(0);
	});
});
