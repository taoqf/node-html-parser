const { parse } = require('..');

// https://github.com/taoqf/node-html-parser/issues/62
describe('quote attributes', function () {
  it('escapes double quotes when using setAttribute', function () {
    const root = parse(`<div></div>`);
    const div = root.firstChild;
    div.setAttribute('foo', '[{"bar":"baz"}]');
    div
      .toString()
      .should.eql('<div foo="[{&quot;bar&quot;:&quot;baz&quot;}]"></div>');
  });

  it('escapes double quotes when using setAttributes', function () {
    const root = parse(`<div></div>`);
    const div = root.firstChild;
    div.setAttributes({ foo: '[{"bar":"baz"}]' });
    div
      .toString()
      .should.eql('<div foo="[{&quot;bar&quot;:&quot;baz&quot;}]"></div>');
  });

  it('parses attributes containing &quot;', function () {
    const root = parse('<div foo="[{&quot;bar&quot;:&quot;baz&quot;}]"></div>');
    const div = root.firstChild;
    div.getAttribute('foo').should.eql('[{"bar":"baz"}]');
    div.attributes.should.eql({
      foo: '[{"bar":"baz"}]',
    });
  });
});
