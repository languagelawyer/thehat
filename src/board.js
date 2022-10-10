import React from 'react';
import './board.css';


function PlayerStats(props) {
	const explained = props.G.explained[props.playerID];
	return <div className="playerstats">
		<div key="-1">Explained by {props.playerID}</div>
		{explained.map((val, idx) => <div key={idx}>{val}</div>)}
	</div>;
};
function PlayerStatsBlock(props) {
	return <div className="playerstatsblock">
		{props.ctx.playOrder.map(id => <PlayerStats {...props} playerID={id} key={id} />)}
	</div>;
};


function useStickyState(defaultValue, key) {
	const [value, setValue] = React.useState(() => {
		const stickyValue = window.localStorage.getItem(key);
		return stickyValue !== null
			? JSON.parse(stickyValue)
			: defaultValue;
	});

	React.useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}

function PrepBoard(props) {
	const [words, setWords] = useStickyState([], "words");

	if (!props.isActive)
		return "You've successfully added the words. Please wait for others to do it.";

	const handleSubmit = e => {
		e.preventDefault();

		const words = [].slice.call(e.target, 0, props.G.nWords).map(fld => fld.value);

		props.moves.addWords(words);
	}

	const handleEnter = event => {
		if (event.keyCode === 13) {
			const form = event.target.form;
			const index = [].indexOf.call(form, event.target);
			form.elements[index + 1].focus();
			event.preventDefault();
		}
	}

	const onInput = i => event => setWords(Object.assign([], words, { [i]: event.target.value }));

	const fields = Array(props.G.nWords).fill(null).map((_v, i) =>
		<React.Fragment key={i}>
			<input key={i} type="text" defaultValue={words[i]} onInput={onInput(i)} onKeyDown={handleEnter} /><br />
		</React.Fragment>
	);

	return <form onSubmit={handleSubmit}>
		{fields}

		<button>Add words!</button>
	</form>;
}


function ShufBoard(props) {
	const numPlayers2 = props.ctx.numPlayers / 2;

	const table = Array(numPlayers2).fill(null).map((_val, i) =><tr key={i}>
		<td key="0">Team {i + 1}</td>
		<td key="1">{props.G.playOrder[i]}</td>
		<td key="2">{props.G.playOrder[i + numPlayers2]}</td>
	</tr>);

	return <>
		<table border="1">
			<tbody>
				{table}
			</tbody>
		</table>
		{props.isActive && <>
			<button key="0" onClick={() => props.moves.shuffle()}>Shuffle</button>
			<button key="1" onClick={() => props.events.endPhase()}>Start!</button>
		</>}
	</>;
};


function PlayBoard(props) {
	const G = props.G;
	const ctx = props.ctx;
	const stage = ctx.activePlayers?.[ctx.currentPlayer];
	const audio = React.useRef(null);

	React.useEffect(() => {
		if (!G.timeLeft) return;

		props.isActive && stage === "Go" && setTimeout(() => {
			props.moves.tick();
		}, 1000);
	}, [props.isActive, props.moves, stage, G.timeLeft]);

	React.useEffect(() => {
		if (G.timeLeft) return;

		setTimeout(() => audio.current.play(), 500);
	}, [G.timeLeft]);

	const onExplained = e => {
		const tgt = e.target;
		tgt.disabled = true;

		setTimeout(() => { tgt.disabled = false; tgt.focus(); }, 500);

		props.moves.explained();
	}

	const word = stage !== "Go"
		? 'Press "Go!" to start'
		: <>Explain the word <b> {G.players[props.ctx.currentPlayer]?.word} </b>
				to {ctx.playOrder[(ctx.playOrderPos + ctx.numPlayers / 2) % ctx.numPlayers]}
		</>;

	const buttons = stage !== "Go"
		? <button onClick={() => props.moves.go()} autoFocus>Go!</button>
		: <>
			<button onClick={onExplained} autoFocus>Explained</button>
			<button onClick={() => props.moves.screwed()}>Screwed up</button>
			<button onClick={() => props.events.endTurn()}>Pass</button>
		</>;

	const playerView = <>
		<div>{word}</div>
		<div>{buttons}</div>
	</>;

	return <div>
		<audio ref={audio} src="/alarm.mp3" />
		<div>Time left: {G.timeLeft} sec.</div>
		{props.isActive && playerView}
		<PlayerStatsBlock {...props} />
	</div>;
}

export const TheHatBoard = props => {
	if (props.ctx.phase === "PrepPhase") return <PrepBoard {...props} />;
	if (props.ctx.phase === "ShufPhase") return <ShufBoard {...props} />;
	if (props.ctx.phase === "PlayPhase") return <PlayBoard {...props} />;

	return <div>The end! <PlayerStatsBlock {...props} /> </div>;
};
