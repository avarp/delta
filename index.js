import {readFileSync} from 'fs'
import {lexer} from './lexer/lexer.js'


console.dir(
  lexer.match(0,
    readFileSync('code.txt', {encoding: 'utf-8'})
  ),
  {
    depth: 5
  }
)