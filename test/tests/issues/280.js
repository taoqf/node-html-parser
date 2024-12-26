const { parse } = require('@test/test-target');
const { parse: parse6113 } = require('@test/test-6113');
const { parse: parse531 } = require('@test/test-531');
const fs = require('fs');

describe.skip('issue 280 Regression: Versions >= v5.3.2 are unable to parse specific link', function () {
	it('Versions: dev', function () {
		const html = fs.readFileSync(__dirname + '/../../assets/html/HTML Standard.html', 'utf-8');
		console.log('Fetched HTML. Attempting to parse...');
		console.time('parseHTMLSpec');
		const parsedHTML = parse(html);
		console.timeEnd('parseHTMLSpec');
		console.log('Title:', parsedHTML.querySelector('title').text);
		const title = parsedHTML.querySelector('title');
		title.text.should.equal('HTML Standard');
	});
	it('Versions: v5.3.1', function () {
		const html = fs.readFileSync(__dirname + '/../../assets/html/HTML Standard.html', 'utf-8');
		console.log('Fetched HTML. Attempting to parse...');
		console.time('parseHTMLSpec531');
		const parsedHTML = parse531(html);
		console.timeEnd('parseHTMLSpec531');
		console.log('Title:', parsedHTML.querySelector('title').text);
		const title = parsedHTML.querySelector('title');
		title.text.should.equal('HTML Standard');
	});
	it('Versions: v6.1.13', function () {
		const html = fs.readFileSync(__dirname + '/../../assets/html/HTML Standard.html', 'utf-8');
		console.log('Fetched HTML. Attempting to parse...');
		console.time('parseHTMLSpec6113');
		const parsedHTML = parse6113(html);
		console.timeEnd('parseHTMLSpec6113');
		console.log('Title:', parsedHTML.querySelector('title').text);
		const title = parsedHTML.querySelector('title');
		title.text.should.equal('HTML Standard');
	});
});
