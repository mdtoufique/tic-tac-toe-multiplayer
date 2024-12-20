//import axios from "axios";

let humanMoves = "";
let pcMoves = "";

const winningCombinations = [
	[1, 2, 3],
	[4, 5, 6],
	[7, 8, 9],
	[1, 4, 7],
	[2, 5, 8],
	[3, 6, 9],
	[1, 5, 9],
	[3, 5, 7],
];

function checkWinner(playerMoves) {
	for (let combo of winningCombinations) {
		if (combo.every((pos) => playerMoves.includes(pos))) {
			return true;
		}
	}
	return false;
}

console.log("hi");
document.querySelectorAll(".btn").forEach((e) => {
	e.addEventListener("click", function () {
		console.log("hi");
		const move = e.id;
		e.innerText = "X";
		e.disabled = true;
		e.style.color = "red";
		humanMoves += move;
		let pcMovesArray = pcMoves.split("").map((num) => parseInt(num, 10)); // [4, 5, 2]
		let humanMovesArray = humanMoves.split("").map((num) => parseInt(num, 10)); // [1, 3, 6]

		// Calculate total length (pcMovesArray.length + humanMovesArray.length)
		let totalLength = pcMovesArray.length + humanMovesArray.length;

		if (checkWinner(humanMovesArray)) 
		{
			displayMessage("Human WINS");
			document.querySelectorAll(".btn").forEach((e) => {
				e.disabled = true;
			});
			
		} 
		else if (totalLength === 9) 
		{
			displayMessage("DRAW");
			document.querySelectorAll(".btn").forEach((e) => {
				e.disabled = true;
			});
			
		} 
		else 
		{
			axios
				.get("https://tic-tac-toe-multiplayer-e1cr.onrender.com/pcserver", {
					params: {
						moves: pcMoves + "+" + humanMoves,
					},
				})
				.then((response) => {
					

			
					const pcMove = response.data;
					const pcMoveButton = document.getElementById(pcMove);
					pcMoves += pcMove;
					pcMoveButton.innerText = "O";
					pcMoveButton.disabled = true;
					pcMoveButton.style.color = "blue";
					let pcMovesArray = pcMoves.split('').map(num => parseInt(num, 10));  // [4, 5, 2]
					let humanMovesArray = humanMoves.split('').map(num => parseInt(num, 10));  // [1, 3, 6]

					// Calculate total length (pcMovesArray.length + humanMovesArray.length)
					let totalLength = pcMovesArray.length + humanMovesArray.length;
					if (checkWinner(pcMovesArray)) 
					{
						displayMessage("PC WINS");
						document.querySelectorAll(".btn").forEach((e) => {
							e.disabled = true;
						});
						
					} 
					else if (totalLength === 9) 
					{
						displayMessage("DRAW");
						document.querySelectorAll(".btn").forEach((e) => {
							e.disabled = true;
						});
						
					}
	
				})
				.catch((error) => {
					console.error("Error calculating PC move:", error);
				});
		}
	});
});

function displayMessage(message) {
	const div = document.createElement("div");
	div.textContent = message;
	const container = document.getElementById("message-container");
	container.innerHTML = "";
	container.append(div);
}
