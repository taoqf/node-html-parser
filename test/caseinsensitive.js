const { parse } = require('..');

// https://github.com/taoqf/node-html-parser/issues/75
describe('query should be case insensitive', function () {
	it('class should be case insensitive', function () {
		const root = parse('<dIv CLASS="a" data-KEY="val"></DiV>');
		root.querySelectorAll('.a').length.should.eql(1);
	});
	it('tagname name should be case insensitive', function () {
		const root = parse('<dIv CLASS="a" data-KEY="val"></DiV>');
		root.querySelectorAll('div').length.should.eql(1);
	});
	it('attribute name should be case insensitive', function () {
		const root = parse('<dIv CLASS="a" data-KEY="val"></DiV>');
		root.querySelectorAll('[data-key="val"]').length.should.eql(1);
	});
});
