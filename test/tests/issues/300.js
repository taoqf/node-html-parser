const { parse } = require('@test/test-target');

describe('issue 300', function () {
	it('does not keep the whitespace before the first attribute in rawAttrs', function () {
		const root = parse('<button\n   data-primary\n   type="button">Go</button>');
		const button = root.firstChild;
		button.rawAttrs.should.eql('data-primary\n   type="button"');
		button.getAttribute('type').should.eql('button');
	});

	it('serializes a first attribute on its own line with a single separating space', function () {
		const root = parse('<button\n   data-primary\n   type="button">Go</button>');
		root.toString().should.eql('<button data-primary\n   type="button">Go</button>');
	});

	it('collapses extra spaces and tabs before the first attribute', function () {
		parse('<a  \t href="/">x</a>').toString().should.eql('<a href="/">x</a>');
		parse('<img\n\tsrc="a.png">').toString().should.eql('<img src="a.png">');
	});

	it('leaves a first attribute on the tag line unchanged', function () {
		const html = '<button data-primary\n   type="button">Go</button>';
		parse(html).toString().should.eql(html);
	});
});
