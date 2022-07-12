import dotenv from 'dotenv'
dotenv.config()

const list_limit = 3

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

const callback_query = {
  question: `<b>Savolingizni yuboring.</b>\n<b><i>pov:</i></b> savolni quyidagicha ko'rinishda yuboring: \n<i>#savol: Bugun ob havo qanday?</i>`,
  homework: `Uyga vazifani file korinshida tashlang.`,
  offer: `Taklifingizni yozing.`,
  cancel: `Successfully cancelled.`,
  confirmed: `Tasdiqlandi. 36 soat ichida tekshirilinadi.`,
  reject: `Bekor qilindi.`,
  delete_file: "File o'chirildi",
  "cancel&&mute": "ok",
}

export {
  mime_types,
  callback_query,
  list_limit,
}