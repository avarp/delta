export const IDENTIFIER = 
  sequence(
    or(
      symbol('a', 'z'),
      symbol('A', 'Z'),
      symbol('_$')
    )
    .then(ast => ast.nested),
    repeat(
      or(
        symbol('a', 'z'),
        symbol('A', 'Z'),
        symbol('0', '9'),
        symbol('_$')
      )
      .then(ast => ast.nested)
    )
    .then(ast => ast.join(''))
  )
  .then(ast => {
    ast = ast.join('')
    if (ast == '_') {
      return undefined
    } else {
      return {
        type: "IDENTIFIER",
        id: ast
      }
    }
  })