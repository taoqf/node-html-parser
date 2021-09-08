import { base_parse, Options } from './nodes/html.js';

/**
 * Parses HTML and returns a root element
 * Parse a chuck of HTML source.
 */
export default function valid(data: string, options = { lowerCaseTagName: false, comment: false } as Partial<Options>) {
	const stack = base_parse(data, options);
	return Boolean(stack.length === 1);
}
