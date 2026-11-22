const { parse } = require('@test/test-target');

describe('attribute names are case-insensitive', function () {
	it('removeAttribute removes an attribute written in another case', function () {
		const div = parse('<div Title="t" data-x="1"></div>').firstChild;
		div.removeAttribute('title');
		div.toString().should.eql('<div data-x="1"></div>');
		div.hasAttribute('title').should.eql(false);
	});
	it('removeAttribute accepts a name in another case', function () {
		const div = parse('<div title="t"></div>').firstChild;
		div.getAttribute('title').should.eql('t');
		div.removeAttribute('TITLE');
		div.toString().should.eql('<div></div>');
		div.hasAttribute('title').should.eql(false);
	});
	it('removeAttribute keeps id in sync for an uppercase ID attribute', function () {
		const div = parse('<div ID="a"></div>').firstChild;
		div.removeAttribute('id');
		div.toString().should.eql('<div></div>');
		div.id.should.eql('');
	});
	it('removeAttribute("ID") clears id', function () {
		const div = parse('<div id="a"></div>').firstChild;
		div.removeAttribute('ID');
		div.toString().should.eql('<div></div>');
		div.id.should.eql('');
	});
	it('setAttribute updates id for an uppercase ID attribute', function () {
		const div = parse('<div ID="a"></div>').firstChild;
		div.setAttribute('id', 'b');
		div.toString().should.eql('<div ID="b"></div>');
		div.id.should.eql('b');
	});
});
