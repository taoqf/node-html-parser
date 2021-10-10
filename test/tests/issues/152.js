const { parse } = require('@test/test-target');

describe.skip('issue 152', function () {
	it('shoud parse attributes right', function () {
		const html = `<div>
<div id="chr-content">
<span>
  lkjasdkjasdkljakldj
</div>
</div>`;
		const root = parse(html);
		root.toString().should.eql(html);
		// const div = root.firstChild;
		// div.getAttribute('#input').should.eql('');
		// div.getAttribute('(keyup)').should.eql('applyFilter($event)');
		// div.getAttribute('placeholder').should.eql('Ex. IMEI');
		// root.innerHTML.should.eql(html);
	});
});
