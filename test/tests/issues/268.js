const { parse } = require('@test/test-target');

describe.skip('issue 268', function () {
	it('Wrong output on malformed HTML', function () {
		const html = `
<table id="mytable">
<tr class="myrow">
  <td>1</td>
  <td><a href="#" 2'>x</a></td>
  <td>2</td>
</tr>
<tr class="myrow">
  <td>3</td>
  <td><a href="#" 2'>x</a></td>
  <td>4</td>
</tr>
</table>`;
		const root = parse(html);
		root.querySelectorAll("#mytable tr.myrow").length.should.eql(2);
		// for (let tr of root.querySelectorAll("#mytable tr.myrow")) {
		// 	console.log('xxx',tr.querySelectorAll(":scope > td").map(e => e.innerText));
		// }
	});
	it('xxx', function () {
		const html = `<a href="#" 2'>x</a><a href="#" 2'>x</a>`;
		const root = parse(html);
		const a = root.querySelector("a");
		console.error('sss', a.attributes);
		a.toString().should.eql('<a href="#" 2">x</a>');
		// for (let tr of root.querySelectorAll("#mytable tr.myrow")) {
		// 	console.log('xxx',tr.querySelectorAll(":scope > td").map(e => e.innerText));
		// }
	});
});
