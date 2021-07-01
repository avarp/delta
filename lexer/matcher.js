/**
 * MATCHER is an object which using RULE grabs symbols from the INPUT from the position marked by CURSOR and returns MATCH.
 * INPUT is a constant string.
 * CURSOR is an integer greater than zero.
 * RULE should be a pure function. It accepts INPUT and CURSOR. It should return array: [new CURSOR, MATCH].
 * MATCH can be any value depending on implementation of RULE. If RULE failed to find a match MATCH should be undefined.
 * If RULE failed new CURSOR should indicate how much symbols RULE has tried to read before it has failed.
 * 
 * @param {function} rule the RULE function
 */
export default function Matcher(rule)
{
  this._rule = rule
  this._then = (cursor, match) => [cursor, match]
}




/**
 * Set a MODIFIER.
 * MODIFIER should be a pure function. It is called only if RULE have found a MATCH (i.e. MATCH is not undefined).
 * It can accept up to 4 parameters:
 *  - new CURSOR returned by RULE
 *  - MATCH returned by RULE
 *  - INPUT
 *  - previous CURSOR value
 * It should return [new CURSOR, MATCH]. MATCH should not be undefined since this value is reserved for indicating that RULE didn't match.
 * But the fact that MODIFIER has been called means that RULE matched.
 * 
 * @param {*} fn the MODIFIER function
 * @returns {Matcher} useful for chaining
 */
Matcher.prototype.then = function(fn)
{
  this._then = fn
  return this
}




/**
 * Test input string
 * 
 * @param {int} cursor the CURSOR value, i.e. from which point to start
 * @param {string} input the INPUT value
 * @returns {[cursor, match]} result of RULE passed through MODIFIER
 */
Matcher.prototype.match = function(cursor, input)
{
  let [newCursor, match] = this._rule(cursor, input)
  if (match === undefined) {
    return [newCursor, undefined]
  } else {
    return this._then(newCursor, match, cursor, input)
  }
}