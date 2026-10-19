const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { parse } = require('@test/test-target');

function checkParents(parent) {
	parent.childNodes.forEach((child) => {
		assert.equal(child.parentNode, parent);
		checkParents(child);
	});
}

describe('unclosed tag repair', function () {
	const content = 'alpha<!--note--><b>beta</b>omega';
	for (const sameTag of [false, true]) {
		const opening = sameTag ? '<section><section>' : '<section>';
		const input = `<main>before${opening}${content}`;
		const repaired = `<main>before${sameTag ? '<section></section>' : ''}${content}</main>`;

		for (const preserve of [undefined, false, true]) {
			it(`preserves child order and parent links (${sameTag ? 'same' : 'different'} tags, parseNoneClosedTags=${preserve})`, function () {
				const root = parse(input, { comment: true, parseNoneClosedTags: preserve });
				const expected = preserve ? `${input}${sameTag ? '</section>' : ''}</section></main>` : repaired;
				assert.equal(root.toString(), expected);
				checkParents(root);
				const bold = root.querySelector('b');
				assert.equal(bold.previousSibling.toString(), '<!--note-->');
				assert.equal(bold.nextSibling.toString(), 'omega');
			});
		}

		it(`handles empty unclosed ${sameTag ? 'same' : 'different'} tags`, function () {
			const root = parse(`<main>${opening}`);
			assert.equal(root.toString(), `<main>${sameTag ? '<section></section>' : ''}</main>`);
			checkParents(root);
		});

		it(`repairs many children of unclosed ${sameTag ? 'same' : 'different'} tags within a bounded process`, function () {
			this.timeout(15000);
			const args = [];
			if (process.env.TEST_TARGET !== 'dist' && !process.env.CI) {
				args.push('-r', require.resolve('ts-node/register'));
			}
			args.push('-e', `
				const assert = require('node:assert/strict');
				const { parse } = require(process.argv[1]);
				const sameTag = process.argv[2] === 'true';
				const count = 32000;
				const content = '<b>item</b>'.repeat(count);
				const opening = sameTag ? '<section><section>' : '<section>';
				const root = parse('<main>' + opening + content);
				const parent = root.firstChild;
				const items = sameTag ? parent.childNodes.slice(1) : parent.childNodes;
				assert.equal(items.length, count);
				for (const item of items) {
					assert.equal(item.rawTagName, 'b');
					assert.equal(item.text, 'item');
					assert.equal(item.parentNode, parent);
					assert.equal(item.firstChild.parentNode, item);
				}
				assert.equal(root.toString(), '<main>' + (sameTag ? '<section></section>' : '') + content + '</main>');
				process.stdout.write('ok');
			`, require.resolve('@test/test-target'), String(sameTag));
			// Isolate synchronous parsing so a regression cannot hang the test runner.
			// The linear path has ample headroom; repeated sibling filtering times out.
			const result = spawnSync(process.execPath, args, { timeout: 8000, encoding: 'utf8', windowsHide: true });
			assert.ifError(result.error);
			assert.equal(result.status, 0, result.stderr);
			assert.equal(result.stdout, 'ok');
		});
	}

	it('keeps properly closed parents and their mixed children', function () {
		const html = `<main>before<section>${content}</section>after</main>`;
		const root = parse(html, { comment: true });
		assert.equal(root.toString(), html);
		checkParents(root);
	});
});
