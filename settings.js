const fs = require("fs");
const util = require("util");


global.owner = ['6285658939117']
//mess
global.mess = {
    success: '🤗Done Kak',
    admin: '❗Perintah Ini Hanya Bisa Digunakan Oleh Admin Group !',
    botAdmin: '❗Perintah Ini Hanya Bisa Digunakan Ketika Bot Menjadi Admin Group !',
    owner: '❗Perintah Ini Hanya Bisa Digunakan Oleh Owner !',
    group: '❗Perintah Ini Hanya Bisa Digunakan Di Group Chat !',
    private: '❗Perintah Ini Hanya Bisa Digunakan Di Private Chat !',
    mgroup: 'masuk group bot dulu',
    bot: '🤖 Fitur Khusus User Premium Bot !',
    wait: '⏳ Sedang Di Proses !',
    endLimit: '🕊️ Limit Harian Anda Telah Habis, Limit Akan Direset Setiap Jam 12 !',
    error: '🚫 Fitur Sedang Error !',
}

//batas
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)
})