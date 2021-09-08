const { parse } = require('..');

describe('issue 48', function () {
	it('get decoded text', function () {
		const root = parse('<div>The king&#39;s hat is on fire!</div>');
		const div = root.querySelector('div');
		div.text.should.eql('The king\'s hat is on fire!');
	});
	it('get decoded text2', function () {
		const root = parse('<div>The king&apos;s hat is on fire!</div>');
		const div = root.querySelector('div');
		div.text.should.eql('The king\'s hat is on fire!');
	});
});
