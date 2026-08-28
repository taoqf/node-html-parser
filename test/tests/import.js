const { execSync }  = require('child_process');
const path  = require('path');

describe(`Module Import`, function () {
  this.timeout(20000);

  it(`ESM project can import and use named exports`, function() {
    try {
      execSync('node --loader ts-node/esm index.ts', {
        cwd: path.resolve(__dirname, '../assets/packages/esm'),
        stdio: "pipe"
      }).toString().should.eql('parse succeeded\n')
    } catch (e) {
      if (e.message && e.message.includes('fileExists')) {
        this.skip();
      } else throw e;
    }
  });

  it(`CommonJS project can import and use named exports`, function() {
    try {
      execSync('node -r ts-node/register index.ts', {
        cwd: path.resolve(__dirname, '../assets/packages/cjs'),
        stdio: "pipe"
      }).toString().should.eql('parse succeeded\n')
    } catch (e) {
      if (e.message && e.message.includes('fileExists')) {
        this.skip();
      } else throw e;
    }
  });
});