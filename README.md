The game's been written for private use, so no lobby/authentication etc.

Use `node -r esm src/server.js` to start the server, `npm start` to start the game (https://boardgame.io/documentation/#/multiplayer?id=remote-master).

Use `?id=X`, where `X` is from `0` to `<number of players> - 1`, URL param to choose the player number (e.g. http://localhost/?id=0).

The number of players can be configured in `src/index.js`, the number of words and turn duration in `src/game.js`.
