const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const codeRules = fs.readFileSync('chessRules.js', 'utf8');
const codeMovement = fs.readFileSync('chessmovement.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(codeRules, context);
vm.runInContext(codeMovement, context);

const board = [
  ['wR', '', '', '', '', '', '', ''],
  ['wR', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['bR', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '']
];

const swappedCount = context.bulkSwapPieces(board, 'white', 'r', 'z');
assert.strictEqual(swappedCount, 2, 'Bulk swapping should replace every matching piece for the selected side.');
assert.strictEqual(board[0][0], 'wZ', 'White rooks should be replaced with wizards in bulk swap.');
assert.strictEqual(board[1][0], 'wZ', 'Each matching white rook should be changed during bulk swap.');
assert.strictEqual(board[6][0], 'bR', 'Black pieces should remain unchanged during a white-side bulk swap.');

const swappedBoard = [
  ['wR', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['bR', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '']
];

assert.strictEqual(context.swapPiecesOnBoard(swappedBoard, 0, 0, 6, 0), true, 'Two pieces should be swapped when a valid swap is requested.');
assert.strictEqual(swappedBoard[0][0], 'bR', 'The first selected piece should receive the second piece code.');
assert.strictEqual(swappedBoard[6][0], 'wR', 'The second selected piece should receive the first piece code.');
assert.strictEqual(context.swapPiecesOnBoard(swappedBoard, 0, 0, 9, 9), false, 'Invalid board coordinates should be rejected.');

console.log('Swap helper tests passed.');
