import { ActivePlayers, TurnOrder, INVALID_MOVE } from 'boardgame.io/core';

/** @type { import('boardgame.io').PhaseConfig } */
const PrepPhase = {
	turn: {
		activePlayers: ActivePlayers.ALL_ONCE,
	},

	endIf: (_G, ctx) => ctx.numMoves > 0 && ctx.activePlayers === null,

	moves: {
		addWords: {
			move(G, _ctx, words) { G.secret.words.push(...words); },
			client: false,
			undoable: false,
		},
	},
}

/** @type { import('boardgame.io').PhaseConfig } */
const ShufPhase = {
	onBegin(G, ctx) {
		G.playOrder = ctx.random.Shuffle(ctx.playOrder);
	},

	turn: {
		order: TurnOrder.RESET,
	},

	moves: {
		shuffle: {
			move(G, ctx) { G.playOrder = ctx.random.Shuffle(G.playOrder); },
			undoable: false,
		},
	},
}


function nextWord(G, ctx) {
	const words = G.secret.words;

	if (!words.length)
		return;

	const player = G.players[ctx.currentPlayer];

	player.idx = Math.floor(ctx.random.Number() * words.length);
	player.word = words[player.idx];
}

/** @type { import('boardgame.io').PhaseConfig } */
const PlayPhase = {
	turn: {
		order: TurnOrder.CUSTOM_FROM('playOrder'),

		activePlayers: {
			currentPlayer: 'Ready',
		},

		onBegin(G, _ctx) {
			G.timeLeft = G.turnDuration;
		},

		endIf: (_G, ctx) => ctx.numMoves > 0 && ctx.activePlayers === null,

		stages: {
			Ready: {
				moves: {
					go: {
						move(G, ctx) {
							nextWord(G, ctx);

							ctx.events.setStage('Go');
						},
						client: false,
						undoable: false,
					},
				},
			},

			Go: {
				moves: {
					tick: {
						move(G, ctx) {
							if (!G.timeLeft) return INVALID_MOVE;

							if (!--G.timeLeft)
								ctx.events.setStage({ stage: 'Go', moveLimit: 1 });
						},
						undoable: false,
					},

					explained: {
						move(G, ctx) {
							const words = G.secret.words;
							const idx = G.players[ctx.currentPlayer].idx;

							G.explained[ctx.currentPlayer].push(words[idx]);
							words.splice(idx, 1);

							nextWord(G, ctx);
						},
						client: false,
						undoable: false,
					},

					screwed: {
						move(G, ctx) {
							const words = G.secret.words;
							const idx = G.players[ctx.currentPlayer].idx;

							words.splice(idx, 1);
							ctx.events.endTurn();
						},
						client: false,
						undoable: false,
					},
				},
			},
		},
	},
}

/** @type { import('boardgame.io').GameConfig } */
export const TheHat = {
	name: "TheHat",

	setup: (ctx) => ({
		nWords: 7,
		turnDuration: 20,

		secret: { words: [] },
		players: ctx.playOrder.reduce((map, p) => (map[p] = {}, map), {}), // eslint-disable-line no-sequences

		explained: ctx.playOrder.reduce((map, p) => (map[p] = [], map), {}), // eslint-disable-line no-sequences
	}),

	// playerView: PlayerView.STRIP_SECRETS,

	phases: {
		PrepPhase: {
			...PrepPhase,
			start: true,
			next: 'ShufPhase',
		},
		ShufPhase: {
			...ShufPhase,
			next: 'PlayPhase',
		},
		PlayPhase: PlayPhase,
	},

	endIf: (G, ctx) => ctx.phase === "PlayPhase" && !G.secret.words.length,
}
