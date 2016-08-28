const request = require('request'), cheerio = require('cheerio')
exports.diagnose = (shindan, name = '', callback) => {
  if(isNaN(shindan = parseInt(shindan))) throw new Error('shindan must be an integer')
  if(!(name = String(name)).length) throw new Error("name must be a nonempty string")
  let promise = new Promise((resolve, reject) => {
    request.post({
      uri: `https://en.shindanmaker.com/${shindan}`,
      formData: {u: name}
    }, (error, response, body) => {
      if(error) reject(error)
      resolve(body)
    })
  }).then(body => new Promise((resolve, reject) => {
    const $ = cheerio.load(body)
    let resultElement = $('.result2>div')
    if(!resultElement.length) reject(new Error("shindanmaker results html element not found"))
    resolve(resultElement.text().trim())
  }))
  promise.then((...args) => {
    if(typeof callback === 'function') setImmediate(callback, ...args)
  })
  return promise
}
