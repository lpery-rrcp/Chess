/*
 * chessmovement.js
 * Piece movement validation and check/checkmate helpers.
 */

function canMoveTo(pieceCode, targetPieceCode) {
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

  return canMoveTo(pieceCode, targetPieceCode);
}

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

  if (colDiff === 0 && !targetPieceCode) {
    if (rowDiff === direction) {
      return true;
    }

    if (
      isStartingRow &&
      rowDiff === 2 * direction &&
      !boardState[sourceRow + direction][sourceCol] &&
      !boardState[targetRow][targetCol]
    ) {
      return true;
    }
  }

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

  if (targetPieceCode && isSameColor(pieceCode, targetPieceCode)) {
    return true;
  }

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

  if (rowDiff === colDiff) {
    const rowStep = targetRow > sourceRow ? 1 : -1;
    const colStep = targetCol > sourceCol ? 1 : -1;
    let currentRow = sourceRow + rowStep;
    let currentCol = sourceCol + colStep;

    while (currentRow !== targetRow && currentCol !== targetCol) {
      if (boardState[currentRow][currentCol]) {
        return false;
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

  if (rowDiff === 0 || colDiff === 0) {
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

  return (
    canRookMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol) ||
    canBishopMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
  );
}

function isSquareAttacked(boardState, row, col, attackerColor) {
  if (row < 0 || row > 7 || col < 0 || col > 7) {
    return false;
  }

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
    const opponentColor = getPieceColor(pieceCode) === "white" ? "black" : "white";

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

function simulateMove(boardState, sourceRow, sourceCol, targetRow, targetCol) {
  const simulatedBoard = boardState.map((row) => [...row]);
  const pieceCode = simulatedBoard[sourceRow]?.[sourceCol];

  if (!pieceCode) {
    return simulatedBoard;
  }

  simulatedBoard[targetRow][targetCol] = pieceCode;
  simulatedBoard[sourceRow][sourceCol] = "";

  const pieceType = pieceCode[1]?.toLowerCase();
  if (pieceType === "k" && Math.abs(targetCol - sourceCol) === 2) {
    const rookFromCol = targetCol > sourceCol ? 7 : 0;
    const rookToCol = targetCol > sourceCol ? targetCol - 1 : targetCol + 1;
    const rookPiece = simulatedBoard[sourceRow][rookFromCol];

    if (rookPiece) {
      simulatedBoard[sourceRow][rookToCol] = rookPiece;
      simulatedBoard[sourceRow][rookFromCol] = "";
    }
  }

  return simulatedBoard;
}

function isMoveLegal(boardState, sourceRow, sourceCol, targetRow, targetCol, playerColor) {
  if (!Array.isArray(boardState) || !boardState.length) {
    return false;
  }

  const pieceCode = boardState[sourceRow]?.[sourceCol];
  const targetPieceCode = boardState[targetRow]?.[targetCol];

  if (!pieceCode || getPieceColor(pieceCode) !== playerColor) {
    return false;
  }

  const pieceType = pieceCode[1]?.toLowerCase();
  const isMoveAllowed = pieceType === "p"
    ? canPawnMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
    : pieceType === "n"
      ? canKnightMove(pieceCode, targetPieceCode, sourceRow, sourceCol, targetRow, targetCol)
      : pieceType === "b"
        ? canBishopMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
        : pieceType === "r"
          ? canRookMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
          : pieceType === "q"
            ? canQueenMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
            : pieceType === "k"
              ? canKingMove(pieceCode, targetPieceCode, sourceRow, sourceCol, targetRow, targetCol, boardState)
              : pieceType === "z"
                ? canWizardMove(pieceCode, targetPieceCode, boardState, sourceRow, sourceCol, targetRow, targetCol)
                : canMoveTo(pieceCode, targetPieceCode);

  if (!isMoveAllowed) {
    return false;
  }

  const simulatedBoard = simulateMove(boardState, sourceRow, sourceCol, targetRow, targetCol);
  return !isKingInCheck(simulatedBoard, playerColor);
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

function isInCheck(boardState, playerColor) {
  return isKingInCheck(boardState, playerColor);
}

function isEitherKingInCheck(boardState) {
  return isKingInCheck(boardState, "white") || isKingInCheck(boardState, "black");
}

function getCheckStatus(boardState) {
  const whiteInCheck = isKingInCheck(boardState, "white");
  const blackInCheck = isKingInCheck(boardState, "black");
  const whiteInCheckmate = whiteInCheck && !hasLegalMoves(boardState, "white");
  const blackInCheckmate = blackInCheck && !hasLegalMoves(boardState, "black");

  return {
    whiteInCheck,
    blackInCheck,
    whiteInCheckmate,
    blackInCheckmate,
    winner: whiteInCheckmate ? "black" : blackInCheckmate ? "white" : null
  };
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

          const simulatedBoard = boardState.map((row) => [...row]);
          simulatedBoard[targetRow][targetCol] = pieceCode;
          simulatedBoard[sourceRow][sourceCol] = "";

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
