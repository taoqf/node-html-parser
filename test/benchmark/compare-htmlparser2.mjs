import benchmark from 'htmlparser-benchmark';
import htmlparser2 from "htmlparser2";

const { Parser } = htmlparser2;

var bench = benchmark(function (html, callback) {
	var parser = new Parser({
		onend: callback,
		onerror: callback
	});
	parser.end(html);
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('htmlparser2     :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});