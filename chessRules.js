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

// checks for same color pieces (used for move validation and highlighting)
function isSameColor(pieceCode, otherPieceCode) {
  return getPieceColor(pieceCode) === getPieceColor(otherPieceCode);
}

// Basic move validation: a piece can move to an empty square or capture an opponent's piece
function canMoveTo(pieceCode, targetPieceCode) {
    // 
    if (!pieceCode) {
        return false;
    }

    if (!targetPieceCode) {
        return true;
    }

    return !isSameColor(pieceCode, targetPieceCode);
}

// Pawn move validation following standard chess rules.
// White pawns move toward smaller row numbers; black pawns move toward larger rows.
function canPawnMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }

    const color = getPieceColor(pieceCode);
    const direction = color === "white" ? -1 : 1;
    const rowDiff = targetRow - sourceRow;
    const colDiff = targetCol - sourceCol;

    const isStartingRow =
        (color === "white" && sourceRow === 6) ||
        (color === "black" && sourceRow === 1);

    // Forward move: one square ahead only if the destination is empty.
    if (colDiff === 0 && !targetPieceCode) {
        if (rowDiff === direction) {
            return true;
        }

        // Two-square first move: only from the starting row, and the middle square must be empty.
        if (
            isStartingRow &&
            rowDiff === 2 * direction &&
            !boardState[sourceRow + direction][sourceCol] &&
            !boardState[targetRow][targetCol]
        ) {
            return true;
        }
    }

    // Diagonal capture: one square forward and one square sideways, only onto an enemy piece.
    if (
        Math.abs(colDiff) === 1 &&
        rowDiff === direction &&
        targetPieceCode &&
        !isSameColor(pieceCode, targetPieceCode)
    ) {
        return true;
    }

    return false;
}


