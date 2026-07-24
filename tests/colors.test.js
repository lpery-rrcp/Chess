const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const codeRules = fs.readFileSync('chessRules.js', 'utf8');
const codeColors = fs.readFileSync('colors.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(codeRules, context);
vm.runInContext(codeColors, context);

assert.strictEqual(
  context.chooseStartingColor('white'),
  'white',
  'White should be accepted as the opening color.'
);
assert.strictEqual(
  context.chooseStartingColor('black'),
  'black',
  'Black should be accepted as the opening color.'
);
assert.strictEqual(
  context.chooseStartingColor('maybe'),
  'white',
  'Invalid input should fall back to white.'
);
assert.strictEqual(
  context.chooseStartingColor(null),
  'white',
  'Null input should fall back to white.'
);

console.log('Color selection tests passed.');
