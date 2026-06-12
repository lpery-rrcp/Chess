const boardElement = document.getElementById("chess-board");

const pieceNames = {
  r: "Rook",
  n: "Knight",
  b: "Bishop",
  q: "Queen",
  k: "King",
  p: "Pawn"
};

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

renderBoard();

boardElement.addEventListener("dragstart", handleDragStart);
boardElement.addEventListener("dragover", handleDragOver);
boardElement.addEventListener("dragleave", handleDragLeave);
boardElement.addEventListener("drop", handleDrop);
boardElement.addEventListener("dragend", clearHighlight);

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
      if (pieceCode) {
        square.appendChild(createPiece(pieceCode));
      }

      boardElement.appendChild(square);
    }
  }
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

function handleDragStart(event) {
  const piece = event.target.closest(".piece");

  if (!piece) {
    return;
  }

  draggedPiece = piece.parentElement;
  event.dataTransfer.setData("text/plain", draggedPiece.id);
  piece.classList.add("dragging");
}

function handleDragOver(event) {
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

  const pieceType = movedPiece ? movedPiece[1].toLowerCase() : "";

  // Use the pawn-specific rule for pawns, and the basic rule for all other pieces.
  const isMoveAllowed = pieceType === "p"
    ? canPawnMove(movedPiece, targetPiece, boardState, sourceRow, sourceCol, targetRow, targetCol)
    : canMoveTo(movedPiece, targetPiece);

  if (!isMoveAllowed) {
    clearHighlight();
    return;
  }

  boardState[targetRow][targetCol] = movedPiece;
  boardState[sourceRow][sourceCol] = "";

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

  draggedPiece = null;
}
