import Matcher from './matcher.js'


/**
 * Matcher which matches only end of input
 * @return {string} empty string
 */
export const eof = new Matcher(function(cursor, input) {
  return cursor == input.length ? [cursor + 1, ''] : [cursor, undefined]
});


/**
 * Matcher which matches empty string
 * @return {string} empty string
 */
export const nothing = new Matcher(function(cursor, _) {
  return [cursor, '']
})


/**
 * Matcher which matches 1 symbol (any symbol)
 * @return {string} the symbol
 */
export const any = new Matcher(function(cursor, input) {
  return [cursor + 1, input.charAt(cursor)]
})


/**
 * Matcher which matches a string (sequence of symbols)
 * @param {string} string a string value to match
 * @return {string} the string itself
 */
export function str(string)
{
  return new Matcher(function(cursor, input) {  
    if (input.length >= cursor + string.length && input.substr(cursor, string.length) == string) {
      return [cursor + string.length, string]
    } else {
      let i
      for (i=0; i<string.length; i++) {
        if (string.charAt(i) != input.charAt(cursor + i)) break
      }
      return [cursor + i, undefined]
    }
  })
}


/**
 * Matcher which matches one symbol
 * @param {string} arg can be either a range of symbols separated by dash like: "A-Z", or set of symbols like "qwerty". Any amount of params accepted.
 * @return {string} matched symbol
 */
export function symbol(...args)
{
  return new Matcher(function(cursor, input) {
    if (cursor >= input.length) return [cursor, undefined]
    if (args.some(arg => {
      if (arg.length == 3 && arg.charAt(1) == '-') {
        return input.charCodeAt(cursor) >= arg.charCodeAt(0) && input.charCodeAt(cursor) <= arg.charCodeAt(2)
      } else {
        return arg.split('').indexOf(input.charAt(cursor)) != -1
      }
    })) {
      return [cursor + 1, input.charAt(cursor)]
    } else {
      return [cursor, undefined]
    }
  })
}


/**
 * Matcher which matches one symbol which DOESN'T match the cnditions
 * @param {string} arg can be either a range of symbols separated by dash like: "A-Z", or set of symbols like "qwerty". Any amount of params accepted.
 * @return {string} matched symbol
 */
export function notSymbol(...args)
{
  return new Matcher(function(cursor, input) {
    if (cursor >= input.length) return [cursor, undefined]
    if (args.some(arg => {
      if (arg.length == 3 && arg.charAt(1) == '-') {
        return input.charCodeAt(cursor) >= arg.charCodeAt(0) && input.charCodeAt(cursor) <= arg.charCodeAt(2)
      } else {
        return arg.split('').indexOf(input.charAt(cursor)) != -1
      }
    })) {
      return [cursor, undefined]
    } else {
      return [cursor + 1, input.charAt(cursor)]
    }
  })
}


/**
 * Match main Matcher as many times as possible until final Matcher will be found.
 * @param {Matcher} final 
 * @param {Matcher} main 
 * @returns {object} {
 *   mainMatches: array of results of main Matcher
 *   finalMatch: final Matcher result
 * }
 */
export function until(final, main)
{
  return new Matcher(function(cursor, input) {
    var
      mainMatches = [],
      finalMatch,
      mainMatch

    while (true) {
      let prevCursor = cursor
      ;[cursor, finalMatch] = final.match(cursor, input)
      if (finalMatch === undefined) {
        ;[cursor, mainMatch] = main.match(prevCursor, input)
        if (mainMatch === undefined) return [cursor, undefined]
        mainMatches.push(mainMatch)
      } else {
        return [cursor, {mainMatches, finalMatch}]
      }
    }
  })
}


/**
 * Match all Matchers until one of them will match.
 * @param {[Matcher]} matchers 
 * @returns {object} {
 *   match: result of matched Matcher
 *   matchedIndex: index of matched Matcher (starts from 0)
 * }
 */
export function or(...matchers)
{
  return new Matcher(function(startCursor, input) {
    if (matchers.length == 0) return [startCursor, undefined]
    let maxCursor = startCursor
    for (var i=0; i<matchers.length; i++) {
      let [cursor, match] = matchers[i].match(startCursor, input)
      if (match !== undefined) return [
        cursor,
        {
          matchedIndex: i,
          match
        }
      ]
      maxCursor = Math.max(maxCursor, cursor)
    }
    return [maxCursor, undefined]
  })
}


/**
 * Match all Matchers one by one
 * @param {[Matcher]} matchers 
 * @returns {array} results of Matchers
 */
export function sequence(...matchers)
{
  return new Matcher(function(cursor, input) {
    var
      matches = [],
      match

    for (var i=0; i < matchers.length; i++) {
      ;[cursor, match] = matchers[i].match(cursor, input)
      if (match === undefined) {
        return [cursor, undefined]
      }
      matches.push(match)
    }

    return [cursor, matches]
  })
}


/**
 * Repeat one Matcher several times
 * @param {Matcher} matcher
 * @param {int} from optional, default is 0
 * @param {int} to optional, default is undefined which means "as much as possible"
 * @returns {array} results of Matchers
 */
export function repeat(matcher, from = 0, to)
{
  return new Matcher(function(cursor, input) {
    var
      matches = [],
      match,
      i = 0

    while (to === undefined || i < to) {
      [cursor, match] = matcher.match(cursor, input)
      if (match == undefined) break
      matches.push(match)
      i++
    }

    if (i >= from && (to === undefined || i <= to)) {
      return [cursor, matches]
    } else {
      return [cursor, undefined]
    }
  })
}