import { io, Socket } from "socket.io-client";

const socket = io("http://192.168.0.107:3000");


document.getElementById("loading").style.display = "none";
updateFormVisibility(false);

document.getElementById("find").addEventListener("click", function () {
	document.querySelectorAll(".btn").forEach((e) => {
		e.innerText = "";
	});
	document.getElementById("pcmode").style.display = "none";
	document.getElementById("form").style.display = "none";
	document.getElementById("loading").style.display = "block";
	document.getElementById("find").disabled = true;
	document.getElementById("find").style.display = "none";
	socket.emit("find");
});

document.getElementById("pcmode").addEventListener("click", function () {
    // Redirect to the PC mode page
	console.log("hello button");
    window.location.href = "/pcindex.html";
});

document.querySelectorAll(".btn").forEach((e) => {
	e.disabled = true;
});

socket.on("connect", () => {
	//displayMessage(`You connected with id: ${socket.id}`);
});

socket.on("vis", (val) => {
	updateFormVisibility(val);
});

socket.on("waiting", (msg) => {
	displayMessage(msg);
});
socket.on("game-start", (msg) => {
	displayTemporaryMessage(msg); // Game is starting
});

socket.on("room-assigned", (roomid) => {
	document.getElementById("loading").style.display = "none";
	document.getElementById("find").style.display = "none";

	if (roomid === socket.id) {
		document.querySelectorAll(".btn").forEach((e) => {
			e.disabled = false;
		});
		displayMessage("your turn : (X)");
	} else {
		displayMessage("opponent's turn : (X)");
	}
});

socket.on("update-turn", (id, len, fmoves, smoves) => {
	document.querySelectorAll(".btn").forEach((e) => {
		e.disabled = false;
	});

	fmoves.forEach((move) => {
		const button = document.getElementById(move);
		if (button) {
			button.innerText = "X";
			button.disabled = true;
			button.style.color = "red";
		}
	});

	smoves.forEach((move) => {
		const button = document.getElementById(move);
		if (button) {
			button.innerText = "O";
			button.disabled = true;
			button.style.color = "blue";
		}
	});

	if (len % 2 === 1) {
		if (id === socket.id) {
			document.querySelectorAll(".btn").forEach((e) => {
				e.disabled = true;
			});
			displayMessage("opponent's turn : (O)");
		} else {
			displayMessage("your turn : (O)");
		}
	} else if (len % 2 === 0) {
		if (id !== socket.id) {
			document.querySelectorAll(".btn").forEach((e) => {
				e.disabled = true;
			});
			displayMessage("opponent's turn : (X)");
		} else {
			displayMessage("your turn : (X)");
		}
	}
});

socket.on("game-over", (msg) => {
	if (msg === "It's a draw!") {
		displayMessage(msg);
	} else if (msg === socket.id) {
		displayMessage("You win!!!");
	} else {
		displayMessage("Opponent wins!!!");
	}
	document.querySelectorAll(".btn").forEach((e) => {
		e.disabled = true;
	});

	document.getElementById("find").disabled = false;
	document.getElementById("find").style.display = "block";
});

socket.on("player-left", (msg) => {
	displayMessage(msg);
	document.querySelectorAll(".btn").forEach((e) => {
		e.disabled = true;
	});
	document.getElementById("find").disabled = false;
	document.getElementById("find").style.display = "block";
});

socket.on("disconnect", () => {
	displayMessage("You have been disconnected from the server.");
	document.querySelectorAll(".btn").forEach((e) => {
		e.disabled = true;
	});
	document.getElementById("find").style.display = "none";
    updateFormVisibility(false)
	createGoToHomeButton();
});
function displayMessage(message) {
	const div = document.createElement("div");
	div.textContent = message;
	const container = document.getElementById("message-container");
	container.innerHTML = "";
	container.append(div);
}

function displayTemporaryMessage(message) {
	const div = document.createElement("div");
	div.textContent = message;

	const container = document.getElementById("temp-message-container");
	container.innerHTML = ""; // Clear previous messages
	container.append(div);

	// Remove the message after 3 seconds
	setTimeout(() => {
		container.innerHTML = "";
	}, 3000); // 3000 milliseconds = 3 seconds
}

document.querySelectorAll(".btn").forEach((e) => {
	e.addEventListener("click", function () {
		socket.emit("send-pos", socket.id, e.id);
	});
});

function updateFormVisibility(val) {
	if (val) {
		document.getElementById("form").style.display = "grid";
	} else {
		document.getElementById("form").style.display = "none";
	}
}
function createGoToHomeButton() {
	// Create the button
	const homeButton = document.createElement("button");
	homeButton.textContent = "Go to Home";
	homeButton.style.marginTop = "20px"; // Optional spacing
	homeButton.style.padding = "10px 20px";
	homeButton.style.borderRadius = "8px";
	homeButton.style.backgroundColor = "#4a90e2";
	homeButton.style.color = "white";
	homeButton.style.fontSize = "1rem";
	homeButton.style.cursor = "pointer";

	// Create a wrapper to center the button
	const wrapper = document.createElement("div");
	wrapper.style.display = "flex";
	wrapper.style.justifyContent = "center";
	wrapper.style.alignItems = "center";
	wrapper.style.height = "100%";
	wrapper.style.marginTop = "20px";

	// Append the button to the wrapper
	wrapper.append(homeButton);

	// Append the wrapper to the message container
	const container = document.getElementById("message-container");

	container.append(wrapper);
	homeButton.addEventListener("click", () => {
		location.reload();
	});
}
