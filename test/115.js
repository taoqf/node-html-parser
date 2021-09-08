const { parse } = require('../dist/cjs/index.js');

describe('issue 115', function () {
	it('parse html', async function () {
		const html = '<p>Hello <strong>world</strong>!</p>';
		const root = parse(html);
		root.firstChild.innerText.should.eql('Hello world!');
	});
});
