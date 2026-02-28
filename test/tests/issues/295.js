const { parse } = require('@test/test-target');

describe('issue 295 Invalid HTML element nesting', function () {
	it('Valid HTML nesting kept', function () {
		// valid HTML - nesting kept
		const root = parse(`<div>foo<div>bar</div></div>`);
		root.outerHTML.should.equal('<div>foo<div>bar</div></div>');
	});
	it('Valid HTML p nested inside of p', function () {
		// invalid HTML (p nested inside of p) - nesting changed
		const root = parse(`<p>foo<p>bar</p></p>`, { preserveTagNesting: true });
		root.outerHTML.should.equal('<p>foo<p>bar</p></p>');
	});
	it('Valid HTML ul nested inside of p', function () {
		// invalid HTML (ul nested inside of p) - nesting kept
		const root = parse(`<p>foo<ul><li>bar</li></ul></p>`);
		root.outerHTML.should.equal('<p>foo<ul><li>bar</li></ul></p>');
	});
});
