# shindan
shindanmaker web scraper

shindan is a web scraper for [ShindanMaker](https://en.shindanmaker.com/), a joke fortune telling website.

```js
const shindan = require('shindan')

shindan
  .diagnose(587458, 'pudding')
  .then(console.log) // Chaotic Good Leafdancer of Animal, Pudding the Enlightened.
```

Authors on ShindanMaker create short, often comical diagnoses based on message fragments that are shuffled together, and then visitors enter their names and read these random diagnoses with their names inserted in. I couldn't find an official API to do this on ShindanMaker's site, so I decided to just scrape their website for data.

## Usage

### promise = shindan.diagnose(shindanID, name[, callback])

* `shindanID` *number*. You can find this in your shindan's uri. Must be an integer.
* `name` *string*. Who is the diagnosis for? Can't be an empty string, but can be anything else ShindanMaker supports.
* `promise` / `callback` You can use either or both.
  - `result` *string*. Diagnosis result.
  - `error` *Error*. You can get request errors, which are internet issues, and parsing errors, which would happen because ShindanMaker changed their site markup. Please report the latter type of error.

At the moment, the only thing you can do with shindan is look up diagnosis results.
