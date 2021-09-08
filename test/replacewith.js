const { parse } = require('..');

describe('should parse tag correct', function () {
	it('should get attribute with :', function () {
		const html = `<Div><Input/></Div>`;
		const root = parse(html);
		root.toString().should.eql('<Div><Input></Div>');
	});
	it('should set innerHTML correctly', function () {
		const root = parse(`\
<html>
  <div class="main">yay</div>
</html>
`);
		root.querySelector('div.main').innerHTML = 'innerHTML setter was here';
		const result = `\
<html>
  <div class="main">innerHTML setter was here</div>
</html>
`;
		root.toString().should.eql(result);
	});
	it('should replace current node with a new one', function () {
		const root = parse(`\
<html>
  <div class="main">yay</div>
</html>
`);
		root.querySelector('div.main').replaceWith('<pre>replaceWith was here</pre>');
		const result = `\
<html>
  <pre>replaceWith was here</pre>
</html>
`;
		root.toString().should.eql(result);
	});
	it('should replace current node with multiple nodes', function () {
		const root = parse(`\
<html>
  <div class="main">yay</div>
</html>
`);
		const foo = parse(`<foo>bar</foo>`);
		root.querySelector('div.main').replaceWith('<pre>replaceWith was here</pre>', foo);
		const result = `\
<html>
  <pre>replaceWith was here</pre><foo>bar</foo>
</html>
`;
		root.toString().should.eql(result);
	});
	it('transform custom elements', function () {
		const root = parse(`\
<html>
  <some-custom-element class="main">yay</some-custom-element>
</html>
`);
		root.querySelectorAll('some-custom-element').forEach((node) => {
			//const nodeNew = parse('<div></div>') // not working, we cannot change root node
			const nodeNew = parse('<html><div></div></html>').querySelector('div')

			for (const [name, value] of Object.entries(node.attributes)) {
				nodeNew.setAttribute(name, value);
			}
			// standard DOM method
			//for (let a = 0; a < node.attributes.length; a++) {
			//   const attr = node.attributes[a];
			//   nodeNew.setAttribute(attr.name, attr.value); // copy attribute
			//}
			//const c = nodeNew.getAttribute('class');
			//nodeNew.setAttribute('class', c ? (c + ' ' + node.tagName.toLowerCase()) : c);
			nodeNew.classList.add(node.localName);
			nodeNew.innerHTML = node.innerHTML;
			node.replaceWith(nodeNew);
		});
		console.log(root.toString());
		const result = `\
<html>
  <div class="some-custom-element">yay</div>
</html>
`;
		root.toString().should.eql(result);
	});
	it('classNames and classList', function () {
		const root = parse('<div class="foo bar"></div>');
		const div = root.firstChild;

		div.classList.length.should.eql(2);
		div.classList.value.should.eql(['foo', 'bar']);
		div.classNames.should.eql('foo bar');

		div.classList.remove('bar');
		div.classNames.should.eql('foo');

		div.classList.add('bar');
		div.classNames.should.eql('foo bar');

		div.classList.toggle('bar');
		div.classNames.should.eql('foo');

		div.classList.toggle('bar');
		div.classNames.should.eql('foo bar');

		div.classList.replace('bar', 'mycls')
		div.classNames.should.eql('foo mycls');

		div.classList.contains('foo').should.eql(true);
		div.classList.contains('bar').should.eql(false);
	});
});
