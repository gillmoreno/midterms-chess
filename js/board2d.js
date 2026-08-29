import { playMove, playCapture } from "./fx.js";

const Chess = window.Chess;
const Roster = window.Roster;

export function createBoard2D(container) {
  const root = document.createElement("div");
  root.id = "board2d";
  root.className = "board2d-root";
  container.appendChild(root);

  let pickHandler = null;
  let currentGame = null;
  let animating = false;
  let selectedSq = null;
  let legalMoves = [];
  let lastMove = null;
  let inspectMode = false;

  function renderBoard() {
    root.innerHTML = "";
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        const sq = Chess.sq(file, rank);
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "board2d-cell";
        cell.dataset.file = String(file);
        cell.dataset.rank = String(rank);
        cell.dataset.lite = (file + rank) % 2 === 1 ? "1" : "0";
        
        const isSelected = selectedSq === sq;
        const isLegal = legalMoves.some((m) => m.to === sq);
        const isLastFrom = lastMove && lastMove.from === sq;
        const isLastTo = lastMove && lastMove.to === sq;
        
        cell.dataset.selected = isSelected ? "1" : "0";
        cell.dataset.legal = isLegal ? "1" : "0";
        cell.dataset.lastmove = (isLastFrom || isLastTo) ? "1" : "0";
        cell.dataset.inspect = inspectMode ? "1" : "0";

        if (currentGame && currentGame.board[sq]) {
          const piece = currentGame.board[sq];
          const entry = Roster.entryFor(piece, file);
          
          const pieceWrap = document.createElement("div");
          pieceWrap.className = "board2d-piece";
          pieceWrap.dataset.side = piece.c === "w" ? "right" : "left";
          
          const img = document.createElement("img");
          // Use mobileToken for kings if available, otherwise use portrait
          let imgSrc = (piece.t === "k" && entry.mobileToken) ? entry.mobileToken : entry.portrait;
          
          // Check if king token is a stub, fall back to portrait
          if (piece.t === "k" && entry.mobileToken) {
            const testImg = new Image();
            testImg.src = entry.mobileToken;
            testImg.onerror = () => {
              img.src = entry.portrait;
            };
          }
          
          img.src = imgSrc;
          img.alt = entry.name;
          img.draggable = false;
          pieceWrap.appendChild(img);

          // Add role pip for non-pawns and non-kings
          if (piece.t !== "p" && piece.t !== "k") {
            const pip = document.createElement("div");
            pip.className = "piece-pip";
            pip.textContent = piece.t.toUpperCase();
            pieceWrap.appendChild(pip);
          }

          cell.appendChild(pieceWrap);
        }

        if (isLegal) {
          const dot = document.createElement("div");
          dot.className = "legal-hint";
          const hasCapture = legalMoves.find((m) => m.to === sq && m.capturedHint);
          dot.dataset.capture = hasCapture ? "1" : "0";
          cell.appendChild(dot);
        }

        cell.addEventListener("click", () => {
          if (pickHandler && !animating) {
            pickHandler(file, rank);
          }
        });

        root.appendChild(cell);
      }
    }
  }

  function rebuildPieces(game) {
    currentGame = game;
    renderBoard();
  }

  function setHighlights(selected, legal, last, inspect) {
    selectedSq = selected;
    legalMoves = legal || [];
    lastMove = last;
    inspectMode = inspect;
    renderBoard();
  }

  function animateMove({ from, to, captureSquare }, onDone) {
    animating = true;
    if (captureSquare != null) {
      playCapture();
    } else {
      playMove();
    }
    setTimeout(() => {
      animating = false;
      if (onDone) onDone();
    }, 300);
  }

  const ready = Promise.resolve();

  renderBoard();

  return {
    readyPromise: ready,
    isReady: () => true,
    rebuildPieces,
    setHighlights,
    animateMove,
    onPick: (fn) => {
      pickHandler = fn;
    },
    resize: () => {},
    busy: () => animating,
    cameraPos: () => ({ x: 0, y: 5, z: 0 }),
    focusOn: () => {},
    flipView: () => {},
  };
}
