import benchmark from 'htmlparser-benchmark';
import parse5 from "parse5";

var bench = benchmark(function (html, callback) {
	parse5.parse(html);
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('parse5          :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});