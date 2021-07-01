import {sequence, str, or, notSymbol, eof, symbol, repeat, until, nothing, any} from "./matchers.js"


export const
  KEYWORD_AS = Symbol('KEYWORD_AS'),
  KEYWORD_IF = Symbol('KEYWORD_IF'),
  KEYWORD_IN = Symbol('KEYWORD_IN'),
  KEYWORD_IS = Symbol('KEYWORD_IS'),
  KEYWORD_FOR = Symbol('KEYWORD_FOR'),
  KEYWORD_USE = Symbol('KEYWORD_USE'),
  KEYWORD_VAR = Symbol('KEYWORD_VAR'),
  KEYWORD_ELSE = Symbol('KEYWORD_ELSE'),
  KEYWORD_FROM = Symbol('KEYWORD_FROM'),
  KEYWORD_FUNC = Symbol('KEYWORD_FUNC'),
  KEYWORD_PROC = Symbol('KEYWORD_PROC'),
  KEYWORD_TYPE = Symbol('KEYWORD_TYPE'),
  KEYWORD_WITH = Symbol('KEYWORD_WITH'),
  KEYWORD_WHICH = Symbol('KEYWORD_WHICH'),
  KEYWORD_EXPORT = Symbol('KEYWORD_EXPORT'),
  KEYWORD_IMPORT = Symbol('KEYWORD_IMPORT'),
  KEYWORD_RETURN = Symbol('KEYWORD_RETURN'),
  KEYWORD_SWITCH = Symbol('KEYWORD_SWITCH'),
  KEYWORD_IGNORE = Symbol('KEYWORD_IGNORE'),
  COMMENT = Symbol('COMMENT'),
  OPERATOR = Symbol('OPERATOR'),
  IDENTIFIER = Symbol('IDENTIFIER'),
  OPEN_PAREN = Symbol('OPEN_PAREN'),
  CLOSE_PAREN = Symbol('CLOSE_PAREN'),
  OPEN_SQBR = Symbol('OPEN_SQBR'),
  CLOSE_SQBR = Symbol('CLOSE_SQBR'),
  OPEN_CURBR = Symbol('OPEN_CURBR'),
  CLOSE_CURBR = Symbol('CLOSE_CURBR'),
  COLON = Symbol('COLON'),
  COMMA = Symbol('COMMA'),
  STRING_LITERAL = Symbol('STRING_LITERAL'),
  INT_LITERAL = Symbol('INT_LITERAL'),
  FLOAT_LITERAL = Symbol('FLOAT_LITERAL'),
  SPACE = Symbol('SPACE')


const keyword =
sequence(
  or(
    str('as'),
    str('if'),
    str('in'),
    str('is'),
    str('for'),
    str('use'),
    str('var'),
    str('else'),
    str('from'),
    str('func'),
    str('proc'),
    str('type'),
    str('with'),
    str('which'),
    str('export'),
    str('import'),
    str('return'),
    str('_')
  ),
  or(
    notSymbol('a-z', 'A-Z', '_'),
    eof
  )
)
.then((cursor, match, prevCursor) => [
  cursor - 1,
  {
    type: {
      as: KEYWORD_AS,
      if: KEYWORD_IF,
      in: KEYWORD_IN,
      is: KEYWORD_IS,
      for: KEYWORD_FOR,
      use: KEYWORD_USE,
      var: KEYWORD_VAR,
      else: KEYWORD_ELSE,
      from: KEYWORD_FROM,
      func: KEYWORD_FUNC,
      proc: KEYWORD_PROC,
      type: KEYWORD_TYPE,
      with: KEYWORD_WITH,
      which: KEYWORD_WHICH,
      export: KEYWORD_EXPORT,
      import: KEYWORD_IMPORT,
      return: KEYWORD_RETURN,
      _: KEYWORD_IGNORE
    }[match[0].match],
    location: {
      begin: prevCursor,
      end: cursor - 1
    }
  }
])




const comment = 
or(
  sequence(
    str('/*'),
    until(
      str('*/'),
      any
    )
  ),
  sequence(
    str('//'),
    until(
      symbol('\n'),
      any
    )
  )
)
.then((cursor, _, prevCursor) => [
  cursor, 
  {
    type: COMMENT,
    location: {
      begin: prevCursor,
      end: cursor
    }
  }
])




const operator =
repeat(
  symbol('-+*/^=<>|~!&@$#?.'),
  1, 3
)
.then((cursor, match, prevCursor) => [
  cursor,
  {
    type: OPERATOR,
    location: {
      begin: prevCursor,
      end: cursor
    },
    operator: match.join('')
  }
])




const identifier =
sequence(
  symbol('a-z', 'A-Z', '_'),
  repeat(
    symbol('a-z', 'A-Z', '0-9', '_')
  )
)
.then((cursor, match, prevCursor) => [
  cursor,
  {
    type: IDENTIFIER,
    location: {
      begin: prevCursor,
      end: cursor
    },
    name: match[0] + match[1].join('')
  }
])




const specialSymbol = 
symbol('(){}[]:,')
.then((cursor, match) => [
  cursor,
  {
    type: {
      '(': OPEN_PAREN,
      ')': CLOSE_PAREN,
      '[': OPEN_SQBR,
      ']': CLOSE_SQBR,
      '{': OPEN_CURBR,
      '}': CLOSE_CURBR,
      ':': COLON,
      ',': COMMA
    }[match],
    location: {
      begin: cursor - 1,
      end: cursor
    }
  }
])




const escapeSequence = 
sequence(
  symbol('\\'),
  symbol('0abtnvfr\\"')
)
.then((cursor, match) => [
  cursor,
  {
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
  }[match[1]]
])




const unicodeChar = sequence(
  str('\\u'),
  repeat(
    symbol('0-9', 'A-Z', 'a-z'),
    4, 4
  )
  .then((cursor, match) => [cursor, Number('0x'+match.join(''))])
)
.then((cursor, match) => [cursor, String.fromCodePoint(match[1])])




const quotedString = 
sequence(
  symbol('"'),
  repeat(
    or(
      notSymbol('\\"'),
      escapeSequence,
      unicodeChar
    )
    .then((cursor, match) => [cursor, match.match])
  ),
  symbol('"')
)
.then((cursor, match, prevCursor) => [
  cursor,
  {
    type: STRING_LITERAL,
    location: {
      begin: prevCursor,
      end: cursor
    },
    value: match[1].join('')
  }
])




const heredocLiteral =
sequence(
  str('<<<'),
  repeat(
    notSymbol('\n'),
    1
  ),
  symbol('\n')
)
.then((cursor, match, prevCursor, input) => {
  const EOL = match[1].join('')
  return until(
    sequence(
      symbol('\n'),
      str(EOL)
    ),
    or(
      notSymbol('\\'),
      escapeSequence,
      unicodeChar
    )
    .then((cursor, match) => [cursor, match.match])
  )
  .then((cursor, match) => [
    cursor,
    {
      type: STRING_LITERAL,
      location: {
        begin: prevCursor,
        end: cursor
      },
      value: match.mainMatches.join('')
    }
  ])
  .match(cursor, input)
})




const intDecLiteral = 
or(
  symbol('0'),
  sequence(
    symbol('1', '9'),
    repeat(
      symbol('0', '9')
    )
    .then((cursor, match) => [cursor, match.join('')])
  )
  .then((cursor, match) => [cursor, match.join('')])
)
.then((cursor, match, prevCursor) => [
  cursor, 
  {
    type: INT_LITERAL,
    location: {
      begin: prevCursor,
      end: cursor
    },
    value: Number(match.match)
  }
])




const intHexLiteral = 
sequence(
  str('0x'),
  repeat(
    symbol('0-9', 'a-f', 'A-F'), 1
  )
  .then((cursor, match) => [cursor, match.join('')])
)
.then((cursor, match, prevCursor) => [
  cursor,
  {
    type: INT_LITERAL,
    location: {
      begin: prevCursor,
      end: cursor
    },
    value: Number(match.join(''))
  }
])




const floatLiteral = 
sequence(
  repeat(
    symbol('0-9')
  )
  .then((cursor, match) => [cursor, match.join('')]),
  symbol('.'),
  repeat(
    symbol('0-9'), 1
  )
  .then((cursor, match) => [cursor, match.join('')]),
  or(
    sequence(
      symbol('e'),
      or(
        symbol('+-'),
        nothing
      )
      .then((cursor, match) => [cursor, match.match]),
      repeat(
        symbol('0-9'), 1
      )
      .then((cursor, match) => [cursor, match.join('')])
    )
    .then((cursor, match) => [cursor, match.join('')]),
    nothing
  )
  .then((cursor, match) => [cursor, match.match])
)
.then((cursor, match, prevCursor) => [
  cursor, 
  {
    type: FLOAT_LITERAL,
    location: {
      begin: prevCursor,
      end: cursor
    },
    value: Number(match.join(''))
  }
])




const spaces =
repeat(
  symbol(' \r\n\t'), 1
)
.then((cursor, _, prevCursor) => [
  cursor,
  {
    type: SPACE,
    location: {
      begin: prevCursor,
      end: cursor
    }
  }
])




export const lexer = repeat(
  or(
    spaces,
    keyword,
    comment,
    heredocLiteral,
    identifier,
    operator,
    specialSymbol,
    quotedString,
    floatLiteral,
    intHexLiteral,
    intDecLiteral
  )
  .then((cursor, match) => [cursor, match.match])
)