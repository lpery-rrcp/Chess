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

function basicMoveValidation(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }
    const pieceType = pieceCode[1].toLowerCase();
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

function canKnightMove(pieceCode, targetPieceCode, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }

    const rowDiff = Math.abs(targetRow - sourceRow);
    const colDiff = Math.abs(targetCol - sourceCol);
    
    // Knight moves in an L-shape: 2 squares in one direction and 1 square in the perpendicular direction.
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        return canMoveTo(pieceCode, targetPieceCode);
    }  
    return false;
}

function canBishopMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }

    const rowDiff = Math.abs(targetRow - sourceRow);
    const colDiff = Math.abs(targetCol - sourceCol);

    // Bishop moves diagonally: the absolute difference between rows and columns must be the same.
    if (rowDiff === colDiff) {
        // Check if the path is clear (no pieces in between).
        const rowStep = targetRow > sourceRow ? 1 : -1;
        const colStep = targetCol > sourceCol ? 1 : -1;
        let currentRow = sourceRow + rowStep;
        let currentCol = sourceCol + colStep;
        while (currentRow !== targetRow && currentCol !== targetCol) {
            if (boardState[currentRow][currentCol]) {
                return false; // Path is blocked by another piece.
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        return canMoveTo(pieceCode, targetPieceCode);
    }
    return false;   
}

function canRookMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }

    const rowDiff = Math.abs(targetRow - sourceRow);
    const colDiff = Math.abs(targetCol - sourceCol);

    // Rook moves in straight lines: either the row or the column must be the same.
    if (rowDiff === 0 || colDiff === 0) {
        // Check if the path is clear (no pieces in between).
        const rowStep = targetRow > sourceRow ? 1 : (targetRow < sourceRow ? -1 : 0);
        const colStep = targetCol > sourceCol ? 1 : (targetCol < sourceCol ? -1 : 0);

        let currentRow = sourceRow + rowStep;
        let currentCol = sourceCol + colStep;

        while (currentRow !== targetRow || currentCol !== targetCol) {
            if (boardState[currentRow] && boardState[currentRow][currentCol]) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }

        return canMoveTo(pieceCode, targetPieceCode);
    }

    return false;
}

// function canQueenMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
//     if (!pieceCode) {
//         return false;
//     }

//     // Queen moves like a rook or a bishop.
//     return (
//         canRookMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) ||
//         canBishopMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
//     );
// }   