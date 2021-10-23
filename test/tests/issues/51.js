const { parse } = require('@test/test-target');

describe('issue 51', function () {
	it('vue: > in attibute value', function () {
		// Reference https://github.com/taoqf/node-html-parser/issues/51#issue-636325007
		const html = '<template v-if="list.length>0"> <div>123</div> </template>';
		const root = parse(html);
		root.toString().should.eql(html);
		const tpl = root.firstChild;

		tpl.getAttribute('v-if').should.eql('list.length>0');
		should.equal(tpl.rawAttrs, 'v-if="list.length>0"');
		should.equal(tpl.tagName, 'TEMPLATE');

		const div = tpl.childNodes[1];
		div.textContent.should.eql('123');
		console.log(div.textContent);
	});
});
