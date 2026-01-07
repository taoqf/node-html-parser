const { parse, valid } = require('@test/test-target');

describe('issue 294 Closing tag is missing but valid HTML is still not parseable', function () {
	it('invalid HTML missing closing tag should not parse', function () {
		const content = '<body><main class=h-entry><p>hello</main></body>';
		valid(content).should.equal(false);
		const root = parse(content);
		const list = root.querySelectorAll('.h-entry');
		list.length.should.equal(0);
	});
	it('invalid HTML missing closing tag should parse', function () {
		const content = '<body><main class=h-entry><p>hello</main></body>';
		valid(content).should.equal(false);
		const root = parse(content, {
      closeAllByClosing: true
    });
		const list = root.querySelectorAll('.h-entry');
		list.length.should.equal(1);
	});
});
