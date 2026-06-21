const { parse } = require('@test/test-target');

describe('issue 263', function () {
	it('should keep CDATA with angle brackets and preserve namespaced structure', function () {
		const html = `<ac:structured-macro
		  ac:name="code"
		  ac:schema-version="1"
		  ac:macro-id="some id">
			<ac:parameter ac:name="language">bash</ac:parameter>
			<ac:plain-text-body>
			  <![CDATA[
			  export AWS_ACCESS_KEY_ID=<your Access key ID> export AWS_SECRET_ACCESS_KEY=<your Secret access key>
			  ]]>
			</ac:plain-text-body>
		</ac:structured-macro>
		<p><br/></p>`;

		const output = parse(html).toString();
		const normalize = (s) => s.replace(/\s+/g, ' ').trim();

		output.should.containEql('<ac:plain-text-body>');
		output.should.containEql('</ac:plain-text-body>');
		output.should.containEql('<![CDATA[');
		output.should.containEql(']]>');
		output.should.containEql('AWS_ACCESS_KEY_ID=<your Access key ID>');
		output.should.containEql('AWS_SECRET_ACCESS_KEY=<your Secret access key>');
		output.should.not.containEql('AWS_SECRET_ACCESS_KEY=</your>');

		normalize(output).should.match(/<\/ac:plain-text-body>\s*<\/ac:structured-macro>\s*<p><br><\/p>/);
	});
});
