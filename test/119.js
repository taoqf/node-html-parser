const { parse } = require('../dist/cjs/index.js');

// https://github.com/taoqf/node-html-parser/pull/112
describe('issue 119 closest', function () {
	it('query with .a.b', function () {
		const html = `<div class="a b">
	<div id="el">
		<div class="a b">foo</div>
	</div>
</div>`;
		const root = parse(html);
		const el = root.querySelector('#el');
		const d = el.closest('.a.b');
		d.toString().should.eql(html);
	});
	it('query with ul[item]', function () {
		const html = `<ul item="111" id="list"><li>Hello World<ul item="222"></ul></li></ul>`;
		const root = parse(html);
		const li = root.querySelector('li');
		const ul = li.closest('ul[item]');
		ul.getAttribute('item').should.eql('111');
	});
	it('queries', async function () {
		const html = '<div class="f"><span><div id="foo"></div></span></div>';
		const root = parse(html);
		const d = root.querySelector('#foo');
		d.closest('div').toString().should.eql('<div id="foo"></div>')
		d.closest('span').toString().should.eql('<span><div id="foo"></div></span>')
		d.closest('div.f').toString().should.eql('<div class="f"><span><div id="foo"></div></span></div>');
	});
	it('84', async function () {
		const root = parse(`<a id="id" data-id="myid">
	<div>
		<span class="a b"></span>
		<span data-bar="bar">
			<div id="foo">
				<a id="id" data-id="myid"></a>
			</div>
		</span>
		<span data-bar="foo"></span>
	</div>
</a>`);
		const div = root.querySelector('#foo');
		div.closest('#id').should.eql(root.firstChild);
		should.equal(div.closest('span.a'), null);
		should.equal(div.closest('span.b'), null);
		should.equal(div.closest('span.a.b'), null);
		div.closest('span').getAttribute('data-bar').should.eql('bar');
		div.closest('[data-bar]').getAttribute('data-bar').should.eql('bar');
		div.closest('[data-bar="bar"]').getAttribute('data-bar').should.eql('bar');
		should.equal(div.closest('[data-bar="foo"]'), null);
		div.closest('[data-id=myid]').should.eql(root.firstChild);
		div.closest('[data-id="myid"]').should.eql(root.firstChild);
	});
});
