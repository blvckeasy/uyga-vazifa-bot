import request from 'request'
import fs from 'fs'

const download = (url, path, callback) => {
  request.head(url, () => {
    request(url).pipe(fs.createWriteStream(path)).on('close', callback)
  })
}


export {
  download
}