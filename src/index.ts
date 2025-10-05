import { is_valid_html, JsCommentNode, JsElement, JsNode, JsNodeType, JsParseOptions, JsTextNode, parse_html_with_options } from '../pkg';

// import CommentNode from './nodes/comment';
// import Node from './nodes/node';
// import TextNode from './nodes/text';
// import NodeType from './nodes/type';
// import valid from './valid';

export { JsParseOptions as Options, JsElement as HTMLElement, is_valid_html as valid, JsNode as Node, JsNodeType as NodeType, JsCommentNode as CommentNode, JsTextNode as TextNode, parse_html as parse, parse_html_with_options, version } from '../pkg';
// export {
// 	CommentNode,
// 	valid,
// 	Node,
// 	TextNode,
// 	NodeType
// };

export default function parse(data: string, options = {} as Partial<JsParseOptions>) {
	const opts = new JsParseOptions();
	if (options.lower_case_tag_name !== undefined) {
		opts.lower_case_tag_name = options.lower_case_tag_name;
	}
	if (options.comment !== undefined) {
		opts.comment = options.comment;
	}
	if (options.fix_nested_a_tags !== undefined) {
		opts.fix_nested_a_tags = options.fix_nested_a_tags;
	}
	if (options.parse_none_closed_tags !== undefined) {
		opts.parse_none_closed_tags = options.parse_none_closed_tags;
	}
	return parse_html_with_options(data, opts);
}

parse.parse = parse;
parse.HTMLElement = JsElement;
parse.CommentNode = JsCommentNode;
parse.valid = is_valid_html;
parse.Node = JsNode;
parse.TextNode = JsTextNode;
parse.NodeType = JsNodeType;
