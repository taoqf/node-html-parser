import benchmark from 'htmlparser-benchmark';
import htmlparser from "htmlparser";

const { Parser } = htmlparser;

var bench = benchmark(function (html, callback) {
	var handler = new htmlparser.DefaultHandler(function (error, dom) {
		if (error)
			callback();
		else
			callback();
	});
	var parser = new Parser(handler);
	parser.parseComplete(html);
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('htmlparser      :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});