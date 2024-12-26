const { parse } = require('@test/test-target');

describe('issue 277', function () {
	it('custom tag name', function () {
		const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>test</title>
  </head>
  <body>
  <template>
    <h@1>Smile!</h@1>
  </template>
  </body>
</html>`;
		const root = parse(html);
		const t = root.querySelector('template');
		const el = t.childNodes[1];
		el.toString().should.eql('<h@1>Smile!</h@1>');
	});
	it('unicode tag name', function () {
		const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>test</title>
  </head>
  <body>
  <template>
    <h测试اختبار>Smile!</h测试اختبار>
  </template>
  </body>
</html>`;
		const root = parse(html);
		const t = root.querySelector('template');
		const el = t.childNodes[1];
		el.toString().should.eql('<h测试اختبار>Smile!</h测试اختبار>');
	});
});
