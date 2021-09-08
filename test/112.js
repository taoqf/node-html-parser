const { parse, HTMLElement } = require('../dist/cjs/index.js');

// https://github.com/taoqf/node-html-parser/pull/112
describe('pull/112', function () {
	it('this.id is set to an empty string', async function () {
		const el = new HTMLElement('div', {}, '', null);
		el.id.should.eql('')
		should.equal(el.getAttribute('id'), undefined);
		el.toString().should.eql('<div></div>');
	});
	it('this.id is set to the value of keyAttrs', async function () {
		const el = new HTMLElement('div', { id: 'id' }, 'id="id"', null);
		el.id.should.eql('id')
		el.getAttribute('id').should.eql('id')
		el.toString().should.eql('<div id="id"></div>');
	});
	it('#removeAttribute()', async function () {
		const html = '<div id="id"></div>';
		const root = parse(html);
		const el = root.firstChild;
		el.id.should.eql('id')
		el.getAttribute('id').should.eql('id')
		el.removeAttribute('id')
		el.id.should.eql('')
		should.equal(el.getAttribute('id'), undefined);
		el.toString().should.eql('<div></div>');
	});
	it('#setAttribute()', async function () {
		const html = '<div></div>';
		const root = parse(html);
		const el = root.firstChild;
		el.id.should.eql('')
		should.equal(el.getAttribute('id'), undefined);
		el.setAttribute('id', 'id')
		el.id.should.eql('id')
		el.getAttribute('id').should.eql('id')
		el.toString().should.eql('<div id="id"></div>');
	});
});
