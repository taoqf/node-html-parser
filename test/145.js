const { parse } = require('..');

describe('issue 145', function () {
	it('shoud parse attributes right', function () {
		const html = `<input matInput (keyup)="applyFilter($event)" placeholder="Ex. IMEI" #input>`;
		const root = parse(html);
		const div = root.firstChild;
		div.getAttribute('#input').should.eql('');
		div.getAttribute('(keyup)').should.eql('applyFilter($event)');
		div.getAttribute('placeholder').should.eql('Ex. IMEI');
		root.innerHTML.should.eql(html);
	});
});
