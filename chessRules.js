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

function canWizardMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }

    if (sourceRow === targetRow && sourceCol === targetCol) {
        return false;
    }

    const color = getPieceColor(pieceCode);
    const direction = color === "white" ? -1 : 1;
    const rowDiff = targetRow - sourceRow;
    const colDiff = targetCol - sourceCol;

    // Wizard can swap places with any same-color piece anywhere on the board.
    if (targetPieceCode && isSameColor(pieceCode, targetPieceCode)) {
        return true;
    }

    // Wizard moves exactly 2 spaces forward and can jump over pieces.
    if (colDiff === 0 && rowDiff === 2 * direction) {
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

function canQueenMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode) {
        return false;
    }

    // Queen moves like a rook or a bishop.
    return (
        canRookMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) ||
        canBishopMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
    );
}   

function isSquareAttacked(boardState, row, col, attackerColor) {
    if (row < 0 || row > 7 || col < 0 || col > 7) {
        return false;
    }

    const pieceCode = `${attackerColor[0]}`;

    const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
    ];

    for (const [dr, dc] of knightMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
            newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7 &&
            boardState[newRow]?.[newCol] === `${attackerColor === "white" ? "w" : "b"}N`
        ) {
            return true;
        }
    }

    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of kingMoves) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
            newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7 &&
            boardState[newRow]?.[newCol] === `${attackerColor === "white" ? "w" : "b"}K`
        ) {
            return true;
        }
    }

    const pawnDirection = attackerColor === "white" ? 1 : -1;
    const pawnRow = row + pawnDirection;
    for (const pawnCol of [col - 1, col + 1]) {
        if (
            pawnRow >= 0 && pawnRow <= 7 &&
            pawnCol >= 0 && pawnCol <= 7 &&
            boardState[pawnRow]?.[pawnCol] === `${attackerColor === "white" ? "w" : "b"}P`
        ) {
            return true;
        }
    }

    const slidingDirections = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    for (const [dr, dc] of slidingDirections) {
        let currentRow = row + dr;
        let currentCol = col + dc;

        while (currentRow >= 0 && currentRow <= 7 && currentCol >= 0 && currentCol <= 7) {
            const piece = boardState[currentRow]?.[currentCol];
            if (piece) {
                const pieceColor = getPieceColor(piece);
                const pieceType = piece[1]?.toLowerCase();
                if (pieceColor === attackerColor) {
                    if (
                        ((Math.abs(dr) === 1 && Math.abs(dc) === 1) && (pieceType === "b" || pieceType === "q")) ||
                        ((dr === 0 || dc === 0) && (pieceType === "r" || pieceType === "q"))
                    ) {
                        return true;
                    }
                    break;
                }
                break;
            }
            currentRow += dr;
            currentCol += dc;
        }
    }

    return false;
}

function canCastleMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) {
    if (!pieceCode || pieceCode[1].toLowerCase() !== "k") {
        return false;
    }

    const color = getPieceColor(pieceCode);
    const rowDiff = targetRow - sourceRow;
    const colDiff = targetCol - sourceCol;

    if (rowDiff !== 0 || Math.abs(colDiff) !== 2) {
        return false;
    }

    if (!targetPieceCode) {
        const rookCol = colDiff > 0 ? 7 : 0;
        const rookPiece = boardState[sourceRow][rookCol];
        if (!rookPiece || rookPiece[1].toLowerCase() !== "r") {
            return false;
        }

        const pathCols = colDiff > 0
            ? [sourceCol + 1, sourceCol + 2]
            : [sourceCol - 1, sourceCol - 2];

        for (const pathCol of pathCols) {
            if (boardState[sourceRow][pathCol]) {
                return false;
            }
        }

        const kingSide = colDiff > 0;
        const squaresToCheck = kingSide
            ? [sourceCol, sourceCol + 1, sourceCol + 2]
            : [sourceCol, sourceCol - 1, sourceCol - 2];
        const opponentColor = color === "white" ? "black" : "white";

        for (const pathCol of squaresToCheck) {
            if (isSquareAttacked(boardState, sourceRow, pathCol, opponentColor)) {
                return false;
            }
        }

        return true;
    }

    return false;
}

function canKingMove(pieceCode, targetPieceCode, sourceRow, sourceCol, targetRow, targetCol, boardState) {
    if (!pieceCode) {
        return false;
    }

    const rowDiff = Math.abs(targetRow - sourceRow);
    const colDiff = Math.abs(targetCol - sourceCol);

    if (rowDiff <= 1 && colDiff <= 1) {
        return canMoveTo(pieceCode, targetPieceCode);
    }

    if (boardState && canCastleMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)) {
        return true;
    }

    return false;
}

function findKing(boardState, kingColor) {
    const kingCode = kingColor === "white" ? "wK" : "bK";
    for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            if (boardState[row][col] === kingCode) {
                return { row, col };
            }
        }
    }
    return null;
}

function isKingInCheck(boardState, kingColor) {
    const kingPos = findKing(boardState, kingColor);
    if (!kingPos) {
        return false;
    }

    const opponentColor = kingColor === "white" ? "black" : "white";
    return isSquareAttacked(boardState, kingPos.row, kingPos.col, opponentColor);
}

function hasLegalMoves(boardState, playerColor) {
    for (let sourceRow = 0; sourceRow < 8; sourceRow += 1) {
        for (let sourceCol = 0; sourceCol < 8; sourceCol += 1) {
            const pieceCode = boardState[sourceRow][sourceCol];
            if (!pieceCode || getPieceColor(pieceCode) !== playerColor) {
                continue;
            }

            const pieceType = pieceCode[1]?.toLowerCase();

            for (let targetRow = 0; targetRow < 8; targetRow += 1) {
                for (let targetCol = 0; targetCol < 8; targetCol += 1) {
                    if (sourceRow === targetRow && sourceCol === targetCol) {
                        continue;
                    }

                    const targetPiece = boardState[targetRow][targetCol];

                    const isMoveAllowed = pieceType === "p"
                        ? canPawnMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
                        : pieceType === "n"
                            ? canKnightMove(pieceCode, targetPiece, sourceRow, sourceCol, targetRow, targetCol)
                            : pieceType === "b"
                                ? canBishopMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
                                : pieceType === "r"
                                    ? canRookMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
                                    : pieceType === "q"
                                        ? canQueenMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
                                        : pieceType === "k"
                                            ? canKingMove(pieceCode, targetPiece, sourceRow, sourceCol, targetRow, targetCol, boardState)
                                            : pieceType === "z"
                                                ? canWizardMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
                                                : canMoveTo(pieceCode, targetPiece);

                    if (!isMoveAllowed) {
                        continue;
                    }

                    // Simulate the move to check if it leaves the king in check
                    const simulatedBoard = boardState.map((row) => [...row]);
                    simulatedBoard[targetRow][targetCol] = pieceCode;
                    simulatedBoard[sourceRow][sourceCol] = "";

                    // Handle castling rook movement in simulation
                    if (pieceType === "k" && Math.abs(targetCol - sourceCol) === 2) {
                        const rookFromCol = targetCol > sourceCol ? 7 : 0;
                        const rookToCol = targetCol > sourceCol ? targetCol - 1 : targetCol + 1;
                        const rookPiece = simulatedBoard[sourceRow][rookFromCol];
                        if (rookPiece) {
                            simulatedBoard[sourceRow][rookToCol] = rookPiece;
                            simulatedBoard[sourceRow][rookFromCol] = "";
                        }
                    }

                    if (!isKingInCheck(simulatedBoard, playerColor)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function isKingCaptured(pieceCode) {
    return pieceCode === "wK" || pieceCode === "bK";
}

function getWinnerFromKingCapture(capturingColor, capturedKingCode) {
    if (capturingColor === "white" && capturedKingCode === "bK") {
        return "white";
    }

    if (capturingColor === "black" && capturedKingCode === "wK") {
        return "black";
    }

    return null;
}

function isCheckmate(boardState, playerColor) {
    return isKingInCheck(boardState, playerColor) && !hasLegalMoves(boardState, playerColor);
}

