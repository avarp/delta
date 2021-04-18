const ESCAPE_SEQUENCE = 
  sequence(
    symbol('\\'),
    symbol('0abtnvfr\\"')
  )
  .then(ast => {
    return {
      '0': '\0',
      'a': '\a',
      'b': '\b',
      't': '\t',
      'n': '\n',
      'v': '\v',
      'f': '\f',
      'r': '\r',
      '\\': '\\',
      '"': '"'
    }[ast[1]]
  })




const UNICODE_CHAR = sequence(
  symbol('\\'),
  symbol('u'),
  repeat(
    or(
      symbol('0', '9'),
      symbol('a', 'f'),
      symbol('A', 'F')
    )
    .then(ast => ast.nested),
    4, 4
  )
  .then(ast => Number('0x'+ast.join('')))
)
.then(ast => String.fromCodePoint(ast[2]))




export const QUOTED_STRING_LITERAL = 
  sequence(
    symbol('"'),
    repeat(
      or(
        notSymbol('\\"'),
        ESCAPE_SEQUENCE,
        UNICODE_CHAR
      )
      .then(ast => ast.nested)
    )
    .then(ast => ast.join('')),
    symbol('"')
  )
  .then(ast => {
    return {
      type: 'QUOTED_STRING_LITERAL',
      value: ast[1]
    }
  })




export const HEREDOC_LITERAL = new Parser(function(input) {
  let [remainder, eol] = sequence(
    token('<<<'),
    repeat(
      notSymbol('\n'),
      1
    )
    .then(ast => ast.join('')),
    symbol('\n')
  )
  .then(ast => ast[1])
  .parse(input)

  if (eol === undefined) return [remainder, undefined]

  return until(
    sequence(
      symbol('\n'),
      token(eol)
    ),
    or(
      notSymbol('\\'),
      ESCAPE_SEQUENCE,
      UNICODE_CHAR
    )
    .then(ast => ast.nested)
  )
  .then(ast => {
    return {
      type: 'HEREDOC_LITERAL',
      value: ast.main.join('')
    }
  })
  .parse(remainder)
})