const fs = require('fs');

const { valid, parse } = require('@test/test-target');

describe('parseWithValidation', function () {
	// parse with validation tests

	it('should return Object with valid: true.  does not count <p><p></p> as error. instead fixes it to <p></p><p></p>', function () {
		const result = valid('<p><p></p>');
		result.should.eql(true);
	})

	it('should return Object with valid: true.  does not count <p><p/></p> as error. instead fixes it to <p><p></p></p>', function () {
		const result = valid('<p><p/></p>');
		result.should.eql(true);
	})

	it('should return Object with valid: false.  does not count <p><h3></p> as error', function () {
		const result = valid('<p><h3></p>');
		result.should.eql(false);
	})

	it('hillcrestpartyrentals.html  should return Object with valid: false.  not closing <p> tag on line 476', function () {
		const result = valid(fs.readFileSync(__dirname + '/../assets/html/hillcrestpartyrentals.html').toString());
		result.should.eql(false);
	})

	it('google.html  should return Object with valid: true', function () {
		const result = valid(fs.readFileSync(__dirname + '/../assets/html/google.html').toString());
		result.should.eql(true);
	})

	it('gmail.html  should return Object with valid: true', function () {
		const result = valid(fs.readFileSync(__dirname + '/../assets/html/gmail.html').toString());
		result.should.eql(true);
	})

	it('ffmpeg.html  should return Object with valid: false (extra opening <div>', function () {
		const result = valid(fs.readFileSync(__dirname + '/../assets/html/ffmpeg.html').toString());
		result.should.eql(false);
	})

	// fix issue speed test

	it('should fix "<div><h3><h3><div>" to "<div><h3></h3></div>"', function () {
		const result = valid('<div data-id=1><h3 data-id=2><h3><div>');
		result.should.eql(false);
		const root = parse('<div data-id=1><h3 data-id=2><h3><div>');
		root.toString().should.eql('<div data-id=1><h3 data-id=2></h3></div>');
	})

	it('should fix "<div><h3><h3><span><span><div>" to "<div><h3></h3><span></span></div>"', function () {
		const result = valid('<div><h3><h3><span><span><div>');
		result.should.eql(false);
		const root = parse('<div><h3><h3><span><span><div>');
		root.toString().should.eql('<div><h3></h3><span></span></div>');
	})

	it('gmail.html  should return Object with valid: true', function () {
		const result = valid(fs.readFileSync(__dirname + '/../assets/html/gmail.html').toString().replace(/<\//gi, '<'));
		result.should.eql(false);
	})

	it('gmail.html  should return Object with valid: true', function () {
		const result = valid(fs.readFileSync(__dirname + '/../assets/html/nice.html').toString().replace(/<\//gi, '<'));
		result.should.eql(false);
	})
});

