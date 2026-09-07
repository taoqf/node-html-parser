const { parse } = require('@test/test-target');

describe('issue 315 unclosed dt/dd tags', function () {
	it('keeps the document tree when dt and dd omit their end tags', function () {
		const html = `<!DOCTYPE html>
<html>
<body>
<dl>
<dt>
<dd>
</dl>
</body>
</html>
`;
		const root = parse(html);
		root.querySelector('body').should.be.ok();
		root.querySelector('dl').should.be.ok();
		root.querySelectorAll('dt').length.should.eql(1);
		root.querySelectorAll('dd').length.should.eql(1);
		root.toString().should.containEql('<body>');
		root.toString().should.containEql('<dl>');
	});

	it('does not drop body when a lone dt is unclosed', function () {
		const root = parse('<!DOCTYPE html><html><body><dt></body></html>');
		root.querySelector('body').should.be.ok();
		root.querySelectorAll('dt').length.should.eql(1);
		root.toString().should.containEql('<body>');
	});

	it('closes an open dt when a dd starts', function () {
		const root = parse('<dl><dt>term<dd>def</dl>');
		root.querySelector('dt').text.should.eql('term');
		root.querySelector('dd').text.should.eql('def');
		root.querySelector('dl').childNodes.filter((n) => n.tagName).map((n) => n.tagName).should.eql(['DT', 'DD']);
	});
});
