const { parse } = require('@test/test-target');

describe('character references in attribute values', function () {
	const html =
		'<a href="?x=1&notify=1&lang=en" title="&copy=2" data-a="&copyx" data-b="&amp;&lt;&copy;" data-c="&copy" data-d="&amp=">x</a><p>&copyx &notify</p>';

	it('keeps a legacy reference without ";" literal when "=" or an alphanumeric follows it', function () {
		const a = parse(html).firstChild;
		a.getAttribute('href').should.eql('?x=1&notify=1&lang=en');
		a.getAttribute('title').should.eql('&copy=2');
		a.getAttribute('data-a').should.eql('&copyx');
		a.getAttribute('data-d').should.eql('&amp=');
	});

	it('still decodes other references in attribute values', function () {
		const a = parse(html).firstChild;
		a.getAttribute('data-b').should.eql('&<©');
		a.getAttribute('data-c').should.eql('©');
	});

	it('applies the same rule to attributes and attrs', function () {
		const a = parse(html).firstChild;
		a.attributes.href.should.eql('?x=1&notify=1&lang=en');
		a.attrs.title.should.eql('&copy=2');
	});

	it('decodes text content as before', function () {
		parse(html).querySelector('p').textContent.should.eql('©x ¬ify');
	});
});
