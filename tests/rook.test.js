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

const castlingBoard = [
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wR', '', '', '', 'wK', '', '', 'wR']
];

assert.strictEqual(
  context.canKingMove('wK', null, 7, 4, 7, 6, castlingBoard),
  true,
  'A king should be allowed to castle kingside when the path is clear.'
);

castlingBoard[7][5] = 'bP';
assert.strictEqual(
  context.canKingMove('wK', null, 7, 4, 7, 6, castlingBoard),
  false,
  'A king should not be able to castle through an attacked square.'
);

assert.strictEqual(
  context.normalizeSwapSide('white'),
  'white',
  'White should be accepted as a swap-side selection.'
);

assert.strictEqual(
  context.normalizeSwapSide('BLACK'),
  'black',
  'Black should be accepted as a swap-side selection.'
);

assert.strictEqual(
  context.normalizeSwapSide('maybe'),
  null,
  'Invalid swap-side input should be rejected.'
);

assert.strictEqual(
  context.canSwapPieces('wR', 'bB'),
  true,
  'A rook and bishop should be allowed to swap.'
);

assert.strictEqual(
  context.canSwapPieces('wK', 'bB'),
  false,
  'A king should not be allowed to swap.'
);

assert.strictEqual(
  context.canSwapPieces('wQ', 'bN'),
  false,
  'A queen should not be allowed to swap.'
);

assert.strictEqual(
  context.canSwapPieces('wP', 'bR'),
  false,
  'A pawn should not be allowed to swap.'
);

const kingCaptureBoard = [
  ['wK', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['bR', '', '', '', '', '', '', '']
];

assert.strictEqual(
  context.getWinnerFromKingCapture('black', 'wK'),
  'black',
  'A move that captures the opposing king should award the capturing side the win.'
);
assert.strictEqual(
  context.isKingCaptured('wK'),
  true,
  'A white king piece code should be recognized as a king capture target.'
);

const checkBoard = [
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['wR', '', '', '', 'bK', '', '', '']
];

assert.strictEqual(
  context.isInCheck(checkBoard, 'black'),
  true,
  'Black should be in check from a rook on the same rank.'
);
assert.strictEqual(
  context.isEitherKingInCheck(checkBoard),
  true,
  'Either king check helper should return true when one side is in check.'
);
assert.deepStrictEqual(
  context.getCheckStatus(checkBoard),
  {
    whiteInCheck: false,
    blackInCheck: true,
    whiteInCheckmate: false,
    blackInCheckmate: false,
    winner: null
  },
  'Check status should report only black in check.'
);

const checkmateBoard = [
  ['', '', '', '', '', '', '', 'bK'],
  ['', '', '', '', '', '', '', 'wR'],
  ['', '', '', '', '', '', 'wQ', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', 'wK', '', '', '']
];

assert.strictEqual(
  context.isInCheck(checkmateBoard, 'black'),
  true,
  'Black should be in check in the mate position.'
);
assert.strictEqual(
  context.isCheckmate(checkmateBoard, 'black'),
  true,
  'Black should be in checkmate in the mate position.'
);
assert.deepStrictEqual(
  context.getCheckStatus(checkmateBoard),
  {
    whiteInCheck: false,
    blackInCheck: true,
    whiteInCheckmate: false,
    blackInCheckmate: true,
    winner: 'white'
  },
  'Check status should report black checkmate and white as the winner.'
);

console.log('Rook move tests passed.');
