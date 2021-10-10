import benchmark from 'htmlparser-benchmark';
import high5 from "high5";

const Parser = high5;

var token = [],
	tag = null,
	attribs = null;

function noop() { }



var bench = benchmark(function (html, callback) {
	var parser = new Parser({
		token: token,
		onopentagname: function (n) {
			attribs = {};
			tag = ["StartTag", n, attribs];
		},
		onclosetag: function (n) {
			token.push(["EndTag", n]);
		},
		ontext: function (t) {
			token.push(["Character", t]);
		},
		oncomment: function (t) {
			token.push(["Comment", t]);
		},
		onattribute: function (n, v) {
			if (!(n in attribs)) attribs[n] = v;
		},
		onopentagend: function () {
			token.push(tag);
			tag = attribs = null;
		},
		onselfclosingtag: function () {
			tag.push(true);
			token.push(tag);
			tag = attribs = null;
		},
		ondoctype: function (name, publicIdent, systemIdent, normalMode) {
			token.push(["DOCTYPE", name, publicIdent, systemIdent, normalMode]);
		},
		oncommentend: noop,
		onend: callback,
		onerror: callback
	});
	parser.end(html);
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('high5           :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});