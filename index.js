const rp = require('request-promise');
const location = require('location-href');
const cheerio = require('cheerio');
const fs = require('fs');

require('dotenv').config()
/*
`
add home page to pages Set
go to first page in Set
scrape all links 
store them into the Set
while we are on that page scrape all images and append to file

creates 2 files: 
allLInks.txt -- all links found in crawl
images.txt -- all images found and which page they exist on
`
*/

let set = new Set();
set.add(process.env.URL)

const getStuff = val => {
  return rp({
    uri: val,
    transform: body => cheerio.load(body)
  })
}

let iterator = set.values()

const crawl = iter => {
  let next = iter.next().value
  if (next) {
    getStuff(next)
      .then($ => {
        $('a').each((i, x) => {
          const link = $(x).attr('href');
          if (link) {
            if (process.env.URL.split('').every((x, i) => x === link.split('')[i])) {
              set.add(`${link}`)
            }
            else if (link.split('')[0] === '/') {
              set.add(`${process.env.URL}${link}`)
            }
          }
        })
      })
      .then(() => {
        console.log(set)
        console.log('the next one', iter.next().value)
        crawl(iter)
      })
      .catch(err => {
        console.log(err);
        console.log('the next one', iter.next().value);
        crawl(iter);
      })
  }
  else {
    set.forEach(uri => {
      fs.appendFileSync('allLinks.txt', `${uri} \r\n`)
      getStuff(uri)
        .then($ => {
          $('img').each((i, x) => {
            console.log(x.attribs.src)
            fs.appendFileSync('images.txt', `${x.attribs.src} :::: ${uri}  \r\n`)
          })
        })
        .catch(err => {
          console.log(err);
        })
    })
    return
  }
}
crawl(iterator)