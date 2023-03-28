const cells = document.querySelectorAll(".cell");
const resetButton = document.querySelector(".reset-button");
const modeButtons = document.querySelectorAll(".mode-button");
const modeMessage = document.querySelector(".mode-message");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const difficultyContainer = document.querySelector(".difficulty-container");
const gameOverlay = document.querySelector(".game-overlay");
const startButton = document.querySelector(".start-button");

let currentPlayer = "X";
let isOnePlayerMode = null;
let difficulty = null;

difficultyButtons.forEach((button) => {
	button.addEventListener("click", changeDifficulty);
});

cells.forEach((cell) => {
	cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);
modeButtons.forEach((button) => {
	button.addEventListener("click", changeMode);
});

startButton.addEventListener("click", validateAndStartGame);

function startGame() {
	gameOverlay.classList.add("hidden");
	modeMessage.classList.remove("hidden");
}

function validateAndStartGame() {
	startGame();

	if (!validateGameSettings()) {
		alert("Please select a player mode and a difficulty below.");
	}
}

function handleCellClick(event) {
	if (!validateGameSettings()) {
		alert(
			"Please select player mode and difficulty (for 1-player mode) first!"
		);
		return;
	}

	const cell = event.target;

	if (cell.getAttribute("data-player")) {
		return;
	}

	cell.setAttribute("data-player", currentPlayer);

	if (checkWin(currentPlayer)) {
		alert(`${currentPlayer} wins!`);
		resetGame();
		return;
	}

	if (checkDraw()) {
		alert("It's a tie!");
		resetGame();
		return;
	}

	currentPlayer = currentPlayer === "X" ? "O" : "X";

	if (isOnePlayerMode && currentPlayer === "O") {
		computerMove();
	}
}

function computerMove() {
	switch (difficulty) {
		case "normal":
			if (!blockOpponentWin()) {
				makeRandomMove();
			}
			break;
		case "hard":
			minimaxMove();
			break;
		case "easy":
		default:
			makeRandomMove();
			break;
	}

	if (checkWin(currentPlayer)) {
		alert(`${currentPlayer} wins!`);
		resetGame();
		return;
	}

	if (checkDraw()) {
		alert("It's a tie!");
		resetGame();
		return;
	}

	currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function checkWin(player) {
	const winningCombinations = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];

	return winningCombinations.some((combination) => {
		return combination.every((index) => {
			return cells[index].getAttribute("data-player") === player;
		});
	});
}

function checkDraw() {
	return [...cells].every((cell) => cell.getAttribute("data-player"));
}

function resetGame() {
	cells.forEach((cell) => {
		cell.removeAttribute("data-player");
		cell.textContent = "";
	});
	currentPlayer = "X";
}

function changeMode(event) {
	const mode = event.target.dataset.mode;
	isOnePlayerMode = mode === "1-player";
	if (isOnePlayerMode) {
		difficultyContainer.classList.remove("hidden");
		modeMessage.textContent = "1 Player Mode";
	} else {
		difficultyContainer.classList.add("hidden");
		modeMessage.textContent = "2 Player Mode";
	}
	resetGame();
}

function makeRandomMove() {
	const emptyCells = [...cells].filter(
		(cell) => !cell.getAttribute("data-player")
	);
	if (emptyCells.length === 0) {
		return;
	}
	const randomIndex = Math.floor(Math.random() * emptyCells.length);
	emptyCells[randomIndex].setAttribute("data-player", currentPlayer);
}

function blockOpponentWin() {
	for (let i = 0; i < cells.length; i++) {
		if (!cells[i].getAttribute("data-player")) {
			cells[i].setAttribute("data-player", currentPlayer === "X" ? "O" : "X");
			if (checkWin(cells[i].getAttribute("data-player"))) {
				cells[i].setAttribute("data-player", currentPlayer);
				return true;
			}
			cells[i].removeAttribute("data-player");
		}
	}
	return false;
}

function minimaxMove() {
	let bestScore = -Infinity;
	let bestMove;

	for (let i = 0; i < cells.length; i++) {
		if (!cells[i].getAttribute("data-player")) {
			cells[i].setAttribute("data-player", currentPlayer);
			let score = minimax(0, true, -Infinity, Infinity);
			cells[i].removeAttribute("data-player");
			if (score > bestScore) {
				bestScore = score;
				bestMove = i;
			}
		}
	}

	cells[bestMove].setAttribute("data-player", currentPlayer);
}

function minimax(depth, isMaximizing, alpha, beta) {
	const winner = getWinner();
	if (winner !== null) {
		return winner === "O" ? 10 - depth : depth - 10;
	}

	if (checkDraw()) {
		return 0;
	}

	if (isMaximizing) {
		let bestScore = -Infinity;
		for (let i = 0; i < cells.length; i++) {
			if (!cells[i].getAttribute("data-player")) {
				cells[i].setAttribute("data-player", "O");
				let score = minimax(depth + 1, false, alpha, beta);
				cells[i].removeAttribute("data-player");
				bestScore = Math.max(score, bestScore);
				alpha = Math.max(alpha, bestScore);
				if (beta <= alpha) {
					break;
				}
			}
		}
		return bestScore;
	} else {
		let bestScore = Infinity;
		for (let i = 0; i < cells.length; i++) {
			if (!cells[i].getAttribute("data-player")) {
				cells[i].setAttribute("data-player", "X");
				let score = minimax(depth + 1, true, alpha, beta);
				cells[i].removeAttribute("data-player");
				bestScore = Math.min(score, bestScore);
				beta = Math.min(beta, bestScore);
				if (beta <= alpha) {
					break;
				}
			}
		}
		return bestScore;
	}
}

function getWinner() {
	if (checkWin("O")) {
		return "O";
	}
	if (checkWin("X")) {
		return "X";
	}
	return null;
}

function changeDifficulty(event) {
	difficulty = event.target.dataset.difficulty;
	resetGame();

	difficultyButtons.forEach((button) => {
		button.classList.remove("difficulty-button-selected");
	});

	event.target.classList.add("difficulty-button-selected");
}

function validateGameSettings() {
	if (isOnePlayerMode === null) {
		return false;
	}

	if (isOnePlayerMode && difficulty === null) {
		return false;
	}

	return true;
}
