const { parse, valid } = require('@test/test-target');

describe('issue 294 Closing tag is missing but valid HTML still not parsable', function () {
	it('Valid HTML missing closing p tag should parse', function () {
    const content = '<body><main class=h-entry><p>hello</main></body>';
    valid(content).should.equal(true);
		const root = parse(content);
    root.outerHTML.should.equal('<body><main class=h-entry><p>hello</p></main></body>');
    const list = root.querySelectorAll('.h-entry');
    list.length.should.equal(1);
	});
});
