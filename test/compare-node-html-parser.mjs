import benchmark from 'htmlparser-benchmark';
import { parse } from '../dist/esm/index.js';

// const { parse } = node_html_parser;

var bench = benchmark(function (html, callback) {
	parse(html);
	callback();
});

bench.on('progress', function (key) {
	// console.log('finished parsing ' + key + '.html');
});

bench.on('result', function (stat) {
	console.log('node-html-parser:' + stat.mean().toPrecision(6) + ' ms/file ± ' + stat.sd().toPrecision(6));
});