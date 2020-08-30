const should = require('should');
const fs = require('fs');

const HTMLParser = require('../dist');
const Matcher = require('../dist/matcher').default;
const HTMLElement = require('../dist/nodes/html').default;
const TextNode = require('../dist/nodes/text').default;
const CommentNode = require('../dist/nodes/comment').default;

describe('HTML Parser', function () {
	describe('Matcher', function () {
		it('should match corrent elements', function () {
			const matcher = new Matcher('#id .a a.b *.a.b .a.b * a');
			const MatchesNothingButStarEl = new HTMLElement('_', {});
			const withIdEl = new HTMLElement('p', { id: 'id' });
			const withClassNameEl = new HTMLElement('a', { class: 'a b' });

			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // #id
			matcher.advance(withClassNameEl).should.not.be.ok; // #id
			matcher.advance(withIdEl).should.be.ok; // #id

			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // .a
			matcher.advance(withIdEl).should.not.be.ok; // .a
			matcher.advance(withClassNameEl).should.be.ok; // .a

			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // a.b
			matcher.advance(withIdEl).should.not.be.ok; // a.b
			matcher.advance(withClassNameEl).should.be.ok; // a.b

			matcher.advance(withIdEl).should.not.be.ok; // *.a.b
			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // *.a.b
			matcher.advance(withClassNameEl).should.be.ok; // *.a.b

			matcher.advance(withIdEl).should.not.be.ok; // .a.b
			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // .a.b
			matcher.advance(withClassNameEl).should.be.ok; // .a.b

			matcher.advance(withIdEl).should.be.ok; // *
			matcher.rewind();
			matcher.advance(MatchesNothingButStarEl).should.be.ok; // *
			matcher.rewind();
			matcher.advance(withClassNameEl).should.be.ok; // *

			matcher.advance(withIdEl).should.not.be.ok; // a
			matcher.advance(MatchesNothingButStarEl).should.not.be.ok; // a
			matcher.advance(withClassNameEl).should.be.ok; // a

			matcher.matched.should.be.ok;
		});
	});

	const parseHTML = HTMLParser.parse;

	describe('parse()', function () {
		it('should parse "<p id=\\"id\\"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>" and return root element', function () {

			const root = parseHTML('<p id="id"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>');

			const p = new HTMLElement('p', { id: 'id' }, 'id="id"');
			p.appendChild(new HTMLElement('a', { class: 'cls' }, 'class=\'cls\''))
				.appendChild(new TextNode('Hello'));
			const ul = p.appendChild(new HTMLElement('ul', {}, ''));
			ul.appendChild(new HTMLElement('li', {}, ''));
			ul.appendChild(new HTMLElement('li', {}, ''));
			p.appendChild(new HTMLElement('span', {}, ''));

			root.firstChild.should.eql(p);
		});

		it('should parse "<DIV><a><img/></A><p></P></div>" and return root element', function () {

			const root = parseHTML('<DIV><a><img/></A><p></P></div>', {
				lowerCaseTagName: true
			});

			const div = new HTMLElement('div', {}, '');
			const a = div.appendChild(new HTMLElement('a', {}, ''));
			const img = a.appendChild(new HTMLElement('img', {}, ''));
			const p = div.appendChild(new HTMLElement('p', {}, ''));

			root.firstChild.should.eql(div);

		});

		it('should deal uppercase', function () {
			const html = '<HTML xmlns="http://www.w3.org/1999/xhtml" lang="pt" xml:lang="pt-br"><HEAD><TITLE>SISREG III</TITLE><META http-equiv="Content-Type" content="text/html; charset=UTF-8" /><META http-equiv="Content-Language" content="pt-BR" /><LINK rel="stylesheet" href="/css/estilo.css" type="text/css"><SCRIPT type="text/javascript" src="/javascript/jquery.js" charset="utf-8"></SCRIPT><SCRIPT LANGUAGE=\'JavaScript\'></SCRIPT></HEAD><BODY link=\'#0000AA\' vlink=\'#0000AA\'><CENTER><h1>CONSULTA AO CADASTRO DE PACIENTES SUS</h1></CENTER><DIV id=\'progress_div\'><BR><BR><CENTER><IMG src=\'/imagens/loading.gif\' /></CENTER><CENTER><SPAN style=\'font-size: 80%\'>Processando...</SPAN></CENTER><BR><BR></DIV></BODY></HTML>';

			const root = parseHTML(html, {
				lowerCaseTagName: true
			});

			root.toString().should.eql('<html xmlns="http://www.w3.org/1999/xhtml" lang="pt" xml:lang="pt-br"><head><title>SISREG III</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" ><meta http-equiv="Content-Language" content="pt-BR" ><link rel="stylesheet" href="/css/estilo.css" type="text/css"><script type="text/javascript" src="/javascript/jquery.js" charset="utf-8"></script><script LANGUAGE=\'JavaScript\'></script></head><body link=\'#0000AA\' vlink=\'#0000AA\'><center><h1>CONSULTA AO CADASTRO DE PACIENTES SUS</h1></center><div id=\'progress_div\'><br><br><center><img src=\'/imagens/loading.gif\' ></center><center><span style=\'font-size: 80%\'>Processando...</span></center><br><br></div></body></html>');
			// root.toString().firstChild.should.eql(div);

		});

		it('should parse "<div><a><img/></a><p></p></div>" and return root element', function () {

			const root = parseHTML('<div><a><img/></a><p></p></div>');

			const div = new HTMLElement('div', {}, '');
			const a = div.appendChild(new HTMLElement('a', {}, ''));
			const img = a.appendChild(new HTMLElement('img', {}, ''));
			const p = div.appendChild(new HTMLElement('p', {}, ''));

			root.firstChild.should.eql(div);

		});

		it('should parse "<div><a><!-- my comment --></a></div>" and return root element without comments', function () {
			const root = parseHTML('<div><a><!-- my comment --></a></div>');

			const div = new HTMLElement('div', {}, '');
			const a = div.appendChild(new HTMLElement('a', {}, ''));

			root.firstChild.should.eql(div);
		});

		it('should parse "<div><a><!-- my comment --></a></div>" and return root element with comments', function () {
			const root = parseHTML('<div><a><!-- my comment --></a></div>', { comment: true });

			const div = new HTMLElement('div', {}, '');
			const a = div.appendChild(new HTMLElement('a', {}, ''));
			const comment = a.appendChild(new CommentNode(' my comment '));

			root.firstChild.should.eql(div);
		});

		it('should not parse HTML inside comments', function () {
			const root = parseHTML('<div><!--<a></a>--></div>', { comment: true });

			const div = new HTMLElement('div', {}, '');
			const comment = div.appendChild(new CommentNode('<a></a>'));

			root.firstChild.should.eql(div);
		});

		it('should parse picture element', function () {

			const root = parseHTML('<picture><source srcset="/images/example-1.jpg 1200w, /images/example-2.jpg 1600w" sizes="100vw"><img src="/images/example.jpg" alt="Example"/></picture>');

			const picture = new HTMLElement('picture', {}, '');
			const source = picture.appendChild(new HTMLElement('source', {}, 'srcset="/images/example-1.jpg 1200w, /images/example-2.jpg 1600w" sizes="100vw"'));
			const img = picture.appendChild(new HTMLElement('img', {}, 'src="/images/example.jpg" alt="Example"'));

			root.firstChild.should.eql(picture);

		});

		it('should not extract text in script and style by default', function () {

			const root = parseHTML('<script>1</script><style>2</style>');

			root.firstChild.childNodes.should.be.empty;
			root.lastChild.childNodes.should.be.empty;

		});

		it('should extract text in script and style when ask so', function () {

			const root = parseHTML('<script>1</script><style>2&amp;</style>', {
				script: true,
				style: true
			});

			root.firstChild.childNodes.should.not.be.empty;
			root.firstChild.childNodes.should.eql([new TextNode('1')]);
			root.firstChild.text.should.eql('1');
			root.lastChild.childNodes.should.not.be.empty;
			root.lastChild.childNodes.should.eql([new TextNode('2&amp;')]);
			root.lastChild.text.should.eql('2&');
			root.lastChild.rawText.should.eql('2&amp;');
		});

		it('should be able to parse "html/incomplete-script" file', function () {

			const root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString(), {
				script: true
			});

		});

		it('should be able to parse namespaces', function () {
			const namespacedXML = '<ns:identifier>content</ns:identifier>';
			parseHTML(namespacedXML).toString().should.eql(namespacedXML);
		});

		it('should parse "<div><a><img/></a><p></p></div>.." very fast', function () {

			for (let i = 0; i < 100; i++)
				parseHTML('<div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div>');

		});

		it('should parse "<DIV><a><img/></A><p></P></div>.." fast', function () {

			for (let i = 0; i < 100; i++)
				parseHTML('<DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div>', {
					lowerCaseTagName: true
				});

		});

		// Test for broken tags. <h3>something<h3>

		it('should parse "<div><h3>content<h3> <span> other <span></div>" (fix h3, span closing tag) very fast', function () {
			const root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString());
		});

		it('should parse talble currect', function () {
			const root = parseHTML(fs.readFileSync(__dirname + '/html/tables.html').toString(), {
				script: true
			});
			const tables = root.querySelectorAll('table');
			tables.length.should.eql(3176);
		});
	});

	describe('parseWithValidation', function () {
		// parse with validation tests

		it('should return Object with valid: true.  does not count <p><p></p> as error. instead fixes it to <p></p><p></p>', function () {
			const result = parseHTML('<p><p></p>');
			result.valid.should.eql(true);
		})

		it('should return Object with valid: true.  does not count <p><p/></p> as error. instead fixes it to <p><p></p></p>', function () {
			const result = parseHTML('<p><p/></p>');
			result.valid.should.eql(true);
		})

		it('should return Object with valid: false.  does not count <p><h3></p> as error', function () {
			const result = parseHTML('<p><h3></p>');
			result.valid.should.eql(false);
		})

		it('hillcrestpartyrentals.html  should return Object with valid: false.  not closing <p> tag on line 476', function () {
			const result = parseHTML(fs.readFileSync(__dirname + '/html/hillcrestpartyrentals.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(false);
		})

		it('google.html  should return Object with valid: true', function () {
			const result = parseHTML(fs.readFileSync(__dirname + '/html/google.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(true);
		})

		it('gmail.html  should return Object with valid: true', function () {
			const result = parseHTML(fs.readFileSync(__dirname + '/html/gmail.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(true);
		})

		it('ffmpeg.html  should return Object with valid: false (extra opening <div>', function () {
			const result = parseHTML(fs.readFileSync(__dirname + '/html/ffmpeg.html').toString(), {
				noFix: true
			});
			result.valid.should.eql(false);
		})

		// fix issue speed test

		it('should fix "<div><h3><h3><div>" to "<div><h3></h3></div>"', function () {
			const result = parseHTML('<div data-id=1><h3 data-id=2><h3><div>');
			result.valid.should.eql(false);
			result.toString().should.eql('<div data-id=1><h3 data-id=2></h3></div>');
		})

		it('should fix "<div><h3><h3><span><span><div>" to "<div><h3></h3><span></span></div>"', function () {
			const result = parseHTML('<div><h3><h3><span><span><div>');
			result.valid.should.eql(false);
			result.toString().should.eql('<div><h3></h3><span></span></div>');
		})

		it('gmail.html  should return Object with valid: true', function () {
			const result = parseHTML(fs.readFileSync(__dirname + '/html/gmail.html').toString().replace(/<\//gi, '<'));
			result.valid.should.eql(false);
		})

		it('gmail.html  should return Object with valid: true', function () {
			const result = parseHTML(fs.readFileSync(__dirname + '/html/nice.html').toString().replace(/<\//gi, '<'));
			result.valid.should.eql(false);
		})

	});

	describe('TextNode', function () {
		it('#isWhitespace', function () {
			let node = new TextNode('');
			node.isWhitespace.should.be.ok;
			node = new TextNode(' \t');
			node.isWhitespace.should.be.ok;
			node = new TextNode(' \t&nbsp; \t');
			node.isWhitespace.should.be.ok;
		});
		it('parse text node', function () {
			const result = parseHTML('hello mmstudio');
			result.firstChild.should.instanceOf(TextNode);
			result.toString().should.eql('hello mmstudio');
		});
	});

	describe('HTMLElement', function () {

		describe('#removeWhitespace()', function () {
			it('should remove whitespaces while preserving nodes with content', function () {
				const root = parseHTML('<p> \r \n  \t <h5> 123 </h5></p>');

				const p = new HTMLElement('p', {}, '');
				p.appendChild(new HTMLElement('h5', {}, ''))
					.appendChild(new TextNode('123'));

				root.firstChild.removeWhitespace().should.eql(p);
			});
		});

		describe('#rawAttributes', function () {
			it('should return escaped attributes of the element', function () {
				const root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\'></p>');
				root.firstChild.rawAttributes.should.eql({
					'a': '12',
					'data-id': '!$$&amp;',
					'yAz': '1'
				});
			});
		});

		describe('#attributes', function () {
			it('should return attributes of the element', function () {
				const root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\' class="" disabled></p>');
				root.firstChild.attributes.should.eql({
					'a': '12',
					'data-id': '!$$&',
					'yAz': '1',
					'disabled': '',
					'class': ''
				});
			});
		});

		describe('#getAttribute', function () {
			it('should return value of the attribute', function () {
				const root = parseHTML('<p a="a1b"></p>');
				root.firstChild.getAttribute('a').should.eql('a1b');
			});

			it('should return null when there is no such attribute', function () {
				const root = parseHTML('<p></p>');
				should.equal(root.firstChild.getAttribute('b'), null);
			});

			it('should return empty string as broser behavior', function () {
				const root = parseHTML('<input required>');
				const input = root.firstChild;
				input.getAttribute('required').should.eql('');
			});

			it('should return null as browser behavior', function () {
				const root = parseHTML('<input required foo="" bar=\'\'>');
				const input = root.firstChild;
				input.getAttribute('required').should.eql('');
				input.setAttribute('readonly', null);
				input.getAttribute('readonly').should.eql('null');
				input.setAttribute('disabled', '');
				input.getAttribute('disabled').should.eql('');
				input.toString().should.eql('<input required foo bar readonly="null" disabled>')
			});
		});

		describe('#setAttribute', function () {
			it('should edit the attributes of the element', function () {
				const root = parseHTML('<p a=12></p>');
				const attr = root.firstChild.attributes;
				root.firstChild.setAttribute('a', 13);
				attr.should.eql({
					'a': '13',
				});
				root.firstChild.getAttribute('a').should.eql('13');
				root.firstChild.toString().should.eql('<p a="13"></p>');
			});
			it('should add an attribute to the element', function () {
				const root = parseHTML('<p a=12></p>');
				root.firstChild.setAttribute('b', 13);
				root.firstChild.attributes.should.eql({
					'a': '12',
					'b': '13',
				});
				root.firstChild.toString().should.eql('<p a="12" b="13"></p>');
				root.firstChild.setAttribute('required', '');
				root.firstChild.toString().should.eql('<p a="12" b="13" required></p>');
			});
			it('should convert value to string', function () {
				const root = parseHTML('<p a=12 b=13 c=14></p>');
				const p = root.firstChild;
				p.setAttribute('b', null);
				p.setAttribute('c', undefined);
				p.getAttribute('b').should.eql('null');
				p.getAttribute('c').should.eql('undefined');
				p.toString().should.eql('<p a="12" b="null" c="undefined"></p>');
			});
			it('should throw type Error', function () {
				const root = parseHTML('<p a=12 b=13 c=14></p>');
				const p = root.firstChild;
				should.throws(function () { p.setAttribute('b') });
				should.throws(function () { p.setAttribute() });
			});
			it('should keep quotes arount value', function () {
				const root = parseHTML('<p a="12"></p>');
				root.firstChild.setAttribute('b', 13);
				root.firstChild.setAttribute('c', '2');
				root.firstChild.attributes.should.eql({
					'a': '12',
					'b': '13',
					'c': '2'
				});
				root.firstChild.toString().should.eql('<p a="12" b="13" c="2"></p>');
			});
		});

		describe('#setAttributes', function () {
			it('should return attributes of the element', function () {
				const root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\' class="" disabled></p>');
				root.firstChild.setAttributes({
					c: 12,
					d: '&&<>foo'
				});
				root.firstChild.attributes.should.eql({
					'c': '12',
					d: '&&<>foo'
				});
				root.firstChild.toString().should.eql('<p c="12" d="&&<>foo"></p>');
				// root.firstChild.toString().should.eql('<p c=12 d="&#x26;&#x26;&#x3C;&#x3E;foo"></p>');
			});
		});

		describe('#removeAttribute', function () {
			it('should remove attribute required', function () {
				const root = parseHTML('<input required>');
				const input = root.firstChild;
				input.removeAttribute('required');
				input.toString().should.eql('<input>');
			});
		});

		describe('#hasAttribute', function () {
			it('should return true or false when has or has not some attribute', function () {
				const root = parseHTML('<input required>');
				const input = root.firstChild;
				input.hasAttribute('required').should.eql(true);
				input.removeAttribute('required');
				input.hasAttribute('required').should.eql(false);
			});
		});

		describe('#querySelector()', function () {
			it('should return correct elements in DOM tree', function () {
				const root = parseHTML('<a id="id" data-id="myid"><div><span class="a b"></span><span></span><span></span></div></a>');
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
				const root = parseHTML('<a id="id"><div><span class="a b"></span><span></span><span></span></div></a>');
				root.querySelectorAll('#id').should.eql([root.firstChild]);
				root.querySelectorAll('span.a').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('span.b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('span.a.b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('#id .b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('#id span').should.eql(root.firstChild.firstChild.childNodes);
				root.querySelectorAll('#id, #id .b').should.eql([root.firstChild, root.firstChild.firstChild.firstChild]);
			});
			it('should return just one element', function () {
				const root = parseHTML('<time class="date">');
				root.querySelectorAll('time,.date').should.eql([root.firstChild]);
			});
			it.skip('should return elements in order', function () {
				const root = parseHTML('<img src=""><p>hello</p>');
				const img = root.firstChild;
				const p = root.childNodes[1];
				const [f, s] = root.querySelectorAll('p,img');
				f.should.eql(img);
				s.should.eql(p);
			});
			it.skip('should query multiple nodes', function () {
				const root = parseHTML('<a id="id"><div class="b"><span class="a b"></span><span></span><span></span></div></a>');
				const a = root.firstChild;
				const div = a.firstChild;
				const span = div.firstChild;
				root.querySelectorAll('#id span').should.eql(div.childNodes);
				root.querySelectorAll('#id .b').should.eql([div, span]);
			});
		});

		describe('#structuredText', function () {
			it('should return correct structured text', function () {
				const root = parseHTML('<span>o<p>a</p><p>b</p>c</span>');
				root.structuredText.should.eql('o\na\nb\nc');
			});

			it('should not return comments in structured text', function () {
				const root = parseHTML('<span>o<p>a</p><!-- my comment --></span>', { comment: true });
				root.structuredText.should.eql('o\na');
			});
		});
		describe('#setContent', function () {
			it('set content string', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].setContent('<span><div>abc</div>bla</span>');
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content nodes', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].setContent(parseHTML('<span><div>abc</div>bla</span>').childNodes);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content node', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].setContent(parseHTML('<span><div>abc</div>bla</span>').childNodes[0]);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content text', function () {
				const root = parseHTML('<div></div>');
				root.childNodes[0].setContent('abc');
				root.toString().should.eql('<div>abc</div>');
			});
			it('set content pre', function () {
				const root = parseHTML(`<html><head></head><body></body></html>`);
				const body = root.querySelector("body");
				body.setContent(`<pre>this    is some    preformatted    text</pre>`, { pre: true });
				root.toString().should.eql('<html><head></head><body><pre>this    is some    preformatted    text</pre></body></html>')
			});
		});

		describe('encode/decode', function () {
			it('should decode attributes value', function () {
				const root = parseHTML('<img src="default.jpg" alt="Verissimo, Ilaria D&#39;Amico: &laquo;Sogno una bambina. Buffon mi ha chiesto in moglie tante volte&raquo;">');
				root.firstChild.getAttribute('alt').should.eql(`Verissimo, Ilaria D'Amico: «Sogno una bambina. Buffon mi ha chiesto in moglie tante volte»`);
				root.firstChild.attributes.alt.should.eql(`Verissimo, Ilaria D'Amico: «Sogno una bambina. Buffon mi ha chiesto in moglie tante volte»`);
				root.firstChild.setAttribute('alt', '&laquo;Sogno');
				root.firstChild.getAttribute('alt').should.eql('«Sogno');
				root.firstChild.rawAttributes.alt.should.eql('&laquo;Sogno');
			});
			it('shoud not decode text', function () {
				// https://github.com/taoqf/node-html-parser/issues/33
				const root = parseHTML(`<html>
<body>
<div id='source'>
&lt;p&gt;
This content should be enclosed within an escaped p tag&lt;br /&gt;
&lt;/p&gt;
</div>
</body>
</html>`)
				root.toString().should.eql(`<html>
<body>
<div id='source'>
&lt;p&gt;
This content should be enclosed within an escaped p tag&lt;br /&gt;
&lt;/p&gt;
</div>
</body>
</html>`);
			});
		});

		describe('#insertAdjacentHTML() should parse and insert childrens', function () {
			it('shoud insert children after current node', function () {
				const html = '<a><b></b></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				b.insertAdjacentHTML('afterend', '<c><d></d></c>');
				a.toString().should.eql('<a><b></b><c><d></d></c></a>');
			});

			it('shoud insert children before current node', function () {
				const html = '<a><b></b></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				b.insertAdjacentHTML('beforebegin', '<c></c>');
				a.toString().should.eql('<a><c></c><b></b></a>');
			});

			it('shoud append children in current node', function () {
				const html = '<a></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				a.insertAdjacentHTML('beforeend', '<b></b>');
				a.toString().should.eql('<a><b></b></a>');
				a.insertAdjacentHTML('beforeend', '<c></c>');
				a.toString().should.eql('<a><b></b><c></c></a>');
			});

			it('shoud insert children at position 0', function () {
				const html = '<a></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				a.insertAdjacentHTML('afterbegin', '<b></b>');
				a.toString().should.eql('<a><b></b></a>');
				a.insertAdjacentHTML('afterbegin', '<c></c>');
				a.toString().should.eql('<a><c></c><b></b></a>');
			});

			it('shoud insert text child at position 0', function () {
				const html = '<a></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				a.insertAdjacentHTML('afterbegin', 'abc');
				a.toString().should.eql('<a>abc</a>');
			});
		});

		describe('#removeChild', function () {
			it('shoud remove child node', function () {
				const html = '<a><b></b></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				a.childNodes.length.should.eql(1);
				a.removeChild(b);
				a.childNodes.length.should.eql(0);
			});
			it('shoud not remove child node which does not exist', function () {
				const html = '<a><b><c></c></b></a>';
				const root = parseHTML(html);
				const a = root.firstChild;
				const b = a.firstChild;
				const c = b.firstChild;
				a.childNodes.length.should.eql(1);
				a.removeChild(c);
				a.childNodes.length.should.eql(1);
			});

		});
	});

	describe('stringify', function () {
		it('#toString()', function () {
			const html = '<p id="id" data-feidao-actions="ssss"><a class=\'cls\'>Hello</a><ul><li>aaaaa</li></ul><span>bbb</span></p>';
			const root = parseHTML(html);
			root.toString().should.eql(html)
		});

		it('#toString() should not return comments by default', function () {
			const html = '<p><!-- my comment --></p>';
			const result = '<p></p>';
			const root = parseHTML(html);
			root.toString().should.eql(result);
		});

		it('#toString() should return comments when specified', function () {
			const html = '<!----><p><!-- my comment --></p>';
			const root = parseHTML(html, { comment: true });
			root.toString().should.eql(html);
		});

		it('#toString() should contains id and classnames', function () {
			const el = new HTMLElement('div', { 'id': 'new_container', 'class': 'container' });
			el.id.should.eql('new_container');
			el.classNames.should.deepEqual(['container']);
			el.toString().should.eql('<div id="new_container" class="container"></div>');
		});

		it('#toString() should contains classnames withspaces', function () {
			const el = new HTMLElement('div', { 'class': 'container1  container2' });
			el.classNames.should.deepEqual(['container1', 'container2']);
			el.toString().should.eql('<div class="container1 container2"></div>');
		});
	});

	describe('Comment Element', function () {
		it('comment nodeType should be 8', function () {
			const root = parseHTML('<!-- my comment -->', { comment: true });
			root.firstChild.nodeType.should.eql(8);
		});
	});

	describe('Custom Element', function () {
		it('parse "<my-widget></my-widget>" tagName should be "my-widget"', function () {

			const root = parseHTML('<my-widget></my-widget>');

			root.firstChild.tagName.should.eql('my-widget');
		});
	});

	describe('Custom Element multiple dash', function () {
		it('parse "<my-new-widget></my-new-widget>" tagName should be "my-new-widget"', function () {

			const root = parseHTML('<my-new-widget></my-new-widget>');

			root.firstChild.tagName.should.eql('my-new-widget');
		});
	});
});
