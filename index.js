import {HEREDOC_LITERAL} from './ast/string-literals.js'
import {readFileSync} from 'fs'


console.log(
  HEREDOC_LITERAL.parse(
    readFileSync('code.txt', {encoding: 'utf-8'})
  )
)