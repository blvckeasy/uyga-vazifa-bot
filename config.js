import dotenv from 'dotenv'
dotenv.config()

const mime_types = {
  cpp: "text/x-c++src",
  c: "text/x-csrc",
  py: "text/x-python",
  js: "application/javascript",
  txt: "text/plain",
  html: "text/html",
  css: "text/css",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  // img: 
}


export default {
  mime_types,
}