export function Parser(rule)
{
  this.rule = rule
  this.modifier = ast => ast
}

Parser.prototype.then = function(modifier)
{
  this.modifier = modifier
  return this
}

Parser.prototype.parse = function(input)
{
  let [remainder, ast] = this.rule(input)
  if (ast !== undefined) ast = this.modifier(ast)
  return [remainder, ast]
}




export function token(string)
{
  return new Parser(function(input) {
    return input.length >= string.length && input.substr(0, string.length) == string
      ? [input.substr(string.length), string]
      : [input, undefined]
  })
}




export const nothing = new Parser(function(input) {
  return [input, '']
})




export function symbol(...args)
{
  switch (args.length) {
    case 1:
    let list = args[0].split('')
    return new Parser(function(input) {
      return input != '' && list.indexOf(input.charAt(0)) != -1
        ? [input.substr(1), input.charAt(0)]
        : [input, undefined]
    })

    case 2:
    let from = args[0], to = args[1]
    return new Parser(function(input) {
      return input != '' && input.charCodeAt(0) >= from.charCodeAt(0) && input.charCodeAt(0) <= to.charCodeAt(0)
        ? [input.substr(1), input.charAt(0)]
        : [input, undefined]
    })
  }
}




export function notSymbol(...args)
{
  switch (args.length) {
    case 1:
    let list = args[0].split('')
    return new Parser(function(input) {
      return input != '' && list.indexOf(input.charAt(0)) == -1
        ? [input.substr(1), input.charAt(0)]
        : [input, undefined]
    })

    case 2:
    let from = args[0], to = args[1]
    return new Parser(function(input) {
      return input != '' && (input.charCodeAt(0) < from.charCodeAt(0) || input.charCodeAt(0) > to.charCodeAt(0))
        ? [input.substr(1), input.charAt(0)]
        : [input, undefined]
    })
  }
}




export function until(final, main)
{
  return new Parser(function(input) {
    var
      mainAst = [],
      finalAst,
      remainder = input,
      ast

    while (true) {
      let r = remainder
      ;[remainder, finalAst] = final.parse(remainder)

      if (finalAst === undefined) {
        remainder = r
        ;[remainder, ast] = main.parse(remainder)
        if (ast === undefined) return [remainder, undefined]
        mainAst.push(ast)
      } else {
        return [
          remainder,
          {
            main: mainAst,
            final: finalAst
          }
        ]
      }
    }
  })
}




export function or(...parsers)
{
  return new Parser(function(input) {
    if (parsers.length == 0) return [input, undefined]
    for (var i=0; i<parsers.length; i++) {
      var [remainder, ast] = parsers[i].parse(input)
      if (ast !== undefined) return [
        remainder,
        {
          variant: i,
          nested: ast
        }
      ]
    }
    return [input, undefined]
  })
}




export function sequence(...parsers)
{
  return new Parser(function(input) {
    var
      listOfAst = [],
      remainder = input,
      ast

    for (var i=0; i < parsers.length; i++) {
      [remainder, ast] = parsers[i].parse(remainder)
      if (ast === undefined) {
        return [remainder, undefined]
      }
      listOfAst.push(ast)
    }

    return [remainder, listOfAst]
  })
}




export function joined(glue, piece)
{
  return new Parser(function(input) {
    var
      piecesAst = [],
      glueAst = [],
      remainder = input,
      ast

    while (true) {
      [remainder, ast] = piece.parse(remainder)
      if (ast === undefined) return [remainder, undefined]
      piecesAst.push(ast)
      ;[remainder, ast] = glue.parse(remainder)
      if (ast === undefined) {
        break
      } else {
        glueAst.push(ast)
      }
    }

    return [
      remainder,
      {
        glue: glueAst,
        pieces: piecesAst
      }
    ]
  })
}




export function repeat(parser, from = 0, to)
{
  return new Parser(function(input) {
    var
      listOfAst = [],
      remainder = input,
      ast,
      i = 0

    while (to === undefined || i < to) {
      [remainder, ast] = parser.parse(remainder)
      if (ast == undefined) break
      listOfAst.push(ast)
      i++
    }

    if (i >= from && (to === undefined || i <= to)) {
      return [remainder, listOfAst]
    } else {
      return [remainder, undefined]
    }
  })
}




export const spaces =
  repeat(
    symbol("\r\n\t ")
  )