const { parse } = require('../dist/cjs/index.js');

describe('self-close tag', function () {
	it('should not teat textarea as self-colse tag', async function () {
		const html = '<textarea id="input_3"></textarea>';
		const root = parse(html);
		root.toString().should.eql(html);
	});
	it('input is self-closing', async function () {
		const html = '<input value="foo" />';
		const root = parse(html);
		root.toString().should.eql('<input value="foo" >');
	});
});
