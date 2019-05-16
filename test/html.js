var should = require('should');
var fs = require('fs');
var util = require('util');

var HTMLParser = require('../dist');

describe('HTML Parser', function () {

	var Matcher = HTMLParser.Matcher;
	var HTMLElement = HTMLParser.HTMLElement;
	var TextNode = HTMLParser.TextNode;

	describe('Matcher', function () {
		it('should match corrent elements', function () {
			var matcher = new Matcher('p[id="id"] *[type="text"] meta[name=description] #id .a a.b *.a.b .a.b * a');
			var MatchesNothingButStarEl = new HTMLElement('_', {});
			var withIdEl = new HTMLElement('p', {
				id: 'id'
			});
			var withClassNameEl = new HTMLElement('a', {
				class: 'a b'
			});
			var withCustomAttr = new HTMLElement('input', {}, "type=text");
			var withCustomAttr_1 = new HTMLElement('meta_tag', {}, "name='description'");
			var withCustomAttr_2 = new HTMLElement('meta', {}, "name='description'");

			matcher.advance(withIdEl).should.eql(true) // p[id="id"]
			matcher.advance(withCustomAttr).should.eql(true); // a[class="a b"]
			matcher.advance(withCustomAttr_1).should.eql(false); // meta[name=description]
			matcher.advance(withCustomAttr_2).should.eql(true); // meta[name=description]

			matcher.advance(MatchesNothingButStarEl).should.eql(false); // #id
			matcher.advance(withClassNameEl).should.eql(false); // #id
			matcher.advance(withIdEl).should.eql(true); // #id

			matcher.advance(MatchesNothingButStarEl).should.eql(false); // .a
			matcher.advance(withIdEl).should.eql(false); // .a
			matcher.advance(withClassNameEl).should.eql(true); // .a

			matcher.advance(MatchesNothingButStarEl).should.eql(false); // a.b
			matcher.advance(withIdEl).should.eql(false); // a.b
			matcher.advance(withClassNameEl).should.eql(true); // a.b

			matcher.advance(withIdEl).should.eql(false); // *.a.b
			matcher.advance(MatchesNothingButStarEl).should.eql(false); // *.a.b
			matcher.advance(withClassNameEl).should.eql(true); // *.a.b

			matcher.advance(withIdEl).should.eql(false); // .a.b
			matcher.advance(MatchesNothingButStarEl).should.eql(false); // .a.b
			matcher.advance(withClassNameEl).should.eql(true); // .a.b

			matcher.advance(withIdEl).should.eql(true); // *
			matcher.rewind();
			matcher.advance(MatchesNothingButStarEl).should.eql(true); // *
			matcher.rewind();
			matcher.advance(withClassNameEl).should.eql(true); // *

			matcher.advance(withIdEl).should.eql(false); // a
			matcher.advance(MatchesNothingButStarEl).should.eql(false); // a
			matcher.advance(withClassNameEl).should.eql(true); // a

			matcher.matched.should.eql(true);
		});
	});

	var parseHTML = HTMLParser.parse

	describe('parse()', function () {
		it('should parse "<p id=\\"id\\"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>" and return root element', function () {

			var root = parseHTML('<p id="id"><a class=\'cls\'>Hello</a><ul><li><li></ul><span></span></p>');

			const tag_root = new HTMLElement(null, {});
			var p = new HTMLElement('p', {
				id: 'id'
			}, 'id="id"', tag_root);
			p.appendChild(new HTMLElement('a', {
					class: 'cls'
				}, 'class=\'cls\'', p))
				.appendChild(new TextNode('Hello'));
			var ul = p.appendChild(new HTMLElement('ul', {}, '', p));
			ul.appendChild(new HTMLElement('li', {}, '', ul));
			ul.appendChild(new HTMLElement('li', {}, '', ul));
			p.appendChild(new HTMLElement('span', {}, '', p));
			tag_root.childNodes = [p];

			root.firstChild.should.eql(p);
		});

		it('should parse "<DIV><a><img/></A><p></P></div>" and return root element', function () {

			var root = parseHTML('<DIV><a><img/></A><p></P></div>', {
				lowerCaseTagName: true
			});

			const tag_root = new HTMLElement(null, {});
			var div = new HTMLElement('div', {}, '', tag_root);
			var a = div.appendChild(new HTMLElement('a', {}, '', div));
			var img = a.appendChild(new HTMLElement('img', {}, '', a));
			var p = div.appendChild(new HTMLElement('p', {}, '', div));
			tag_root.childNodes = [div];

			root.firstChild.should.eql(div);

		});

		it('should parse "<div><a><img/></a><p></p></div>" and return root element', function () {

			var root = parseHTML('<div><a><img/></a><p></p></div>');

			const tag_root = new HTMLElement(null, {});
			var div = new HTMLElement('div', {}, '', tag_root);
			var a = div.appendChild(new HTMLElement('a', {}, '', div));
			var img = a.appendChild(new HTMLElement('img', {}, '', a));
			var p = div.appendChild(new HTMLElement('p', {}, '', div));
			tag_root.childNodes = [div];

			root.firstChild.should.eql(div);

		});

		it('should not extract text in script and style by default', function () {

			var root = parseHTML('<script>1</script><style>2</style>');

			root.firstChild.childNodes.should.be.empty;
			root.lastChild.childNodes.should.be.empty;

		});

		it('should extract text in script and style when ask so', function () {

			var root = parseHTML('<script>1</script><style>2&amp;</style>', {
				fixIssues: true
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

			var root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString(), {
				script: true
			});

		});

		it('should parse "<div><a><img/></a><p></p></div>.." very fast', function () {

			for (var i = 0; i < 100; i++)
				parseHTML('<div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div><div><a><img/></a><p></p></div>');

		});

		it('should parse "<DIV><a><img/></A><p></P></div>.." fast', function () {

			for (var i = 0; i < 100; i++)
				parseHTML('<DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div><DIV><a><img/></A><p></P></div>', {
					lowerCaseTagName: true
				});

		});

		// Test for broken tags. <h3>something<h3>

		it('should parse "<div><h3>content<h3> <span> other <span></div>" (fix h3, span closing tag) very fast', function () {
			var root = parseHTML(fs.readFileSync(__dirname + '/html/incomplete-script').toString(), {
				fixIssues: true,
				validate: true
			});
		});

		// Test for comment tag

		it('should parse "<div><!-- This is a comment --><h3></h3><div>" to "<div><!-- This is a comment --><h3></h3></div>"', function () {
			var result = parseHTML('<div><!-- This is a comment --><h3></h3><div>', {
				fixIssues: true,
				validate: true
			});
			result.root.toString().should.eql('<div><!-- This is a comment --><h3></h3></div>');
		})

		// Test for <p><p></p></p>
		it('should parse "<p>This<p>is a test</p></p>"', function () {
			var result = parseHTML('<p>This<p>is a test</p></p>', {
				fixIssues: true,
				validate: true
			});
			result.root.toString().should.eql('<p>This<p>is a test</p></p>');
		})
	});

		it("should return false when html is invalid", () => {
			const html = "<html><body><div><h1>Good</div></body></html>"
			const resp = parseHTML(html, {
				validate: true
			})
			resp.root.toString().should.eql(html)
			resp.valid.should.eql(false)
    })

		it("should return unaltered html when it is invalid", () => {
			const html = "<html><body><div><h1>Good</div></body></html>"
			const response = parseHTML(html, {
				validate: true,
			})
			response.root.toString().should.eql(html)
		})
	})

	describe('parseWithValidation', function () {
		// parse with validation tests

		describe('with validation', function () {
			it('should return Object with valid: false.  does not count <p><p></p> as error. instead fixes it to <p></p><p></p>', function () {
				var result = parseHTML('<p><p></p>', {
					validate: true
				});
				result.valid.should.eql(false);
			})

			it('should return Object with valid: true.  does not count <p><p/></p> as error. instead fixes it to <p><p></p></p>', function () {
				var result = parseHTML('<p><p/></p>', {
					validate: true
				});
				result.valid.should.eql(true);
			})

			it('should return Object with valid: false.  does not count <p><h3></p> as error. instead fixes it to <p><h3></h3></p>', function () {
				var result = parseHTML('<p><h3></p>', {
					validate: true
				});
				result.valid.should.eql(false);
			})

		})

		describe('with validation and fix issues', function () {
			it('hillcrestpartyrentals.html  should return Object with valid: true.  not closing <p> tag on line 476, fixes it instead', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/hillcrestpartyrentals.html').toString(), {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
			})

			it('google.html  should return Object with valid: true', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/google.html').toString(), {
					fixIssues: false,
					validate: true
				});
				result.valid.should.eql(true);
			})

			it('gmail.html  should return Object with valid: true', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/gmail.html').toString(), {
					fixIssues: false,
					validate: true
				});
				result.valid.should.eql(true);
			})

			it('ffmpeg.html  should return Object with valid: true (extra opening <div>', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/ffmpeg.html').toString(), {
					fixIssues: false,
					validate: true
				});
				result.valid.should.eql(true);
			})

			// fix issue speed test

			it('should fix "<div><h3><h3><div>" to "<div><h3></h3><h3><div></div></h3></div>" with fixIssues: true', function () {
				var result = parseHTML('<div><h3><h3><div>', {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
				result.root.toString().should.eql('<div><h3></h3><h3><div></div></h3></div>');
			})

			it('should fix "<li style="font-weight: 400;"><b><h3></b><span style="font-weight: 400;"> 3. Write your content</span></li>" to "<li style="font-weight: 400;"><b><h3></h3></b><span style="font-weight: 400;"> 3. Write your content</span></li>" with fixIssues: true', function () {
				var result = parseHTML('<li style="font-weight: 400;"><b><h3></b><span style="font-weight: 400;"> 3. Write your content</span></li>', {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
				result.root.toString().should.eql('<li style="font-weight: 400;"><b><h3></h3></b><span style="font-weight: 400;"> 3. Write your content</span></li>');
			})

			it('should fix "<div><h3><h3><span><span><div>" to "<div><h3></h3><h3><span><span></span></span></h3></div><div></div>" with fixIssues: true', function () {
				var result = parseHTML('<div><h3><h3><span><span></a><div>', {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
				result.root.toString().should.eql('<div><h3></h3><h3><span><span></span></span></h3></div><div></div>');
			})

			it('should fix "<img src="favicon.ico">1</img><style></style>" to "<img src="favicon.ico" />1<style></style>" with fixIssues: true', function () {
				var result = parseHTML('<img src="favicon.ico">1</img><style></style>', {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(true);
				result.root.toString().should.eql('<img src="favicon.ico" />1<style></style>');
			})

			it('should fix "<div><div>" to "<div></div>" and return correct errors object', function () {
				var result = parseHTML('<div><div>', {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
				result.errors.should.eql([{
					tag: 'div',
					type: 'not_properly_closed',
					message: 'div tag not properly closed',
					pos: 6
				}])
			})

			it('should fix "<div></h3></div>" to "<div></div>" and return correct errors object', function () {
				var result = parseHTML('<div></h3></div>', {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
				result.errors.should.eql([{
					tag: 'div',
					type: 'not_closed',
					message: 'div tag not closed',
					pos: 6
				}])
			})

			it('should fix "<div><h3></div>" to "<div><h3></h3></div>" and return correct errors object', function () {
				var result = parseHTML('<div><h3></div>', {
					fixIssues: true,
					validate: true
				});
				result.root.toString().should.eql('<div><h3></h3></div>');
				result.valid.should.eql(false);
				result.errors.should.eql([{
					tag: 'h3',
					type: 'not_closed',
					message: 'h3 tag not closed',
					pos: 10
				}])
			})

			it('gmail.html  should return Object with valid: true', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/gmail.html').toString().replace(/<\//gi, '<'), {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
			})

			it('nice.html  should return Object with valid: true', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/nice.html').toString().replace(/<\//gi, '<'), {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(false);
			})

			it('BestPOSSoftwareforSmallBusinessRetail_VendPOS.html  should return Object with valid: true', function () {
				var result = parseHTML(fs.readFileSync(__dirname + '/html/BestPOSSoftwareforSmallBusinessRetail_VendPOS.html').toString(), {
					fixIssues: true,
					validate: true
				});
				result.valid.should.eql(true);
			})
		})
	});

	describe('TextNode', function () {
		describe('#isWhitespace', function () {
			var node = new TextNode('');
			node.isWhitespace.should.eql(true);
			node = new TextNode(' \t');
			node.isWhitespace.should.eql(true);
			node = new TextNode(' \t&nbsp; \t');
			node.isWhitespace.should.eql(true);
		});
	});

	describe('HTMLElement', function () {
		describe('#removeWhitespace()', function () {
			it('should remove whitespaces while preserving nodes with content', function () {
				var root = parseHTML('<p> \r \n  \t <h5> 123 </h5></p>');

				const tag_root = new HTMLElement(null, {});
				var p = new HTMLElement('p', {}, '', tag_root);
				p.appendChild(new HTMLElement('h5', {}, '', p))
					.appendChild(new TextNode('123'));
				tag_root.childNodes = [p];

				root.firstChild.removeWhitespace().should.eql(p);
			});
		});

		describe('#rawAttributes', function () {
			it('should return escaped attributes of the element', function () {
				var root = parseHTML('<p a=12 data-id="!$$&amp;" yAz=\'1\'></p>');
				root.firstChild.rawAttributes.should.eql({
					'a': '12',
					'data-id': '!$$&amp;',
					'yAz': '1'
				});
			});
		});

		describe('#attributes', function () {
			it('should return attributes of the element', function () {
				var root = parseHTML('<p a=12 data-id="!$$&amp;" class="hello there" yAz=\'1\'></p>');
				root.firstChild.attributes.should.eql({
					'a': '12',
					'data-id': '!$$&',
					'class': 'hello there',
					'yAz': '1'
				});
			});
		});

		describe('#querySelector()', function () {
			it('should return correct elements in DOM tree', function () {
				var root = parseHTML('<a id="id" data-id="myid"><div><span class="a b"></span><span></span><span></span></div></a>');
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
				var root = parseHTML('<a id="id"><div><span class="a b"></span><span></span><span></span></div><span></span></a>');
				root.querySelectorAll('#id').should.eql([root.firstChild]);
				root.querySelectorAll('span.a').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('span.b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('span.a.b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('#id .b').should.eql([root.firstChild.firstChild.firstChild]);
				root.querySelectorAll('#id span').should.eql(root.firstChild.firstChild.childNodes.concat(root.firstChild.childNodes[1]));
			});
		});

		describe('#querySelector() with :first', function () {
			it('should return correct elements in DOM tree with :first selector', function () {
				var meta_root = parseHTML('<html><head><meta></head></html>');
				meta_root.querySelector('meta:first').should.eql(meta_root.firstChild.firstChild.firstChild)

				var result = parseHTML(fs.readFileSync(__dirname + '/html/john.html').toString(), {
					fixIssues: true,
					validate: true
				});
				var result_meta = '<meta name="google-site-verification" content="XKgoQv9SmkG9vGpl-nXZt5GFm5UPcXb3Ux-T_X5qY9E">'
				result.valid.should.eql(true);
				result.root.querySelector('meta:first').toString().should.eql(result_meta);

				var root = parseHTML('<div><span class="first"><i></i></span><a></a><span class="last"></span></div>');
				var nodes = root.firstChild.childNodes;
				root.querySelector('div span:first').should.eql(nodes[0]);
				root.querySelector('div span:nth-child(3)').should.eql(nodes[2]);
				root.querySelector('div span:last').should.eql(nodes[nodes.length - 1]);
			});
		});

		describe('#structuredText', function () {
			it('should return correct structured text', function () {
				var root = parseHTML('<span>o<p>a</p><p>b</p>c</span>');
				root.structuredText.should.eql('o\na\nb\nc');
			});
		});

		describe('#set_content', function () {
			it('set content string', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content('<span><div>abc</div>bla</span>');
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content nodes', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content(parseHTML('<span><div>abc</div>bla</span>').childNodes);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content node', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content(parseHTML('<span><div>abc</div>bla</span>').childNodes[0]);
				root.toString().should.eql('<div><span><div>abc</div>bla</span></div>');
			});
			it('set content text', function () {
				var root = parseHTML('<div></div>');
				root.childNodes[0].set_content('abc');
				root.toString().should.eql('<div>abc</div>');
			});
		});
	});

	describe('stringify', function () {
		describe('#toString()', function () {
			const html = '<p id="id" data-feidao-actions="ssss"><a class=\'cls\'>Hello</a><ul><li>aaaaa</li></ul><span>bbb</span></p>';
			const root = parseHTML(html);
			root.toString().should.eql(html)
		});
	});

	describe('Custom Element', function () {
		it('parse "<my-widget></my-widget>" tagName should be "my-widget"', function () {
			var root = parseHTML('<my-widget></my-widget>');
			root.firstChild.tagName.should.eql('my-widget');
		});
	});

	describe('Custom Element multiple dash', function () {
		it('parse "<my-new-widget></my-new-widget>" tagName should be "my-new-widget"', function () {

			var root = parseHTML('<my-new-widget></my-new-widget>');

			root.firstChild.tagName.should.eql('my-new-widget');
		});
	});
});
