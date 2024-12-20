// const { instrument } = require("@socket.io/admin-ui");

// const io = require("socket.io")(3000, {
// 	cors: {
// 		origin: [
// 			"http://localhost:8080",
// 			"http://192.168.0.107:8080",
// 			"https://admin.socket.io",
// 		],
// 		credentials: true,
// 	},
// });

/////////////////////////////////
// by express

const express = require("express");
const http = require("http");
const { instrument } = require("@socket.io/admin-ui");
const cors = require("cors");
// Create an Express app
const app = express();

// Create an HTTP server and pass the Express app to it
const server = http.createServer(app);

app.use(
	cors({
	  origin: [
		"http://localhost:8080",
		"https://admin.socket.io",
		"http://localhost:8080/scriptpc",
		"http://localhost:8080/pcindex.html",
		"https://mdtoufique.github.io/tic-tac-toe-multiplayer",
		"https://mdtoufique.github.io/tic-tac-toe-multiplayer/scriptpc.js",
		"https://mdtoufique.github.io/tic-tac-toe-multiplayer/pcindex.html",
		"https://mdtoufique.github.io",
	  ],
	  credentials: true,
	})
  );


// Set up Socket.io with the HTTP server
const io = require("socket.io")(server, {
	cors: {
		origin: [
			"http://localhost:8080",
			"http://192.168.0.107:8080",
			"https://admin.socket.io",
			"http://localhost:8080/scriptpc",
			"http://localhost:8080/pcindex.html",
			"https://mdtoufique.github.io/tic-tac-toe-multiplayer",
			"https://mdtoufique.github.io/tic-tac-toe-multiplayer/scriptpc",
			"https://mdtoufique.github.io/tic-tac-toe-multiplayer/pcindex.html",
			"https://mdtoufique.github.io",
		],
		credentials: true,
	},
});

let hello="jwl";
let playerQueue = [];
let rooms = {};
let moves = {};

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

io.on("connection", (socket) => {
	console.log(`Client connected: ${socket.id}`);
	let roomId;

	function deleteRoom(roomId) {
		if (rooms[roomId]) {
			if (rooms[roomId].length === 2) {
				const s1 = io.sockets.sockets.get(rooms[roomId][0]);
				const s2 = io.sockets.sockets.get(rooms[roomId][1]);
				if (s1) {
					s1.leave(roomId);
				}
				if (s2) {
					s2.leave(roomId);
				}
			}
			delete rooms[roomId];
			delete moves[roomId];
		}
	}

	socket.on("find", (e) => {
		playerQueue.push(socket.id);

		//console.log(socket.id)

		if (playerQueue.length % 2 === 1) {
			roomId = socket.id;
		} else {
			roomId = playerQueue[playerQueue.length - 2];
		}
		//console.log(playerQueue.length,io.engine.clientsCount)

		socket.join(roomId);

		rooms[roomId] = rooms[roomId] || [];

		rooms[roomId].push(socket.id);

		//console.log(`Player ${socket.id} joined room ${roomId}`);

		if (rooms[roomId].length === 2) {
			io.to(roomId).emit("game-start", "Game is starting!");

			io.to(roomId).emit("vis", true);

			if (!moves[roomId]) {
				moves[roomId] = {};
			}

			if (!moves[roomId][roomId]) {
				moves[roomId][roomId] = [];
			}
			if (!moves[roomId][socket.id]) {
				moves[roomId][socket.id] = [];
			}

			io.to(roomId).emit("room-assigned", roomId);

			playerQueue = playerQueue.filter(
				(id) => id !== rooms[roomId][0] && id !== rooms[roomId][1]
			);
		} else {
			io.to(roomId).emit("waiting", "Waiting for another player...");
		}
	});

	socket.on("send-pos", (id, pos) => {
		//console.log(pos)
		moves[roomId][id].push(parseInt(pos, 10));

		let totalLength = 0;
		const firstPlayerMoves = moves[roomId][roomId];

		var scnd = "";
		for (const key in moves[roomId]) {
			if (Array.isArray(moves[roomId][key])) {
				totalLength += moves[roomId][key].length;
			}
			if (key !== roomId) {
				scnd = key;
			}
		}

		const secondPlayerMoves = moves[roomId][scnd];

		io.to(roomId).emit(
			"update-turn",
			roomId,
			totalLength,
			firstPlayerMoves,
			secondPlayerMoves
		);
		// console.log(firstPlayerMoves);
		// console.log(secondPlayerMoves);
		// console.log(totalLength);

		if (checkWinner(firstPlayerMoves)) {
			io.to(roomId).emit("game-over", roomId);
			deleteRoom(roomId);
			roomId = undefined;
		} else if (checkWinner(secondPlayerMoves)) {
			io.to(roomId).emit("game-over", scnd);
			deleteRoom(roomId);
			roomId = undefined;
		} else if (totalLength === 9) {
			io.to(roomId).emit("game-over", "It's a draw!");
			deleteRoom(roomId);
			roomId = undefined;
		}
	});

	socket.on("disconnect", () => {
		if (roomId === undefined) {
			playerQueue = playerQueue.filter((id) => id !== socket.id);
			return;
		}
		// console.log(`Player ${socket.id} left room ${roomId}`);

		playerQueue = playerQueue.filter((id) => id !== socket.id);

		thyself = io.sockets.sockets.get(socket.id);

		if (thyself) {
			thyself.leave(roomId);
		}

		io.to(roomId).emit(
			"player-left",
			`You won by forfeit.\nPlayer ${socket.id} has left the room`
		);

		//io.to(roomId).emit("vis", false);

		if (rooms[roomId]) {
			if (rooms[roomId].length === 2) {
				const s1 = io.sockets.sockets.get(rooms[roomId][0]);
				const s2 = io.sockets.sockets.get(rooms[roomId][1]);
				if (s1) {
					s1.leave(roomId);
				}
				if (s2) {
					s2.leave(roomId);
				}
			}
			delete rooms[roomId];
			delete moves[roomId];
		}
		roomId = undefined;
	});
});

// Admin UI instrumenting
instrument(io, { auth: false });

app.get("/", (req, res) => {
	res.send("YO YO");
});

////////////////
///////////////////////////
////////////////////////

const fs = require("fs");
const path = require("path");

// Function to generate a random number between 0 and n-1
function random_num(n) {
	return Math.floor(Math.random() * n);
}
//fille read write

function getNextMove(key) {
    try {
        
        const filePath = path.join(__dirname, 'data', 'data.json');
        
        const data = fs.readFileSync(filePath, 'utf-8');
        
        const jsonObject = JSON.parse(data);
        
       
        if (jsonObject.hasOwnProperty(key)) 
		{
           
            
			let value = jsonObject[key].split(' ').map(num => parseInt(num, 10));
			return value;
        } 
		else 
		{
            
            let availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            
            
            const keyNumbers = key.split('+').join('').split('');
            availableNumbers = availableNumbers.filter(num => !keyNumbers.includes(num.toString()));
            
        
            return availableNumbers;
        }
    } 
	catch (error) {
        console.error('Error reading or parsing the JSON file:', error);
        let availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            
            
            const keyNumbers = key.split('+').join('').split('');
            availableNumbers = availableNumbers.filter(num => !keyNumbers.includes(num.toString()));
            
        
            return availableNumbers;
    }
}

app.get("/pcserver", (req, res) => {
	try {
		
		const moves = req.query.moves;  // Get the moves from the query parameters
    	//console.log("Received moves: ", moves);
		let predpcMoves=getNextMove(moves);
		nextMove= predpcMoves[random_num(predpcMoves.length)];
		console.log("pcserver running");
		let availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		const keyNumbers = moves.split('+').join('').split('');
		availableNumbers = availableNumbers.filter(num => !keyNumbers.includes(num.toString()));
            
		if (!availableNumbers.includes(nextMove)) {
			console.log("something is wrong");
			nextMove = availableNumbers[random_num(availableNumbers.length)];
		}
		

		res.send(nextMove.toString());
	} catch (error) {
		console.error("Error in generating PC move:", error);
		res.status(500).send("Internal Server Error");
	}
});

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// server.listen(3000, () => {
// 	console.log("Server is running on port 3000");
// });
