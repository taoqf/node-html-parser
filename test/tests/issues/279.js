const { parse, valid } = require('@test/test-target');
const fs = require('fs');

describe('issue 279', function () {
	it('HTML considered invalid wrongly', function () {
		const content = fs.readFileSync(__dirname + '/../../assets/html/beego package - github.com_astaxie_beego - Go Packages.html', 'utf-8');
		valid(content).should.equal(true);
		const root = parse(content);
		const list = root.querySelectorAll('.go-Footer-listItem');
		list.length.should.equal(6);
	});
});
