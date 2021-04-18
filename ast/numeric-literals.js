export const INT_DEC_LITERAL = 
  or(
    symbol('0'),
    sequence(
      symbol('1', '9'),
      repeat(
        symbol('0', '9')
      )
      .then(ast => ast.join(''))
    )
    .then(ast => ast.join(''))
  )
  .then(ast => {
    return {
      type: 'INT_DEC_LITERAL',
      value: Number(ast.nested)
    }
  })




export const INT_HEX_LITERAL = 
  sequence(
    token('0x'),
    repeat(
      or(
        symbol('0', '9'),
        symbol('a', 'f'),
        symbol('A', 'F')
      )
      .then(ast => ast.nested),
      1
    )
    .then(ast => ast.join(''))
  )
  .then(ast => {
    return {
      type: 'INT_HEX_LITERAL',
      value: Number(ast.join(''))
    }
  })