import { parse } from '@test/root'

const res = parse('<a href="#">parse succeeded</a>');
console.log(res.firstChild.text);