const { parse, valid } = require('@test/test-target');
const { readFileSync } = require('fs');

describe('issue 294 Closing tag is missing but valid HTML still not parsable', function () {
	it('Valid HTML missing closing p tag should parse', function () {
		const adFile = readFileSync(__dirname + '/../../assets/html/adFile.html', 'utf-8');
		const parsed = parse(adFile, {
			parseNoneClosedTags: true
		});
		const propDiv = parsed.querySelector('div[itemProp="description"]');

		propDiv.should.not.equal(null);
		propDiv.tagName.should.equal('DIV');
		propDiv.getAttribute('itemProp').should.equal('description');
	});

	it('querySelectorAll should include div[itemProp="description"]', function () {
		const adFile = readFileSync(__dirname + '/../../assets/html/adFile.html', 'utf-8');
		const parsed = parse(adFile, {
			parseNoneClosedTags: true
		});
		const propDivs = parsed.querySelectorAll('div[itemProp="description"]');

		propDivs.length.should.be.greaterThan(0);
		propDivs[0].getAttribute('itemProp').should.equal('description');
	});
});
