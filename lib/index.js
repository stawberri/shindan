const request = require('request'), cheerio = require('cheerio')

let friendlyPromise = (callback, promise) => {
  promise.then((...args) => {
    if(typeof callback === 'function') setImmediate(callback, ...args)
  })
  return promise
}

let promisify = (resolve, reject) => (error, response, body) => {
  if(error) return reject(error)
  resolve(body)
}

Object.assign(exports, {
  diagnose(shindan, name = '', callback) {
    if(isNaN(shindan = parseInt(shindan))) throw new Error('shindan must be an integer')
    if(!(name = String(name)).length) throw new Error("name must be a nonempty string")
    return friendlyPromise(callback, new Promise((resolve, reject) => {
      request.post({
        uri: `https://en.shindanmaker.com/${shindan}`,
        formData: {u: name},
        callback: promisify(resolve, reject)
      })
    }).then(body => new Promise((resolve, reject) => {
      const $ = cheerio.load(body)
      let resultElement = $('div.result2>div')
      if(!resultElement.length) reject(new Error("shindanmaker results html element not found"))
      resolve({
        result: resultElement.text().trim().replace(/\xa0/g, ' ')
      })
    })))
  },
  list(options = {mode: ''}, callback) {
    if(typeof options === 'function') [callback, options] = [options, '']
    if(typeof options === 'string') options = {mode: options}
    if(typeof options !== 'object') throw new Error('options must be an object or a string')
    return friendlyPromise(callback, new Promise((resolve, reject) => {
      request({
        uri: 'https://en.shindanmaker.com/c/list',
        qs: options,
        callback: promisify(resolve, reject)
      })
    }).then(body => new Promise((resolve, reject) => {
      const $ = cheerio.load(body)

      let results = []
      $('a.list_title').each((index, element) => {
        let title = $(element)
        let number = title.next('span.list_num')
        let thisRow = number.closest('tr')
        let order = thisRow.find('td.list_shindan_list_number')
        let infoRow = thisRow.next('tr')
        let desc = infoRow.find('span.list_description_text')
        let favs = infoRow.find('a.favlabel')
        let author = infoRow.find('span.list_author>a')
        let tagLinks = infoRow.find('a.themelabel')

        let favorites = parseInt(favs.text().replace(/\D/g,''))
        if(isNaN(favorites)) favorites = 0

        let tags = []
        tagLinks.each((tagIndex, tag) => {
          tags.push($(tag).text())
        })

        results.push({
          order: parseInt(order.text().replace(/\D/g,'')),
          id: parseInt(title.attr('href').replace(/^\//, '')),
          title: title.text(),
          author: author.text(),
          description: desc.text(),
          tags,
          favorites,
          diagnoses: parseInt(number.text().replace(/\D/g,''))
        })
      })
      resolve(results)
    })))
  }
})
