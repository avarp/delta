import {eof, notSymbol, or, sequence, str, symbol, until, repeat} from "../lexer/matchers.js"
import assert from "assert/strict"

// Matcher "eof"
assert.deepStrictEqual(
  eof.match(6, 'string'),
  [7, '']
)
assert.deepStrictEqual(
  eof.match(6, 'another string'),
  [6, undefined]
)


// Matcher "str"
assert.deepStrictEqual(
  str('Hello').match(0, 'Hello world!'),
  [5, 'Hello']
)
assert.deepStrictEqual(
  str('Hello').match(0, 'He is a bad guy'),
  [2, undefined]
)
assert.deepStrictEqual(
  str('Hello').match(0, 'Hel'),
  [3, undefined]
)
assert.deepStrictEqual(
  str('Hello').match(0, 'Waaat?'),
  [0, undefined]
)


// Matcher "symbol"
assert.deepStrictEqual(
  symbol('0-9', 'AEOUI').match(0, 'E'),
  [1, 'E']
)
assert.deepStrictEqual(
  symbol('0-9', 'AEOUI').match(0, '5'),
  [1, '5']
)
assert.deepStrictEqual(
  symbol('0-9', 'AEOUI').match(0, 'T'),
  [0, undefined]
)
assert.deepStrictEqual(
  symbol('').match(0, '?'),
  [0, undefined]
)
assert.deepStrictEqual(
  symbol().match(0, '?'),
  [0, undefined]
)


// Matcher "notSymbol"
assert.deepStrictEqual(
  notSymbol('0-9', 'AEOUI').match(0, 'Z'),
  [1, 'Z']
)
assert.deepStrictEqual(
  notSymbol('0-9', 'AEOUI').match(0, '9'),
  [0, undefined]
)
assert.deepStrictEqual(
  notSymbol('').match(0, '?'),
  [1, '?']
)
assert.deepStrictEqual(
  notSymbol().match(0, '?'),
  [1, '?']
)


// Matcher "until"
assert.deepStrictEqual(
  until(
    str('end'),
    symbol('0-9')
  ).match(0, '1234end'),
  [7, {
    mainMatches: ['1', '2', '3', '4'],
    finalMatch: 'end'
  }]
)
assert.deepStrictEqual(
  until(
    str('end'),
    symbol('0-9')
  ).match(0, '1234foo'),
  [4, undefined]
)


// Matcher "or"
assert.deepStrictEqual(
  or(
    str('if'),
    str('then')
  ).match(0, 'if'),
  [2, {match: 'if', matchedIndex: 0}]
)
assert.deepStrictEqual(
  or(
    str('if'),
    str('then')
  ).match(0, 'the end'),
  [3, undefined]
)
assert.deepStrictEqual(
  or(
    str('if'),
    str('then')
  ).match(0, 'Waaat?'),
  [0, undefined]
)


// Matcher "sequence"
assert.deepStrictEqual(
  sequence(
    str('foo'),
    str('bar')
  ).match(0, 'foobar'),
  [6, ['foo', 'bar']]
)
assert.deepStrictEqual(
  sequence(
    str('foo'),
    str('bar')
  ).match(0, 'foobaz'),
  [5, undefined]
)
assert.deepStrictEqual(
  sequence(
    str('foo'),
    str('bar')
  ).match(0, 'Waaat?'),
  [0, undefined]
)


// Matcher "repeat"
assert.deepStrictEqual(
  repeat(
    symbol('0-9')
  ).match(0, '1920x1080'),
  [4, ['1', '9', '2', '0']]
)
assert.deepStrictEqual(
  repeat(
    symbol('0-9'), 2, 4
  ).match(0, '1920x1080'),
  [4, ['1', '9', '2', '0']]
)
assert.deepStrictEqual(
  repeat(
    symbol('0-9'), 5
  ).match(0, '1920x1080'),
  [4, undefined]
)