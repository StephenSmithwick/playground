// Augment the ReadableStream interface to be an AsyncIterable.
// This is often needed in environments like Node.js where the
// default TypeScript lib doesn't include this protocol.
interface ReadableStream<R = any> {
	[Symbol.asyncIterator](): AsyncIterableIterator<R>;
}
