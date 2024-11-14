const { parse } = require('@test/test-target');
const fs = require('fs');

describe('issue 280', function () {
	it('parse specific link', function () {
		const html = fs.readFileSync(__dirname + '/280.html', 'utf-8');
		console.time('parseHTMLSpec');
		const root = parse(html);
		console.timeEnd('parseHTMLSpec');
		console.log('HTML parsed successfully.');
		console.log('Title:', root.querySelector('title').text);
		'a'.should.eql('a');
	});
});
