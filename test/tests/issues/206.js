const { parse } = require('@test/test-target');

// see: https://github.com/taoqf/node-html-parser/issues/206
describe('attributes starting with an underscore', function () {
	it('keeps the leading underscore in the attribute name', function () {
		const root = parse('<div _foo="bar" _ngcontent-c1="x">t</div>');
		const div = root.firstChild;
		div.getAttribute('_foo').should.eql('bar');
		div.getAttribute('_ngcontent-c1').should.eql('x');
		div.toString().should.eql('<div _foo="bar" _ngcontent-c1="x">t</div>');
	});
	it('supports the hyperscript "_" attribute', function () {
		const root = parse('<button _="on click toggle .red">Go</button>');
		const button = root.firstChild;
		button.getAttribute('_').should.eql('on click toggle .red');
		button.toString().should.eql('<button _="on click toggle .red">Go</button>');
	});
});
