import * as fs from 'fs';
import * as path from 'path';
import {Message} from '../agents/index.js';

const TEST_IMAGES: string[] = ['fish.png', 'coffee.png', 'screenshot.jpeg'];

type TestImage = (typeof TEST_IMAGES)[number];

export async function image64(image: TestImage) {
	const imagePath = path.join(__dirname, image);
	return fs.readFileSync(imagePath, {encoding: 'base64'});
}

const imageRegex = /^{{(?<file>[^.]+)\.(?<ext>[^}]+)}}(?<textContent>.*)/;
export async function transformTestMessages(
	message: Message,
): Promise<Message> {
	if (typeof message?.content !== 'string') return message;
	const content = message.content as string;
	const match = imageRegex.exec(content);
	if (!match || !match.groups) return message;
	const {file, ext, textContent} = match.groups as {
		file: string;
		ext: string;
		textContent: string;
	};
	const image = `${file}.${ext}`;

	if (!TEST_IMAGES.includes(image))
		throw new Error('Please use an image from: ' + JSON.stringify(TEST_IMAGES));
	return {
		...message,
		content: [
			{
				type: 'image_url',
				image_url: {
					url: `data:image/${ext};base64,${await image64(image)}`,
					detail: 'auto',
				},
			},
			{
				type: 'text',
				text: textContent,
			},
		],
	};
}
