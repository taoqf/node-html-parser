const { parse, valid } = require('@test/test-target');

describe('issue 302 optional table end tags', function () {
	for (const section of ['thead', 'tbody', 'tfoot']) {
		for (const cell of ['td', 'th']) {
			it(`closes an open ${cell} and tr when ${section} ends`, function () {
				const html = `<table><${section}><tr><${cell}>value</${section}></table>`;
				const root = parse(html);
				valid(html).should.equal(true);
				root.outerHTML.should.equal(`<table><${section}><tr><${cell}>value</${cell}></tr></${section}></table>`);
				root.querySelector('tr').parentNode.should.equal(root.querySelector(section));
			});
		}
	}

	it('closes an open cell, row, and tbody when the table ends', function () {
		const html = '<table><tbody><tr><td>value</table>';
		const root = parse(html);
		valid(html).should.equal(true);
		root.outerHTML.should.equal('<table><tbody><tr><td>value</td></tr></tbody></table>');
	});

	it('keeps nested tables inside their outer cell', function () {
		const html = '<table><tbody><tr><td>outer<table><tbody><tr><td>inner</table></table>';
		const root = parse(html);
		valid(html).should.equal(true);
		root.querySelectorAll('table').length.should.equal(2);
		const tables = root.querySelectorAll('table');
		tables[1].parentNode.should.equal(tables[0].querySelector('td'));
		root.outerHTML.should.equal(
			'<table><tbody><tr><td>outer<table><tbody><tr><td>inner</td></tr></tbody></table></td></tr></tbody></table>'
		);
	});
});
