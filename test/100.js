const { parse } = require('../dist/cjs/index.js');

describe('#querySelectorAll', function () {
	it('nothing mached', function () {
		const root = parse('<div>foo<div class="a b" id="a">bar</div></div>');
		root.querySelectorAll('a').length.should.eql(0);
		should.equal(root.querySelector('a'), null);
		should.equal(root.querySelector('#b'), null);
		root.querySelectorAll('.a').length.should.eql(1);
		root.querySelectorAll('.b').length.should.eql(1);
		should.notEqual(root.querySelector('.a'), null);
		const nodelist = root.querySelectorAll('.a,.b');
		nodelist.length.should.eql(1);
		const div = nodelist[0];
		root.querySelector('.a,.b').should.eql(div);
		root.querySelector('#a').should.eql(div);
	});
});
