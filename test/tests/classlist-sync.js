const { parse } = require('@test/test-target');

describe('classList', function () {
	it('ignores whitespace around class names', function () {
		const div = parse('<div class="  foo   bar \n"></div>').firstChild;
		div.classList.length.should.eql(2);
		div.classList.value.should.eql(['foo', 'bar']);
		div.classList.contains('').should.eql(false);
		div.structure.should.eql('div.foo.bar');
	});
	it('is empty for a whitespace-only class attribute', function () {
		const div = parse('<div class=" "></div>').firstChild;
		div.classList.length.should.eql(0);
	});
	it('follows setAttribute("class")', function () {
		const div = parse('<div class="foo"></div>').firstChild;
		const list = div.classList;
		div.setAttribute('class', ' x  y ');
		list.value.should.eql(['x', 'y']);
		div.classList.add('z');
		div.getAttribute('class').should.eql('x y z');
	});
	it('follows removeAttribute("class")', function () {
		const div = parse('<div class="foo bar"></div>').firstChild;
		div.removeAttribute('class');
		div.classList.length.should.eql(0);
		div.classList.add('baz');
		div.toString().should.eql('<div class="baz"></div>');
	});
	it('follows setAttributes()', function () {
		const div = parse('<div class="foo"></div>').firstChild;
		div.setAttributes({ id: 'a', class: 'p q' });
		div.classList.value.should.eql(['p', 'q']);
		div.setAttributes({ id: 'b' });
		div.classList.length.should.eql(0);
	});
});
