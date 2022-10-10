import React from "react";
import { render } from "react-dom";
import { Client } from "boardgame.io/react";
import { SocketIO } from "boardgame.io/multiplayer";
import { TheHat } from "./game";
import { TheHatBoard } from "./board";


const TheHatClient = Client({
	game: TheHat,
	board: TheHatBoard,
	numPlayers: 4,
	debug: false,
	multiplayer: SocketIO({ server: `${window.location.hostname}:3001` }),
});

const id = new URLSearchParams(document.location.search).get("id");
render(<TheHatClient playerID={id} />, document.getElementById("root"));
