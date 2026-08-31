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
  let flipped = false;

  function renderBoard() {
    root.innerHTML = "";
    // Real board flip: reverse rank iteration when flipped
    const ranks = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
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
          // Use mobileToken if available, fallback to portrait on error
          if (entry.mobileToken) {
            img.src = entry.mobileToken;
            img.onerror = () => {
              img.onerror = null;
              img.src = entry.portrait;
            };
          } else {
            img.src = entry.portrait;
          }
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
    
    // Find the piece to animate
    const fromFile = Chess.fileOf(from);
    const fromRank = Chess.rankOf(from);
    const toFile = Chess.fileOf(to);
    const toRank = Chess.rankOf(to);
    
    // Get the cells
    const fromCell = root.querySelector(`[data-file="${fromFile}"][data-rank="${fromRank}"]`);
    const toCell = root.querySelector(`[data-file="${toFile}"][data-rank="${toRank}"]`);
    
    if (!fromCell || !toCell) {
      // Fallback if cells not found
      if (captureSquare != null) {
        playCapture();
      } else {
        playMove();
      }
      setTimeout(() => {
        animating = false;
        if (onDone) onDone();
      }, 400);
      return;
    }
    
    const pieceWrap = fromCell.querySelector('.board2d-piece');
    if (!pieceWrap) {
      // No piece to animate
      if (captureSquare != null) {
        playCapture();
      } else {
        playMove();
      }
      setTimeout(() => {
        animating = false;
        if (onDone) onDone();
      }, 400);
      return;
    }
    
    // Create a flying clone
    const flyingPiece = pieceWrap.cloneNode(true);
    flyingPiece.style.position = 'absolute';
    flyingPiece.style.pointerEvents = 'none';
    flyingPiece.style.zIndex = '1000';
    
    // Get positions
    const fromRect = fromCell.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    
    // Set initial position relative to board
    flyingPiece.style.left = (fromRect.left - rootRect.left) + 'px';
    flyingPiece.style.top = (fromRect.top - rootRect.top) + 'px';
    flyingPiece.style.width = fromRect.width + 'px';
    flyingPiece.style.height = fromRect.height + 'px';
    flyingPiece.style.transition = 'left 2s ease-in-out, top 2s ease-in-out';
    
    // Hide original piece
    pieceWrap.style.opacity = '0';
    
    // Add flying piece to board
    root.appendChild(flyingPiece);
    
    // Play sound immediately
    if (captureSquare != null) {
      playCapture();
    } else {
      playMove();
    }
    
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      flyingPiece.style.left = (toRect.left - rootRect.left) + 'px';
      flyingPiece.style.top = (toRect.top - rootRect.top) + 'px';
    });
    
    // Clean up after animation
    setTimeout(() => {
      if (flyingPiece.parentNode) {
        flyingPiece.remove();
      }
      if (pieceWrap) {
        pieceWrap.style.opacity = '';
      }
      animating = false;
      if (onDone) onDone();
    }, 2000);
  }

  function flipView() {
    flipped = !flipped;
    renderBoard();
  }

  function resetFlip() {
    flipped = false;
    renderBoard();
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
    flipView,
    resetFlip,
  };
}
