const { parse } = require('../dist/cjs/index.js');

describe.skip('issue 51', function () {
	it('vue: > in attibute value', function () {
		const html = '<template v-if="list.length>0"> <div> 123 </div> </template>';
		const root = parse(html);
		root.toString().should.eql(html);
		const tpl = root.firstChild;
		tpl.getAttribute('v-if').should.eql('list.length>0');
	});
});