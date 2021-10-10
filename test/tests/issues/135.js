const { parse } = require('@test/test-target');

describe('pr 135', function () {
	it('shoud not decode text', function () {
		const content = `&lt;p&gt; Not a p tag &lt;br /&gt; at all`;
		const root = parse(`<div>${content}</div>`);
		const div = root.firstChild;
		div.innerHTML.should.eql(content);
		div.textContent.should.eql('<p> Not a p tag <br /> at all');
		// div.innerText.should.eql('<p> Not a p tag <br /> at all');

		// const textNode = div.firstChild;
		// textNode.rawText.should.eql(content);
		// textNode.toString().should.eql('aaa')
	});

	it('should not decode text from parseHTML()', function () {
		const content = `&lt;p&gt; Not a p tag &lt;br /&gt; at all`;
		const root = parse(`<div>${content}</div>`);
		root.childNodes.should.have.length(1);

		const divNode = root.firstChild;
		divNode.childNodes.should.have.length(1);

		const textNode = divNode.firstChild;
		textNode.rawText.should.eql(content);
	});

	it(`should decode for node text property`, function () {
		const encodedText = `My&gt;text`;
		const decodedText = `My>text`;
		const root = parse(`<p>${encodedText}</p>`);

		const pNode = root.firstChild;
		pNode.innerHTML.should.eql(encodedText);
		pNode.textContent.should.eql(decodedText);

		const textNode = pNode.firstChild;
		textNode.textContent.should.eql(decodedText);
	});
});
