const { parse } = require('@test/test-target');

// https://github.com/taoqf/node-html-parser/issues/70
describe('issues/70', function () {
	it('should get attribute with :', function () {
		const html = `\n\n<!doctype html>\n<html class="no-js" lang="en">\n\n<head> \n\n<meta property="og:type" content="product" />\n</head></html>`;
		const root = parse(html);
		const el = root.querySelector('meta');
		el.getAttribute('property').should.eql('og:type');
	});
	it('should get attribute with _', function () {
		const html = `<button type="submit" name="add-to-cart" value="12121" data-product_id="12121" data-quantity="1" class="some_add_to_cart_class other_add_to_cart_class third_add_to_cart_class random_other_class  button alt">My button</button>
>`;
		const root = parse(html);
		const el = root.querySelector('button');
		el.getAttribute('data-product_id').should.eql('12121');
	});
});
