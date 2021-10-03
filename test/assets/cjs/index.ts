import { parse } from 'node-html-parser'

const res = parse('<a href="#">parse succeeded</a>');
console.log(res.firstChild.text);