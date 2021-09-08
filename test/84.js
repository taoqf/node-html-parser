const { parse } = require('../dist/cjs/index.js');

// https://github.com/taoqf/node-html-parser/issues/84
describe('#querySelector()', function () {
	it('should return correct elements in DOM tree', function () {
		const root = parse('<a id="id" data-id="myid"><div><span class="a b"></span><span></span><span></span></div></a>');
		root.querySelector('#id').should.eql(root.firstChild);
		root.querySelector('span.a').should.eql(root.firstChild.firstChild.firstChild);
		root.querySelector('span.b').should.eql(root.firstChild.firstChild.firstChild);
		root.querySelector('span.a.b').should.eql(root.firstChild.firstChild.firstChild);
		root.querySelector('#id .b').should.eql(root.firstChild.firstChild.firstChild);
		root.querySelector('#id span').should.eql(root.firstChild.firstChild.firstChild);
		root.querySelector('[data-id=myid]').should.eql(root.firstChild);
		root.querySelector('[data-id="myid"]').should.eql(root.firstChild);
	});
});

describe('#querySelectorAll()', function () {
	it('should return correct elements in DOM tree', function () {
		const root = parse('<a id="id"><div><span class="a b"></span><span></span><span></span></div></a>');
		root.querySelectorAll('#id').should.eql([root.firstChild]);
		root.querySelectorAll('span.a').should.eql([root.firstChild.firstChild.firstChild]);
		root.querySelectorAll('span.b').should.eql([root.firstChild.firstChild.firstChild]);
		root.querySelectorAll('span.a.b').should.eql([root.firstChild.firstChild.firstChild]);
		root.querySelectorAll('#id .b').should.eql([root.firstChild.firstChild.firstChild]);
		root.querySelectorAll('#id span').should.eql(root.firstChild.firstChild.childNodes);
		root.querySelectorAll('#id, #id .b').should.eql([root.firstChild, root.firstChild.firstChild.firstChild]);
	});
	it('should return just one element', function () {
		const root = parse('<time class="date">');
		root.querySelectorAll('time,.date').should.eql([root.firstChild]);
	});
	it.skip('should return elements in order', function () {
		const root = parse('<img src=""><p>hello</p>');
		const img = root.firstChild;
		const p = root.childNodes[1];
		const [f, s] = root.querySelectorAll('p,img');
		f.should.eql(img);
		s.should.eql(p);
	});
	it.skip('should query multiple nodes', function () {
		const root = parse('<a id="id"><div class="b"><span class="a b"></span><span></span><span></span></div></a>');
		const a = root.firstChild;
		const div = a.firstChild;
		const span = div.firstChild;
		root.querySelectorAll('#id span').should.eql(div.childNodes);
		root.querySelectorAll('#id .b').should.eql([div, span]);
	});
});
