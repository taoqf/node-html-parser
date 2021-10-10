const { parse } = require('@test/test-target');

describe('issue 42', function () {
	it('svg attribute', function () {
		const root = parse('<p a=12 data-id="!$$&amp;" yAz=\'1\' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></p>');
		const p = root.querySelector('p');
		p.getAttribute('xmlns:xlink').should.eql('http://www.w3.org/1999/xlink');
	});
});
