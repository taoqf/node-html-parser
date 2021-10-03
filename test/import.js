const { execSync }  = require('child_process');
const path  = require('path');

describe(`Module Import`, function () {
  this.timeout(20000);

  it(`ESM project can import and use named exports`, () => {
    execSync('node --loader ts-node/esm index.ts', {
      cwd: path.resolve(__dirname, 'assets/esm'),
      stdio: "pipe"
    }).toString().should.eql('parse succeeded\n')
  });

  it(`CommonJS project can import and use named exports`, () => {
    execSync('node -r ts-node/register index.ts', {
      cwd: path.resolve(__dirname, 'assets/cjs'),
      stdio: "pipe"
    }).toString().should.eql('parse succeeded\n')
  });
});