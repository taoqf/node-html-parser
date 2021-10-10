const { parse } = require('@test/test-target');
const fs = require('fs');

describe.skip('Memory leak', function () {
	it('nothing mached', async function (done) {
		this.timeout(6000000);
		const lang = 'en';
		let i = 0;
		const cat = {};
		// const cat = {};
		const content = fs.readFileSync(__dirname + '/../assets/html/view-source_https___epicentrk.ua_shop_kirpich-ogneupornyy_.html', 'utf-8');
		while (++i < 10000) {
			let root = parse(content);
			const parent = Math.random().toString();
			try {
				let title = (() => {
					const t = root.querySelector(`.shop-categories__title`);
					if (!t) {
						return root.querySelector(`.headList h1`);
					}
					return t;
				})();
				// name = JSON.parse(JSON.stringify(title.text)).trim();
				// name = title.text.trim();
				const name = title.text;
				if (!cat[parent]) {
					cat[parent] = {
						name: {},
					};
				}
				cat[parent][`name`][lang] = name;

				if (!name) {
					console.error(`not found name`);
				}
				name.should.eql('Кирпич огнеупорный');
			} catch (error) { console.error(error); }
			finally {
				title = null;
			}
		}
		// done();
	});
});
