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

	for (const options of [{}, { parseNoneClosedTags: true }, { closeAllByClosing: true }]) {
		it(`keeps successive rows as siblings with options ${JSON.stringify(options)}`, function () {
			const html = '<table><tbody><tr><td>A<td>1<tr><td>B<td>2</tbody></table>';
			const root = parse(html, options);
			valid(html, options).should.equal(true);
			const tbody = root.querySelector('tbody');
			const rows = root.querySelectorAll('tr');
			rows.map((row) => row.children.map((cell) => cell.text)).should.eql([
				['A', '1'],
				['B', '2'],
			]);
			rows.forEach((row) => row.parentNode.should.equal(tbody));
		});
	}

	for (const [previous, next] of [
		['thead', 'tbody'],
		['thead', 'tfoot'],
		['tbody', 'tbody'],
		['tbody', 'tfoot'],
	]) {
		it(`closes an open cell, row, and ${previous} when ${next} starts`, function () {
			const html = `<table><${previous}><tr><td>first<${next}><tr><td>second</${next}></table>`;
			const root = parse(html);
			valid(html).should.equal(true);
			root.querySelector('table')
				.children.map((section) => section.rawTagName)
				.should.eql([previous, next]);
			root.querySelectorAll('tr')
				.map((row) => row.text)
				.should.eql(['first', 'second']);
		});
	}

	it('parses the table from issue 302 without losing its rows', function () {
		const html = '<table><thead><tr><th>Name<th>Value<tbody><tr><td>A<td>1<tr><td>B<td>2</table>';
		const root = parse(html);
		valid(html).should.equal(true);
		root.querySelectorAll('tr')
			.map((row) => row.children.map((cell) => cell.text))
			.should.eql([
				['Name', 'Value'],
				['A', '1'],
				['B', '2'],
			]);
		root.querySelector('table')
			.children.map((section) => section.rawTagName)
			.should.eql(['thead', 'tbody']);
	});

	it('does not close outer rows when another row starts inside a nested table', function () {
		const html = '<table><tbody><tr><td>outer<table><tbody><tr><td>inner<tr><td>next</table><tr><td>last</table>';
		const root = parse(html);
		valid(html).should.equal(true);
		const tables = root.querySelectorAll('table');
		const outerRows = tables[0].querySelector('tbody').children;
		const innerRows = tables[1].querySelector('tbody').children;
		outerRows.length.should.equal(2);
		innerRows.map((row) => row.text).should.eql(['inner', 'next']);
		tables[1].parentNode.should.equal(outerRows[0].firstElementChild);
		outerRows[1].text.should.equal('last');
	});

	it('respects preserveTagNesting when a new row starts', function () {
		const root = parse('<table><tr><td>first<tr><td>second</table>', { preserveTagNesting: true });
		const rows = root.querySelectorAll('tr');
		rows.length.should.equal(2);
		rows[1].parentNode.should.equal(rows[0].firstElementChild);
	});

	for (const lowerCaseTagName of [false, true]) {
		it(`handles uppercase table tags with lowerCaseTagName=${lowerCaseTagName}`, function () {
			const html = '<TABLE><THEAD><TR><TH>Head<TBODY><TR><TD>first<TR><TD>second</TABLE>';
			const options = { lowerCaseTagName };
			const root = parse(html, options);
			valid(html, options).should.equal(true);
			root.querySelectorAll('tr')
				.map((row) => row.text)
				.should.eql(['Head', 'first', 'second']);
			root.querySelector('table')
				.children.map((section) => section.rawTagName)
				.should.eql(lowerCaseTagName ? ['thead', 'tbody'] : ['THEAD', 'TBODY']);
		});
	}
});
