const { parse } = require('../dist/cjs/index.js');

// https://github.com/taoqf/node-html-parser/issues/98
describe('getAttribute should be case insensitive', function () {
	it('namal', function () {
		const root = parse('<a onclick="listener()"></a>');
		root.firstChild.getAttribute('onclick').should.eql('listener()');
	});
	it('get attribute in origin name', function () {
		const root = parse('<a onClick="listener()"></a>');
		root.firstChild.getAttribute('onClick').should.eql('listener()');
	});
	it('get attribute in lowercase', function () {
		const root = parse('<a onClick="listener()"></a>');
		root.firstChild.getAttribute('onclick').should.eql('listener()');
	});
	it('set attribute in lowercase', function () {
		const root = parse('<a onClick="listener()"></a>');
		const a = root.firstChild;
		a.setAttribute('onclick', 'listener2');
		a.getAttribute('onclick').should.eql('listener2');
		root.toString().should.eql('<a onClick="listener2"></a>');
	});
	it('add attributes', function () {
		const root = parse('<a onClick="listener()"></a>');
		const a = root.firstChild;
		a.setAttribute('onclick', 'listener2');
		a.getAttribute('onclick').should.eql('listener2');
		a.setAttribute('onDoubleClick', 'listener3');
		a.getAttribute('onDoubleClick').should.eql('listener3');
		root.toString().should.eql('<a onClick="listener2" onDoubleClick="listener3"></a>');
	});
});
