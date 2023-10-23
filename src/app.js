/** Returns the sum of user scores
 * @param {Object.<string, number>} scores
 * @returns {number}
 * @example getScore({Anna: 10, Olga: 1, Ivan: 5}) // 16
 */
// eslint-disable-next-line
function getScore(scores) {
  let sum = 0
  for (const user in scores) {
    sum += scores[user]
  }
  return sum
}

// eslint-disable-next-line
// const getScore = (scores) => Object.values(scores).reduce((a, b) => a + b, 0)
