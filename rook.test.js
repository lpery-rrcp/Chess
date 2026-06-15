const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const code = fs.readFileSync('chessRules.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(code, context);

const board = [
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
];
board[0][0] = 'wR';

assert.strictEqual(
  context.canRookMove('wR', null, board, 0, 0, 0, 3),
  true,
  'A rook should be allowed to move along an empty row.'
);

board[0][1] = 'bP';
assert.strictEqual(
  context.canRookMove('wR', null, board, 0, 0, 0, 2),
  false,
  'A rook should be blocked by a piece on its path.'
);

console.log('Rook move tests passed.');
