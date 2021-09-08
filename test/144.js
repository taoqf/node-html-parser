const { parse } = require('..');

describe('issue 144', function () {
	it('Nested A tags parsed improperly', function () {
		const html = `<a href="#">link <a href="#">nested link</a> end</a>`;
		const root = parse(html);
		root.innerHTML.should.eql(`<a href="#">link </a><a href="#">nested link</a> end`);
		root.childNodes.length.should.eql(3);
		const a1 = root.childNodes[0];
		a1.tagName.should.eql('A');
		a1.nodeType.should.eql(1);
		const a2 = root.childNodes[1];
		a2.nodeType.should.eql(1);
		const t1 = root.childNodes[2];
		t1.nodeType.should.eql(3);
		t1.textContent.should.eql(' end');
	});
});
