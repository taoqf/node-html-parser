const { valid } = require('@test/test-target');

describe('issue 227', function () {
	it('valid tags', function () {
		valid('<p abc</p').should.be.false(); // false
		valid('<div<p abc</p></span>').should.be.false(); // false
		valid('<div><p abc</p></div>').should.be.true(); // true
		valid('<div<p abc</a></div>').should.be.true(); // true
		valid('@#><p').should.be.true(); // true
		valid('<<>').should.be.true(); // true
	});
});
