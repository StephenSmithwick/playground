import React, {useRef, useLayoutEffect, useState, useEffect} from 'react';
import {Box, Text, measureElement, useStdout} from 'ink';

const cowboy =
	`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▗▆▆▖▂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▟▄▟⠀⠀⠀⠀⠀⠀▔▜██▛▘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▃▆█████▖⠀⠀⠀⠀⠀⠀▗██▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▖▁▗▟███████▌⠀⠀⠀⠀▗▟█████▙▖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▂⠀▗▄▟█▆███████████▖⠀⠀▐████████▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▄▆▆▆▆███████████████▛▀▜██▌⠀⠀▟█████████▖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▞▞⠀⠀▗█▌████████▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▂▞⠀⠀⠀▐█▐██████▌▜▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀███████████████████████⠀⠀⠀⠀⠀⠀⠀⠀▜▛▟██████▙▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▕██████████████████████▌⠀⠀⠀⠀⠀⠀⠀⠀▐██████████▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐█████████████████████▛⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▘▜███▜███▜▐▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▂▟███▛███▔⠀⠀▔▔▀▀▜██▛▜██▘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██▌▐██▛▐▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜████████▘⠀⠀⠀⠀⠀⠀⠀▐██⠀▐█▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██⠀▕██▌▐▀▌⠀⠀⠀⠀⠀⠀⠀⠀⠀▗⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▀▔▐█▛██▌⠀⠀⠀▖⠀⠀⠀⠀▗█▌⠀▟▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜█▌▕█▛▝▔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▝█▌▝██⠀▗▟▙▄▗▆▂▟█▅▆█▌▄▆█▟▗▆▖⠀▖⠀▃▖▗▖▗█▙▂█▙▙▙▖▖⠀▂▗⠀⠀▗▂▟█▟▆▙▖
⠀⠀⠀▄▗▟██▟██▟▆██████▟█████▄███████████████▙███████████████▆██▆▗████████
▆▟██▟█████████████████████████████████████████████████████████████████
`.split('\n');

const COWBOY_WIDTH = 12;
const COWBOY_END = 56;

function sliceCowboy(start: number, end: number): string {
	return cowboy.map(line => line.slice(start, end)).join('\n');
}

export default function Cowboy() {
	const boxRef = useRef(null);
	const [width, setWidth] = useState(0);
	const {stdout} = useStdout();

	function onResize() {
		if (boxRef.current) {
			const {width: measuredWidth} = measureElement(boxRef.current);
			if (measuredWidth !== width) setWidth(measuredWidth);
		}
	}

	useLayoutEffect(onResize);
	useEffect(() => {
		stdout.on('resize', onResize);
		return () => stdout.off('resize', onResize);
	}, [stdout]);

	const picture =
		width > COWBOY_END
			? sliceCowboy(0, width)
			: sliceCowboy(COWBOY_END - width, COWBOY_END);

	return (
		<Box minWidth={COWBOY_WIDTH} flexGrow={1} ref={boxRef}>
			<Text color="blackBright" backgroundColor="blueBright">
				{picture}
			</Text>
		</Box>
	);
}
