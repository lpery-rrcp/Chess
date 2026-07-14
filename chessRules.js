/*
 * chessRules.js
 * Small starter rules for the board: piece color checks and move validation.
*/

function getPieceColor(pieceCode) {
  if (!pieceCode) {
    return null;
  }

  return pieceCode.startsWith("w") ? "white" : "black";
}

function normalizeSwapSide(input) {
  if (typeof input !== "string") {
    return null;
  }

  const normalized = input.trim().toLowerCase();
  if (normalized === "white" || normalized === "w") {
    return "white";
  }

  if (normalized === "black" || normalized === "b") {
    return "black";
  }

  return null;
}

// checks for same color pieces (used for move validation and highlighting)
function isSameColor(pieceCode, otherPieceCode) {
  return getPieceColor(pieceCode) === getPieceColor(otherPieceCode);
}

function getPieceType(pieceCode) {
  if (!pieceCode) {
    return null;
  }

  return pieceCode[1]?.toLowerCase() ?? null;
}

function buildPieceCode(color, pieceType) {
  if (!color || !pieceType) {
    return "";
  }

  return `${color[0]}${pieceType.toUpperCase()}`;
}

function isSwapEligible(pieceCode) {
  const pieceType = getPieceType(pieceCode);
  return ["r", "b", "n", "z"].includes(pieceType);
}

function canSwapPieces(pieceCodeA, pieceCodeB) {
  return (
    isSwapEligible(pieceCodeA) &&
    isSwapEligible(pieceCodeB)
  );
}

function bulkSwapPieces(boardState, side, fromType, toType) {
  if (!Array.isArray(boardState) || !boardState.length) {
    return 0;
  }

  const normalizedSide = normalizeSwapSide(side);
  if (!normalizedSide || !fromType || !toType) {
    return 0;
  }

  const fromCode = fromType.toLowerCase();
  const toCode = toType.toLowerCase();
  if (fromCode === toCode) {
    return 0;
  }

  const sidePrefix = normalizedSide[0];
  let swappedCount = 0;

  for (let row = 0; row < boardState.length; row += 1) {
    for (let col = 0; col < boardState[row].length; col += 1) {
      const pieceCode = boardState[row][col];
      if (!pieceCode || pieceCode[0] !== sidePrefix || getPieceType(pieceCode) !== fromCode) {
        continue;
      }

      boardState[row][col] = buildPieceCode(normalizedSide, toCode);
      swappedCount += 1;
    }
  }

  return swappedCount;
}

function swapPiecesOnBoard(boardState, sourceRow, sourceCol, targetRow, targetCol) {
  if (!Array.isArray(boardState) || !boardState.length) {
    return false;
  }

  if (
    !Number.isInteger(sourceRow) ||
    !Number.isInteger(sourceCol) ||
    !Number.isInteger(targetRow) ||
    !Number.isInteger(targetCol) ||
    sourceRow < 0 ||
    sourceRow > 7 ||
    sourceCol < 0 ||
    sourceCol > 7 ||
    targetRow < 0 ||
    targetRow > 7 ||
    targetCol < 0 ||
    targetCol > 7
  ) {
    return false;
  }

  const sourcePiece = boardState[sourceRow]?.[sourceCol];
  const targetPiece = boardState[targetRow]?.[targetCol];

  if (!sourcePiece || !targetPiece || !canSwapPieces(sourcePiece, targetPiece)) {
    return false;
  }

  [boardState[sourceRow][sourceCol], boardState[targetRow][targetCol]] = [targetPiece, sourcePiece];
  return true;
}

function createBoardPreset(name, boardState, side) {
  if (!name || !Array.isArray(boardState) || !boardState.length) {
    return null;
  }

  const normalizedSide = normalizeSwapSide(side);
  if (!normalizedSide) {
    return null;
  }

  return {
    name: String(name).trim(),
    side: normalizedSide,
    boardState: boardState.map((row) => [...row])
  };
}

function saveBoardPreset(existingPresets, preset) {
  if (!Array.isArray(existingPresets)) {
    return [];
  }

  if (!preset) {
    return existingPresets;
  }

  const nextPresets = existingPresets.filter((entry) => entry?.name !== preset.name);
  nextPresets.push(preset);
  return nextPresets;
}

function applyBoardPresetToBoard(boardState, preset, side) {
  if (!Array.isArray(boardState) || !boardState.length || !preset?.boardState) {
    return boardState;
  }

  const normalizedSide = normalizeSwapSide(side);
  if (!normalizedSide) {
    return boardState;
  }

  const targetBoard = boardState.map((row) => [...row]);
  const sourceBoard = preset.boardState;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const sourcePiece = sourceBoard[row]?.[col];
      const isTargetSidePiece = sourcePiece && getPieceColor(sourcePiece) === normalizedSide;
      if (sourcePiece && isTargetSidePiece) {
        targetBoard[row][col] = sourcePiece;
      } else if (!sourcePiece) {
        targetBoard[row][col] = "";
      }
    }
  }

  return targetBoard;
}

