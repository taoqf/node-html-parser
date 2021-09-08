const { parse } = require('../dist/cjs/index.js');

// https://github.com/taoqf/node-html-parser/issues/77
describe('pre tag', function () {
	it('should parse pre tag correctly', function () {
		const html = `
    <div class="language-python highlighter-rouge">
      <div class="highlight"> <pre class="highlight"><code><span class="k">print</span><span class="p">(</span><span class="s">'hello'</span><span class="p">)</span><br><span class="n">i</span> <span class="o">=</span> <span class="n">i</span> <span class="o">+</span> <span class="mi">1</span><br></code></pre>
      </div>
    </div>
    `;
		const root = parse(html, {
			blockTextElements: {
				script: true,
				noscript: true,
				style: true,
				pre: true
			}
		});
		root.toString().should.eql(html);
	});
	it('should ignore pre tag', function () {
		const html = `
    <div class="language-python highlighter-rouge">
      <div class="highlight"> <pre class="highlight"><code><span class="k">print</span><span class="p">(</span><span class="s">'hello'</span><span class="p">)</span><br><span class="n">i</span> <span class="o">=</span> <span class="n">i</span> <span class="o">+</span> <span class="mi">1</span><br></code></pre>
      </div>
    </div>
    `;
		const root = parse(html, {
			blockTextElements: {
				pre: false
			}
		});
		root.toString().should.eql(`
    <div class="language-python highlighter-rouge">
      <div class="highlight"> <pre class="highlight"></pre>
      </div>
    </div>
    `);
	});
	it('do not treat pre as text block element', function () {
		const html = `<div class="language-python highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">print</span><span class="p">(</span><span class="s">'hello'</span><span class="p">)</span><br><span class="n">i</span><span class="o">=</span><span class="n">i</span><span class="o">+</span><span class="mi">1</span><br></code></pre>
      </div>
    </div>
    `;
		const root = parse(html, {
			blockTextElements: {}
		});
		const div = root.firstChild.firstChild;
		const pre = div.firstChild;
		const code = pre.firstChild;
		code.childNodes.length.should.eql(11);
	});
});
