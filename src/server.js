const Server = require("boardgame.io/server").Server;
const TheHat = require("./game").TheHat;
const server = Server({ games: [TheHat] });

server.run(3001);
