const { parse } = require('@test/test-target');

// see: https://github.com/taoqf/node-html-parser/issues/129
describe('Prototype pollution', () => {
  it('prevents prototype pollution',  () => {
    const root = parse('<a href="#" __proto__="polluted=true">');
    should(root.firstChild.attributes.polluted).not.be.ok();
    should(root.firstChild.attributes.hasOwnProperty('proto__')).be.ok();
  });
});
