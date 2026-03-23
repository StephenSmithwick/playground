import React, {useState, useEffect} from 'react';
import {Text} from 'ink';

const waves = '-⎽__⎽-⎻⎺⎺⎻-⎽__⎽-';
const window = 7;
const max = waves.length - window;

export function Loader() {
	const [start, setStart] = useState(Math.floor(waves.length * Math.random()));

	useEffect(() => {
		const timer = setInterval(() => {
			setStart(prev => (prev - 1 + max) % max);
		}, 200);

		return () => clearInterval(timer);
	}, []);

	return <Text>{waves.slice(start, start + window)}</Text>;
}
