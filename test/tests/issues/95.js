const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/95
describe('#textContent', function () {
	it('get text content', function () {
		const root = parse('<div>foo<div>bar</div></div>');
		root.textContent.should.eql('foobar');
	});
	it('set text content', function () {
		const root = parse('<div><a>foo</a>bar</div>');
		root.textContent.should.eql('foobar');
		const div = root.firstChild;
		div.textContent.should.eql('foobar');
		const a = div.firstChild;
		a.textContent.should.eql('foo');
		a.textContent = 'bar';
		a.textContent.should.eql('bar');
		div.textContent.should.eql('barbar');
		root.textContent.should.eql('barbar');
		root.toString().should.eql('<div><a>bar</a>bar</div>')
	});
	it('set text content using textnode', function () {
		const root = parse('<div>foo<div>');
		root.textContent.should.eql('foo');
		const div = root.firstChild;
		const textnode = div.firstChild;
		textnode.textContent.should.eql('foo');
		textnode.textContent = 'bar';
		textnode.textContent.should.eql('bar');
		div.textContent.should.eql('bar');
		root.textContent.should.eql('bar');
		root.toString().should.eql('<div>bar</div>')
	});
	it('replace childnodes with text content ', function () {
		const root = parse('<div><a>foo</a><b>bar</b><div>');
		root.textContent.should.eql('foobar');
		const div = root.firstChild;
		div.textContent.should.eql('foobar');
		const a = div.firstChild;
		a.textContent.should.eql('foo');
		const b = root.querySelector('b');
		b.textContent.should.eql('bar');
		b.textContent = 'foo'
		b.textContent.should.eql('foo');
		div.textContent.should.eql('foofoo');
		root.textContent.should.eql('foofoo');
		root.toString().should.eql('<div><a>foo</a><b>foo</b></div>')
	});
});
