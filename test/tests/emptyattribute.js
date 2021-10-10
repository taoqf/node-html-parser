const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/95
describe('empty attribute', function () {
	it('without attribute value', function () {
		const root = parse('<div foo></div>');
		const div = root.firstChild;
		div.getAttribute('foo').should.eql('');
		div.toString().should.eql('<div foo></div>');
	});
	it('with empty value', function () {
		const root = parse('<div foo=""></div>');
		const div = root.firstChild;
		div.getAttribute('foo').should.eql('');
		div.toString().should.eql('<div foo=""></div>');
	});
	it('with empty class', function () {
		const root = parse('<div class=""></div>');
		const div = root.firstChild;
		div.getAttribute('class').should.eql('');
		div.classNames.length.should.eql(0);
		div.toString().should.eql('<div class=""></div>');
	});
	it('attribute name is not exist', function () {
		const root = parse('<div class=""></div>');
		const div = root.firstChild;
		should.equal(div.getAttribute('foo'), undefined);
		div.classNames.length.should.eql(0);
		div.toString().should.eql('<div class=""></div>');
	});
});
