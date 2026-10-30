const { parse } = require('@test/test-target');

// In the HTML tokenizer's "attribute value (unquoted) state" a `/` is part of the value,
// only whitespace and `>` end it: https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(unquoted)-state
describe('unquoted attribute value ending with a slash', function () {
	it('keeps the slash in the value and does not self-close the element', function () {
		const root = parse('<a href=/foo/>x</a>');
		const a = root.firstChild;
		a.getAttribute('href').should.eql('/foo/');
		a.rawAttrs.should.eql('href=/foo/');
		a.text.should.eql('x');
		root.toString().should.eql('<a href=/foo/>x</a>');
	});

	it('keeps the link text inside the element for absolute URLs', function () {
		const root = parse('<p><a href=http://example.com/>Example</a> and <a href=/docs/>docs</a></p>');
		const links = root.querySelectorAll('a');
		links.length.should.eql(2);
		links[0].text.should.eql('Example');
		links[1].text.should.eql('docs');
		root.toString().should.eql('<p><a href=http://example.com/>Example</a> and <a href=/docs/>docs</a></p>');
	});

	it('works for id and class values, which are parsed eagerly', function () {
		const root = parse('<div id=foo/>text</div>');
		root.firstChild.id.should.eql('foo/');
		root.firstChild.text.should.eql('text');
	});

	it('works when it is not the first attribute and when the value contains slashes', function () {
		const root = parse('<a class=x href=/a/b/>x</a>');
		const a = root.firstChild;
		a.getAttribute('href').should.eql('/a/b/');
		a.text.should.eql('x');
	});

	it('is unchanged when the slash is separated from the value by whitespace', function () {
		const a = parse('<a href=/foo/ >x</a>').firstChild;
		a.getAttribute('href').should.eql('/foo/');
		a.text.should.eql('x');
		// a space before the slash is a self-closing start tag in the tokenizer, as before
		const sc = parse('<a href=/foo />x').firstChild;
		sc.getAttribute('href').should.eql('/foo');
		sc.childNodes.length.should.eql(0);
	});

	it('is unchanged for quoted values and for attributes without a value', function () {
		const quoted = parse('<a href="/foo/"/>x').firstChild;
		quoted.getAttribute('href').should.eql('/foo/');
		quoted.childNodes.length.should.eql(0);
		const bare = parse('<custom-el disabled/>x').firstChild;
		bare.hasAttribute('disabled').should.eql(true);
		bare.childNodes.length.should.eql(0);
	});

	it('leaves void elements lenient: <img src=a.png/> is still a self-closed tag', function () {
		const root = parse('<p><img src=a.png/>after</p>');
		const img = root.querySelector('img');
		img.getAttribute('src').should.eql('a.png');
		img.childNodes.length.should.eql(0);
		root.querySelector('p').text.should.eql('after');
	});
});
