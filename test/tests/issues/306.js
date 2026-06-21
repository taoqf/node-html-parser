const { parse } = require('@test/test-target');

describe('issue 306 quoteAttribute corrupts attribute values containing \\ / \t / \n ', function () {
	it('preserves backslashes in attribute values during serialization and round-trip parsing', function () {
		const doc = parse("<div></div>");
		const div = doc.firstChild;
		div.setAttribute("path", "C:\\Users\\test");   // string is exactly:  C:\Users\test

		console.log("set value : C:\\Users\\test");
		console.log("serialized: " + div.toString());

		div.toString().should.equal('<div path="C:\\Users\\test"></div>');

		const doc2 = parse(div.toString());
		console.log("round-trip:", JSON.stringify(doc2.firstChild.getAttribute("path")));

		doc2.firstChild.getAttribute("path").should.equal("C:\\Users\\test");
	});
});
