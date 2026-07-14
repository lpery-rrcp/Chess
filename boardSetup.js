function createBoardPreset(name, boardState, side) {
  if (!name || !Array.isArray(boardState) || !boardState.length) {
    return null;
  }

  const normalizedSide = typeof normalizeSwapSide === "function"
    ? normalizeSwapSide(side)
    : (side === "black" ? "black" : side === "white" ? "white" : null);

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

  const normalizedSide = typeof normalizeSwapSide === "function"
    ? normalizeSwapSide(side)
    : (side === "black" ? "black" : side === "white" ? "white" : null);

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
