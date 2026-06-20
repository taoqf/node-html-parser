import { base_parse, type Options } from './nodes/html';

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 */
export default function valid(data: string, options = {} as Partial<Options>) {
	const stack = base_parse(data, options);
	return Boolean(stack.length === 1);
}
