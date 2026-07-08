const { parse } = require('@test/test-target');

describe('HTMLElement#textContent setter encodes special characters', function () {
	it('escapes HTML metacharacters when serialized', function () {
		const root = parse('<div></div>');
		const div = root.firstChild;
		div.textContent = '<b>Tom & Jerry</b>';
		div.innerHTML.should.eql('&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;');
		div.textContent.should.eql('<b>Tom & Jerry</b>');
	});
	it('round-trips a text value that looks like markup', function () {
		const root = parse('<div></div>');
		const div = root.firstChild;
		div.textContent = '<script>alert(1)</script>';
		const reparsed = parse(div.toString()).firstChild;
		reparsed.childNodes.should.have.length(1);
		reparsed.textContent.should.eql('<script>alert(1)</script>');
	});
});
