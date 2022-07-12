import request from 'request'
import fs from 'fs'


const download = (url, path) => {
  try {
    request.head(url, () => {
      request(url).pipe(fs.createWriteStream(path)).on('close', () => console.log('Done!'))
    })

    console.log(path)
  } catch (error) {
    console.error('functions -> download', error.message)
    return { error: error.message } // Server error
  }
}


export {
  download, 
}