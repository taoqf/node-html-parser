const { parse, valid } = require('@test/test-target');

describe('Unclosed tags', function () {
	it('Unclosed tags should be closed at end of parent element', function () {
		const html = '<p>not bold<b>bold</p><p>more</p>';
		valid(html).should.be.true();
		const root = parse(html);
		root.outerHTML.should.equal('<p>not bold<b>bold</b></p><p>more</p>');
	});
	it('Nested unclosed tags should be closed at end of parent element', function () {
		const html = '<p>not bold<b>bold<i>bold italic</p><p>more</p>';
		valid(html).should.be.true();
		const root = parse(html);
		root.outerHTML.should.equal('<p>not bold<b>bold<i>bold italic</i></b></p><p>more</p>');
	});
});
