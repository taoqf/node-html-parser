export { default as CommentNode } from './nodes/comment';
export { default as HTMLElement, Options } from './nodes/html';
export { default as parse } from './parse';
export { default as valid } from './valid';
export { default as Node } from './nodes/node';
export { default as TextNode } from './nodes/text';
export { default as NodeType } from './nodes/type';

Object.assign(parse, {
  CommentNode,
  HTMLElement,
  Options,
  parse,
  valid,
  Node,
  TextNode,
  NodeType,
});
