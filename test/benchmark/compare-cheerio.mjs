import benchmark from 'htmlparser-benchmark';
import { load } from "cheerio";

var bench = benchmark(function (html, callback) {
	// parse(html);
	const $ = load(html);
	$.html();
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('cheerio         :' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});
