const boardElement = document.getElementById("chess-board");
const turnIndicator = document.getElementById("turn-indicator");
const swapButton = document.getElementById("swap-mode-button");
const setupButton = document.getElementById("setup-mode-button");
const setupControls = document.getElementById("setup-controls");
const pageMode = document.body?.dataset.pageMode || "game";

const pieceNames = {
  r: "Rook",
  n: "Knight",
  b: "Bishop",
  q: "Queen",
  k: "King",
  p: "Pawn",
  z: "Wizard"
};

const STORAGE_KEY = "chess-board-state";

const initialBoard = [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]
];

let boardState = initialBoard.map((row) => [...row]);
let draggedPiece = null;
let currentTurn = "white";
let hasGameStarted = false;
let isSwapMode = pageMode === "swap";
let isSetupMode = false;
let selectedSwapPiece = null;
let selectedSetupSide = "white";
let selectedSetupPiece = "r";
let selectedSwapSide = "white";
let selectedSwapFrom = "r";
let selectedSwapTo = "z";
let gameWinner = null;

const swapControls = document.getElementById("bulk-swap-controls");
const swapAllButton = document.getElementById("swap-all-button");
const startGameButton = document.getElementById("start-game-button");
const defaultBoardButton = document.getElementById("default-board-button");

function loadPersistedBoardState() {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (!storedState) {
      return;
    }

    const parsedState = JSON.parse(storedState);
    if (Array.isArray(parsedState?.boardState)) {
      boardState = parsedState.boardState.map((row) => [...row]);
    }

    if (parsedState?.currentTurn) {
      currentTurn = parsedState.currentTurn;
    }
  } catch (error) {
    console.warn("Unable to restore board state", error);
  }
}

function saveBoardState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ boardState, currentTurn }));
  } catch (error) {
    console.warn("Unable to save board state", error);
  }
}

function isProtectedPieceCode(pieceCode) {
  if (!pieceCode) {
    return false;
  }

  const pieceType = pieceCode[1]?.toLowerCase();
  return pieceType === "q" || pieceType === "k" || pieceType === "p";
}

function isProtectedSetupPlacement(row, col) {
  const currentPiece = boardState[row]?.[col];
  return isProtectedPieceCode(currentPiece);
}

if (setupButton) {
  setupButton.addEventListener("click", toggleSetupMode);
}

if (setupControls) {
  setupControls.addEventListener("click", handleSetupControlsClick);
}

if (pageMode === "swap" && swapControls) {
  swapControls.addEventListener("change", handleSwapControlsChange);
  swapControls.addEventListener("click", handleSwapControlsClick);
}

if (startGameButton) {
  startGameButton.addEventListener("click", startGame);
}

if (defaultBoardButton) {
  defaultBoardButton.addEventListener("click", resetToDefaultBoard);
}

loadPersistedBoardState();
renderBoard();

if (pageMode === "game") {
  boardElement.addEventListener("dragstart", handleDragStart);
  boardElement.addEventListener("dragover", handleDragOver);
  boardElement.addEventListener("dragleave", handleDragLeave);
  boardElement.addEventListener("drop", handleDrop);
  boardElement.addEventListener("dragend", clearHighlight);
}

boardElement.addEventListener("click", handleBoardClick);

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function updateTurnIndicator() {
  if (turnIndicator) {
    if (gameWinner) {
      turnIndicator.textContent = `${capitalize(gameWinner)} wins by checkmate!`;
    } else {
      turnIndicator.textContent = `${capitalize(currentTurn)} to move`;
    }
  }
}

function updateSwapButton() {
  if (!swapButton) {
    return;
  }

  swapButton.disabled = hasGameStarted;
  swapButton.textContent = isSwapMode ? "Cancel Swap" : "Swap Pieces";
  swapButton.classList.toggle("active", isSwapMode);
}

function updateSwapControls() {
  if (!swapControls) {
    return;
  }

  swapControls.hidden = !isSwapMode || hasGameStarted;

  const sideSelect = document.getElementById("swap-side-select");
  const fromSelect = document.getElementById("swap-from-select");
  const toSelect = document.getElementById("swap-to-select");

  if (sideSelect) {
    sideSelect.value = selectedSwapSide;
  }

  if (fromSelect) {
    fromSelect.value = selectedSwapFrom;
  }

  if (toSelect) {
    toSelect.value = selectedSwapTo;
  }
}

function updateSetupControls() {
  if (!setupControls || !setupButton) {
    return;
  }

  setupControls.hidden = !isSetupMode;
  setupButton.textContent = isSetupMode ? "Done Setup" : "Custom Setup";
  setupButton.classList.toggle("active", isSetupMode);

  setupControls.querySelectorAll(".setup-side-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.setupSide === selectedSetupSide);
  });

  setupControls.querySelectorAll(".setup-piece-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.setupPiece === selectedSetupPiece);
  });
}

function startGame() {
  saveBoardState();
  window.location.href = "index.html";
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = document.createElement("div");
      const file = String.fromCharCode(97 + col);
      const rank = 8 - row;

      square.className = `square ${(row + col) % 2 === 0 ? "white" : "black"}`;
      square.id = `${file}${rank}`;
      square.dataset.row = String(row);
      square.dataset.col = String(col);

      if (row === 0) {
        const rankLabel = document.createElement("span");
        rankLabel.className = "coordinate rank";
        rankLabel.textContent = String(rank);
        square.appendChild(rankLabel);
      }

      if (col === 7) {
        const fileLabel = document.createElement("span");
        fileLabel.className = "coordinate file";
        fileLabel.textContent = file;
        square.appendChild(fileLabel);
      }

      const pieceCode = boardState[row][col];
      const isSelectedSwapSquare =
        selectedSwapPiece &&
        selectedSwapPiece.row === row &&
        selectedSwapPiece.col === col;

      if (isSelectedSwapSquare) {
        square.classList.add("selected-swap");
      }

      if (isSetupMode && isProtectedSetupPlacement(row, col)) {
        square.classList.add("locked");
      }

      if (pieceCode) {
        square.appendChild(createPiece(pieceCode));
      }

      boardElement.appendChild(square);
    }
  }

  updateTurnIndicator();
  updateSwapButton();
  updateSwapControls();
  updateSetupControls();
  saveBoardState();
}

function createPiece(pieceCode) {
  const color = pieceCode.startsWith("w") ? "white" : "black";
  const type = pieceCode[1].toLowerCase();
  const label = pieceNames[type];
  const colorLabel = color === "white" ? "White" : "Black";

  const piece = document.createElement("div");
  piece.className = `piece ${label.toLowerCase()} ${color}`;
  piece.dataset.type = type;
  piece.dataset.color = color;
  piece.draggable = true;

  const image = document.createElement("img");
  image.src = `PNG/${colorLabel}_Pieces/${colorLabel}-${label}.png`;
  image.alt = `${colorLabel} ${label}`;
  image.draggable = false;

  piece.appendChild(image);
  return piece;
}

function toggleSetupMode() {
  isSetupMode = !isSetupMode;
  if (isSetupMode) {
    isSwapMode = false;
  } else if (pageMode === "swap") {
    isSwapMode = true;
  }
  renderBoard();
}

function handleSwapControlsChange(event) {
  const target = event.target;

  if (target.id === "swap-side-select") {
    selectedSwapSide = target.value;
  } else if (target.id === "swap-from-select") {
    selectedSwapFrom = target.value;
  } else if (target.id === "swap-to-select") {
    selectedSwapTo = target.value;
  }

  renderBoard();
}

function handleSwapControlsClick(event) {
  if (event.target.closest("#swap-all-button")) {
    performSwapAll();
  }
}

function handleSetupControlsClick(event) {
  const defaultButton = event.target.closest("#default-board-button");
  if (defaultButton) {
    resetToDefaultBoard();
    return;
  }

  const sideButton = event.target.closest("[data-setup-side]");
  if (sideButton) {
    selectedSetupSide = sideButton.dataset.setupSide;
    renderBoard();
    return;
  }

  const pieceButton = event.target.closest("[data-setup-piece]");
  if (pieceButton) {
    selectedSetupPiece = pieceButton.dataset.setupPiece;
    renderBoard();
    return;
  }

}

function handleSetupPlacement(row, col) {
  if (isProtectedSetupPlacement(row, col)) {
    return;
  }

  const pieceCode = selectedSetupPiece === "clear"
    ? ""
    : `${selectedSetupSide[0]}${selectedSetupPiece.toUpperCase()}`;

  boardState[row][col] = pieceCode;
  renderBoard();
}

function resetToDefaultBoard() {
  boardState = initialBoard.map((row) => [...row]);
  currentTurn = "white";
  gameWinner = null;
  renderBoard();
}

function performSwapAll() {
  if (selectedSwapFrom === selectedSwapTo) {
    return;
  }

  bulkSwapPieces(boardState, selectedSwapSide, selectedSwapFrom, selectedSwapTo);
  selectedSwapPiece = null;
  renderBoard();
}

function handleSwapSelection(row, col) {
  const clickedPiece = boardState[row]?.[col];
  if (!clickedPiece || getPieceColor(clickedPiece) !== selectedSwapSide || !isSwapEligible(clickedPiece)) {
    return "ignored";
  }

  if (!selectedSwapPiece) {
    selectedSwapPiece = { row, col };
    renderBoard();
    return "selected";
  }

  const selectedRow = selectedSwapPiece.row;
  const selectedCol = selectedSwapPiece.col;
  const selectedPiece = boardState[selectedRow]?.[selectedCol];

  if (!selectedPiece || (selectedRow === row && selectedCol === col)) {
    selectedSwapPiece = null;
    renderBoard();
    return "cleared";
  }

  if (!canSwapPieces(selectedPiece, clickedPiece)) {
    selectedSwapPiece = null;
    renderBoard();
    return "cleared";
  }

  const swapped = swapPiecesOnBoard(boardState, selectedRow, selectedCol, row, col);
  selectedSwapPiece = null;
  renderBoard();
  return swapped ? "swapped" : "ignored";
}

function handleBoardClick(event) {
  if (isSetupMode) {
    const square = event.target.closest(".square");
    if (!square) {
      return;
    }

    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);

    handleSetupPlacement(row, col);
    return;
  }

  if (!isSwapMode || hasGameStarted) {
    return;
  }

  const square = event.target.closest(".square");
  if (!square) {
    return;
  }

  const row = Number(square.dataset.row);
  const col = Number(square.dataset.col);
  const swapAction = handleSwapSelection(row, col);

  if (swapAction === "swapped") {
    isSwapMode = false;
    updateSwapButton();
  }
}

function handleDragStart(event) {
  const piece = event.target.closest(".piece");

  if (!piece || isSetupMode || isSwapMode || gameWinner) {
    return;
  }

  const square = piece.parentElement;
  if (!square) {
    return;
  }

  const sourceRow = Number(square.dataset.row);
  const sourceCol = Number(square.dataset.col);
  const pieceCode = boardState[sourceRow]?.[sourceCol];

  if (!pieceCode || getPieceColor(pieceCode) !== currentTurn) {
    event.preventDefault();
    return;
  }

  draggedPiece = square;
  event.dataTransfer.setData("text/plain", draggedPiece.id);
  piece.classList.add("dragging");
  const srcRow = Number(square.dataset.row);
  const srcCol = Number(square.dataset.col);
  highlightLegalMoves(srcRow, srcCol);
}

function handleDragOver(event) {
  if (isSetupMode || isSwapMode) {
    return;
  }

  event.preventDefault();

  const square = event.target.closest(".square");
  if (square) {
    square.classList.add("hover");
  }
}

function handleDragLeave(event) {
  const square = event.target.closest(".square");
  if (square) {
    square.classList.remove("hover");
  }
}

function handleDrop(event) {
  if (isSetupMode || isSwapMode) {
    return;
  }

  if (gameWinner) {
    return;
  }

  event.preventDefault();

  const targetSquare = event.target.closest(".square");
  if (!targetSquare || !draggedPiece) {
    return;
  }

  const sourceRow = Number(draggedPiece.dataset.row);
  const sourceCol = Number(draggedPiece.dataset.col);
  const targetRow = Number(targetSquare.dataset.row);
  const targetCol = Number(targetSquare.dataset.col);

  if (sourceRow === targetRow && sourceCol === targetCol) {
    clearHighlight();
    return;
  }

  const movedPiece = boardState[sourceRow][sourceCol];
  const targetPiece = boardState[targetRow][targetCol];

  if (!movedPiece || getPieceColor(movedPiece) !== currentTurn) {
    clearHighlight();
    return;
  }

  const pieceType = movedPiece ? movedPiece[1].toLowerCase() : "";

  // Use piece-specific rules for pawns, knights, and bishops, and the basic rule for all other pieces.
  const isMoveAllowed = pieceType === "p"
    ? canPawnMove(movedPiece, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
    : pieceType === "n"
      ? canKnightMove(movedPiece, targetPiece, sourceRow, sourceCol, targetRow, targetCol)
    : pieceType === "b"
      ? canBishopMove(movedPiece, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
    : pieceType === "r"
      ? canRookMove(movedPiece, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
    : pieceType === "q"
      ? canQueenMove(movedPiece, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
    : pieceType === "k"
      ? canKingMove(movedPiece, targetPiece, sourceRow, sourceCol, targetRow, targetCol, boardState)
    : pieceType === "z"
      ? canWizardMove(movedPiece, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
        : canMoveTo(movedPiece, targetPiece);
      

  if (!isMoveAllowed) {
    clearHighlight();
    return;
  }

  boardState[targetRow][targetCol] = movedPiece;
  boardState[sourceRow][sourceCol] = "";

  if (pieceType === "k" && Math.abs(targetCol - sourceCol) === 2) {
    const rookFromCol = targetCol > sourceCol ? 7 : 0;
    const rookToCol = targetCol > sourceCol ? targetCol - 1 : targetCol + 1;
    const rookPiece = boardState[sourceRow][rookFromCol];

    if (rookPiece) {
      boardState[sourceRow][rookToCol] = rookPiece;
      boardState[sourceRow][rookFromCol] = "";
    }
  }

  hasGameStarted = true;
  currentTurn = currentTurn === "white" ? "black" : "white";

  // Check for checkmate on the opponent
  if (isCheckmate(boardState, currentTurn)) {
    gameWinner = currentTurn === "white" ? "black" : "white";
  }

  if (isSwapMode) {
    isSwapMode = false;
    selectedSwapPiece = null;
  }

  clearHighlight();
  renderBoard();
}

function clearHighlight() {
  document.querySelectorAll(".square.hover").forEach((square) => {
    square.classList.remove("hover");
  });

  document.querySelectorAll(".piece.dragging").forEach((piece) => {
    piece.classList.remove("dragging");
  });

  // remove move / capture highlights
  document.querySelectorAll(".square.move-target").forEach((sq) => {
    sq.classList.remove("move-target");
  });

  document.querySelectorAll(".piece.captureable").forEach((pc) => {
    pc.classList.remove("captureable");
  });

  draggedPiece = null;
}

// Highlight squares the piece at sourceRow,sourceCol can move to.
function highlightLegalMoves(sourceRow, sourceCol) {
  // Clear any existing highlights first
  document.querySelectorAll(".square.move-target").forEach((sq) => sq.classList.remove("move-target"));
  document.querySelectorAll(".piece.captureable").forEach((pc) => pc.classList.remove("captureable"));

  const pieceCode = boardState[sourceRow]?.[sourceCol];
  if (!pieceCode) return;

  const pieceType = pieceCode[1]?.toLowerCase();

  for (let tr = 0; tr < 8; tr += 1) {
    for (let tc = 0; tc < 8; tc += 1) {
      if (tr === sourceRow && tc === sourceCol) continue;

      const targetPiece = boardState[tr][tc];

      const isAllowed = pieceType === "p"
        ? canPawnMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, tr, tc)
        : pieceType === "n"
          ? canKnightMove(pieceCode, targetPiece, sourceRow, sourceCol, tr, tc)
          : pieceType === "b"
            ? canBishopMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, tr, tc)
            : pieceType === "r"
              ? canRookMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, tr, tc)
              : pieceType === "q"
                ? canQueenMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, tr, tc)
                : pieceType === "k"
                  ? canKingMove(pieceCode, targetPiece, sourceRow, sourceCol, tr, tc, boardState)
                  : pieceType === "z"
                    ? canWizardMove(pieceCode, targetPiece, boardState, sourceRow, sourceCol, tr, tc)
                    : canMoveTo(pieceCode, targetPiece);

      if (isAllowed) {
        const file = String.fromCharCode(97 + tc);
        const rank = 8 - tr;
        const squareEl = document.getElementById(`${file}${rank}`);
        if (squareEl) {
          squareEl.classList.add("move-target");
          if (targetPiece && getPieceColor(targetPiece) !== getPieceColor(pieceCode)) {
            const pieceEl = squareEl.querySelector(".piece");
            if (pieceEl) pieceEl.classList.add("captureable");
          }
        }
      }
    }
  }
}
