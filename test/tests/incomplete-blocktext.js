const { parse } = require('@test/test-target');

describe('unterminated block-text elements', function () {
	it('does not append a stray "<" to an unclosed <script>', function () {
		const root = parse('<script>var a = 1;', { script: true });
		const script = root.firstChild;
		script.rawTagName.should.eql('script');
		script.text.should.eql('var a = 1;');
		root.toString().should.eql('<script>var a = 1;</script>');
	});
	it('does not append a stray "<" to an unclosed <style>', function () {
		const root = parse('<style>.a{color:red}', { style: true });
		const style = root.firstChild;
		style.text.should.eql('.a{color:red}');
	});
});
