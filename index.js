require('dotenv').config()
const Twit = require('twit')
const axios = require('axios')

const twitterClient = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const current_year = new Date().getFullYear()
const hundreds = Array.from({length:50},(v,k)=>k*100+100)
const repdigits = Array.from({length:9},(v,k)=>k*111+222)
const repdigitsBig = Array.from({length:9},(v,k)=>k*1111+1111)
const tens = Array.from({length:9},(v,k)=>k*10+10)
const ones = Array.from({length:9},(v,k)=>k+1)
const otherYears = [150, 250]
const years = hundreds.concat(repdigits, repdigitsBig, ones, tens, otherYears)

function yearToInt(year) {
  if (year.includes('BC')) {
    return -parseInt(year.replace(/\D/g, ""))
  } else if (year.includes('AD')){
    return parseInt(year.replace(/\D/g, ""))
  } else {
    return parseInt(year)
  }
}

axios
  .get('https://history.muffinlabs.com/date')
  .then(response => {
    const data = response.data.data ? response.data.data : {}
    let tweet
    var largestDiff = 0
    var largestDiffIdx = 0
    if (data.Events && data.Events.length) {
      data.Events.forEach((element, index) => {
        diff_year = current_year - yearToInt(element.year)
        if (years.includes(diff_year)) {
          if (diff_year > largestDiff) {
            largestDiff = diff_year
            largestDiffIdx = index
          }
        }
      })

      const today = new Date()
      const month = today.toLocaleString('default', { month: 'short' })
      const day = today.getDate()
      const year = data.Events[largestDiffIdx].year
      let text = data.Events[largestDiffIdx].text
      if (text.length > 237) {
        text = text.substring(0,237) + "..."
      }
      if (largestDiff == 0) {
        largestDiff = current_year - yearToInt(element.year)
      }

      tweet = "Today " + largestDiff + " years ago:\n"
              + day + " " + month + " " + year + ' - ' + text
      
    } else {
      tweet = 'Nothing happened on this date in the past'
    }
    //console.log(tweet)
    twitterClient.post('statuses/update', { status: tweet }, function(err, data, response) {
      if(!err) {
        console.log('Tweeting successful')
      } else {
        console.log(err.message)
      }
    })
  })
  .catch (err => {
    console.error(err)
  })