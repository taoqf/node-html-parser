const { parse } = require('@test/test-target');

function elapsed(fn) {
	const start = process.hrtime.bigint();
	fn();
	return Number(process.hrtime.bigint() - start) / 1e6; // ms
}

describe('issue 317', function () {
	it('parses alternating text/element siblings correctly', function () {
		const root = parse('<div>a<br>b<br></div>');
		const div = root.firstChild;
		div.childNodes.length.should.eql(4);
		div.childNodes.map((node) => node.parentNode).should.eql([div, div, div, div]);
		root.toString().should.eql('<div>a<br>b<br></div>');
	});

	it('scales linearly when text and element siblings alternate under one parent', function () {
		this.timeout(20000);
		const build = (n) => `<div>${'line<br>'.repeat(n)}</div>`;
		// Warm up so JIT state is comparable between the two measurements.
		parse(build(2000));

		const small = Math.max(elapsed(() => parse(build(4000))), 1);
		const large = elapsed(() => parse(build(32000)));

		// 8x the input should cost roughly 8x the time. Quadratic behaviour costs ~64x;
		// allow generous headroom for a noisy CI box while still failing on O(n^2).
		(large / small).should.be.below(24);
	});
});
