const { parse } = require('@test/test-target');

describe('issue 136', function () {
	it('parse the parent html tag when its attributes has an html tag on it', function () {
		// Reference https://github.com/taoqf/node-html-parser/issues/136#issue-937045796
		const html = '<a testArg="<a>test</a>" secondArg="some_thing">some test content</a>';
		const root = parse(html);
		root.toString().should.eql(html);
		const tpl = root.firstChild;
		tpl.getAttribute('testArg').should.eql('<a>test</a>');
		tpl.getAttribute('secondArg').should.eql('some_thing');
		tpl.textContent.should.eql('some test content');
		tpl.rawAttrs.should.eql('testArg="<a>test</a>" secondArg="some_thing"');
		tpl.tagName.should.eql('A');
	});
});
