let legalSquares = [];
let isWhiteTurn = true;
// Get all board squares and pieces
const BOARD_SQUARES = document.getElementsByClassName("square");
const PIECES = document.getElementsByClassName("piece");
const PIECES_IMAGES = document.getElementsByTagName("img");

setupBoardSquares();
setupPieces();

// --- Setup Functions ---
function setupBoardSquares() {
    for (let i = 0; i < BOARD_SQUARES.length; i++) {
        const square = BOARD_SQUARES[i];

        // Allow dropping on all squares
        square.addEventListener("dragover", allowDrop);
        square.addEventListener("drop", drop);
        square.addEventListener("dragenter", highlightSquare);
        square.addEventListener("dragleave", unhighlightSquare);

        // Give each square an id like "a8", "b8", etc.
        let row = 8 - Math.floor(i / 8);
        let col = String.fromCharCode(97 + (i % 8)); // 'a' = 97
        square.id = col + row;
    }
}

function setupPieces() {
    for (let i = 0; i < PIECES.length; i++) {
        const piece = PIECES[i];
        piece.setAttribute("draggable", true);
        piece.addEventListener("dragstart", drag);

        // Give each piece a unique id (e.g., "Rooka8")
        const name = piece.classList[1] || "piece";
        const square = piece.parentElement.id || "";
        piece.id = `${name}_${square}`;
    }

    // Prevent images from interfering with drag events
    for (let i = 0; i < PIECES_IMAGES.length; i++) {
        PIECES_IMAGES[i].setAttribute("draggable", false);
    }
}

// --- Drag and Drop Handlers ---
function allowDrop(ev) {
    ev.preventDefault(); // Important so drop works
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const pieceId = ev.dataTransfer.getData("text");
    const piece = document.getElementById(pieceId);
    const square = ev.currentTarget;

    // Remove highlight when dropped
    square.classList.remove("highlight");

    // Move piece into new square
    square.appendChild(piece);
}

function highlightSquare(ev) {
    ev.currentTarget.classList.add("highlight");
}

function unhighlightSquare(ev) {
    ev.currentTarget.classList.remove("highlight");
}
