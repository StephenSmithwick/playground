import React, {useRef, useLayoutEffect, useState, useEffect} from 'react';
import {Box, Text, measureElement, useStdout} from 'ink';

const GRADIENT_COWBOY = [
	'#352682:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#382680:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▗▆▆▖▂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#3a267f:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▟▄▟⠀⠀⠀⠀⠀⠀▔▜██▛▘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#412679:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▃▆█████▖⠀⠀⠀⠀⠀⠀▗██▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#452779:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▖▁▗▟███████▌⠀⠀⠀⠀▗▟█████▙▖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#4B2675:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▗▄▂⠀▗▄▟█▆███████████▖⠀⠀▐████████▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#502773:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▂▄▆▆▆▆███████████████▛▀▜██▌⠀⠀▟█████████▖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#59276f:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▞▞⠀⠀▗█▌████████▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#602669:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▟██████████████████████▂▂▂▂▞⠀⠀⠀▐█▐██████▌▜▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#742764:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀███████████████████████⠀⠀⠀⠀⠀⠀⠀⠀▜▛▟██████▙▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#83275b:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▕██████████████████████▌⠀⠀⠀⠀⠀⠀⠀⠀▐██████████▙⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#972755:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐█████████████████████▛⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▘▜███▜███▜▐▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#a02652:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▁▂▟███▛███▔⠀⠀▔▔▀▀▜██▛▜██▘⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██▌▐██▛▐▟▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
	'#b92549:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜████████▘⠀⠀⠀⠀⠀⠀⠀▐██⠀▐█▌⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐██⠀▕██▌▐▀▌⠀⠀⠀⠀⠀⠀⠀⠀⠀▗⠀⠀⠀',
	'#ca2442:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▝▀▔▐█▛██▌⠀⠀⠀▖⠀⠀⠀⠀▗█▌⠀▟▛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▜█▌▕█▛▝▔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▐⠀⠀⠀',
	'#cb234a:⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀▝█▌▝██⠀▗▟▙▄▗▆▂▟█▅▆█▌▄▆█▟▗▆▖⠀▖⠀▃▖▗▖▗█▙▂█▙▙▙▖▖⠀▂▗⠀⠀▗▂▟█▟▆▙▖',
	'#cf2440:⠀⠀⠀▄▗▟██▟██▟▆██████▟█████▄███████████████▙███████████████▆██▆▗████████',
].map(l => l.split(':')) as [string, string][];

const COWBOY_WIDTH = 12;
const COWBOY_END = 56;

function sliceCowboy(start: number, end: number): [string, string][] {
	return GRADIENT_COWBOY.map(([bg, line]) => [bg, line.slice(start, end)]);
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
		<Box
			minWidth={COWBOY_WIDTH}
			flexGrow={1}
			ref={boxRef}
			flexDirection="column"
		>
			{picture.map(([bg, line], i) => (
				<Text key={i} color="black" backgroundColor={bg}>
					{line}
				</Text>
			))}
		</Box>
	);
}
