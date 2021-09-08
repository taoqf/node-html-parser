const { parse } = require('..');

describe('issues/28', function () {
	it('query with dl > dt', function () {
		const html = `<dl>
  <dt>A</dt>
  <dd>B</dd>
  <dt>C</dt>
  <dd>D</dt>
</dl>
`;
		const root = parse(html);
		const els = root.querySelectorAll('dl > dt');
		const dt1 = els[0];
		dt1.innerHTML.should.eql('A');
		const dt2 = els[1];
		dt2.innerHTML.should.eql('C');
	});
	it('query with dl dt, dl dd', function () {
		const html = `<dl>
  <dt>A</dt>
  <dd>B</dd>
  <dt>C</dt>
  <dd>D</dd>
</dl>
`;
		const root = parse(html);
		const els = root.querySelectorAll('dl dt, dl dd');
		els.length.should.eql(4);
		const [dt1, dd1, dt2, dd2] = els;
		dt1.innerHTML.should.eql('A');
		dd1.innerHTML.should.eql('B');
		dt2.innerHTML.should.eql('C');
		dd2.innerHTML.should.eql('D');
	});
	it('query with .a.b', function () {
		const html = `<div class="a b"></div>`;
		const root = parse(html);
		const el = root.querySelector('.a.b');
		el.tagName.should.eql('DIV');
	});
	it('query with ul[item]', function () {
		const html = `<ul item="111" id="list"><li>Hello World</li></ul>`;
		const root = parse(html);
		const ul = root.querySelector('ul[item]');
		ul.tagName.should.eql('UL');
		const li = root.querySelector('ul#list');
		li.innerText.should.eql('Hello World');
	});
});

describe('issues/59', function () {
	it('query with tr td:nth-child(2)', function () {
		const html = `<tr>
  <td>
    <div>
      <span>
        a
			</span>
      <p>
        b
			</p>
      <p>
        c
			</p>
		</div>
  <td>ddd</td>
  <td>
    <span>
      eee
		</span>
	</td>
</tr>
`;
		const root = parse(html);
		const el = root.querySelector('tr td:nth-child(2)');
		el.innerHTML.should.eql('ddd');
	});
});

describe('issues/74', function () {
	it('query with td:nth-child', function () {
		const html = `<table>
<tbody>
   <tr class="odd">
      <td>13/10/2020</td>
      <td>
         Cell2
      </td>
      <td>
         <a href="/mjrcs-32432">Cell3</a>
      </td>
      <td>
         <a target="_blank" href="/5z9LX1.pdf" ><img alt="PDF File" src="/mjrcs-resa/images/v2/icone_pdf.gif"></a>
      </td>
      <td>
         <a target="winzip" href="/33WzKc.zip"><img alt="ZIP File" src="/mjrcs-resa/images/v2/icone_pdf_archive.gif" height="16" ></a>
      </td>
      <td>
         <a target="_blank" href="/3QhZGq.xml"><img alt="XML file"  src="/mjrcs-resa/images/v2/icone_xml.gif" height="16" ></a>
      </td>
      <td>
      </td>
   </tr>
</tbody>
</table>
`;
		const root = parse(html);
		const el = root.querySelector('table tbody tr td:nth-child(6) a');
		el.getAttribute('href').should.eql('/3QhZGq.xml');
	});
});
