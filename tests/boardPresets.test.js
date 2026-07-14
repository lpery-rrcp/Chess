const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const codeRules = fs.readFileSync('chessRules.js', 'utf8');
const context = { console };
vm.createContext(context);
vm.runInContext(codeRules, context);

const board = [
  ['wR', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['bR', '', '', '', '', '', '', '']
];

const preset = context.createBoardPreset('midevil', board, 'white');
assert.strictEqual(preset.name, 'midevil', 'The preset should keep its supplied name.');
assert.strictEqual(preset.side, 'white', 'The preset should keep its target side.');
assert.strictEqual(preset.boardState[0][0], 'wR', 'The preset should preserve the saved board state.');

const storedPresets = context.saveBoardPreset([], preset);
assert.strictEqual(storedPresets.length, 1, 'Saving a preset should store one entry.');
assert.strictEqual(storedPresets[0].name, 'midevil', 'The stored preset should keep the original name.');

const nextPreset = context.createBoardPreset('midevil', board, 'black');
const dedupedPresets = context.saveBoardPreset(storedPresets, nextPreset);
assert.strictEqual(dedupedPresets.length, 1, 'A preset with the same name should replace the earlier entry instead of duplicating it.');
assert.strictEqual(dedupedPresets[0].side, 'black', 'The replacement preset should update the stored side.');

const appliedBoard = context.applyBoardPresetToBoard(board, preset, 'black');
assert.strictEqual(appliedBoard[0][0], 'wR', 'Applying the preset should restore the saved board state.');
assert.strictEqual(appliedBoard[7][0], 'bR', 'Applying the preset should preserve the saved black-side piece too.');

console.log('Board preset tests passed.');
