require("./settings")
const { exec, spawn, execSync } = require("child_process")
const fs = require('fs')
const util = require('util')
const { performance } = require("perf_hooks"); 
const { fetchJson, getGroupAdmins, generateProfilePicture, jsonformat } = require('./lib/myfunc')


module.exports = indrx = async (indrx, m, chatUpdate, store) => {
try {
var body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
var budy = (typeof m.text == 'string' ? m.text : '')
var prefix = /^[\\/!#.]/gi.test(body) ? body.match(/^[\\/!#.]/gi) : "/"
const isCmd = body.startsWith(prefix)
const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const pushname = m.pushName || "No Name"
const botNumber = await indrx.decodeJid(indrx.user.id)
const itsMe = m.sender == botNumber ? true : false
const text = q = args.join(" ")
const isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
const sender = m.isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid
const quoted = m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const isMedia = /image|video|sticker|audio/.test(mime)
const from = m.chat
const reply = m.reply
//group
const groupMetadata = m.isGroup ? await indrx.groupMetadata(from).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false

//detec message 
if (isCmd && m.isGroup) {
    console.log(`\n▧ ───────···`);
    console.log(`│⌲ 𝙶𝚁𝙾𝚄𝙿 𝙲𝙷𝙰𝚃 :`);
    console.log(`│⌲ [ PESAN ]`, budy || m.mtype, '\n│⌲ 🎉 𝙳𝙰𝚁𝙸', m.sender, '\n│❑ => 𝙸𝙽', groupName, m.chat);
    console.log(`▧ ───────···`);
} else {
    console.log(`\n▧ ───────···`);
    console.log(`│⌲ 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙲𝙷𝙰𝚃 :`);
    console.log(`│⌲ [ PESAN ]`, budy || m.mtype, '\n│⌲ 👀 𝙽𝚄𝙼𝙱𝙴𝚁', m.sender);
    console.log(`▧ ───────···`);
}
let list = []
for (let i of owner) {
list.push({
displayName: await indrx.getName(i + '@s.whatsapp.net'),
vcard: `BEGIN:VCARD\n
VERSION:3.0\n
N:${await indrx.getName(i + '@s.whatsapp.net')}\n
FN:${await indrx.getName(i + '@s.whatsapp.net')}\n
item1.TEL;waid=${i}:${i}\n
item1.X-ABLabel:Ponsel\n
item2.EMAIL;type=INTERNET:putuofc@yahoo.com\n
item2.X-ABLabel:Email\n
item3.URL:https://putz.my.id\n
item3.X-ABLabel:Owner Botz\n
item4.ADR:;;Indonesia;;;;\n
item4.X-ABLabel:Region\n
END:VCARD`
})
}

switch(command) {
case 'menu':{
let text = `
_*Api Menu*_
┌ ◦ ${prefix}gemini
│ ◦ ${prefix}ytmp3
│ ◦ ${prefix}ytmp4
│ ◦ ${prefix}lahelu
└ ◦ ${prefix}tiktok

_*Main Menu*_
┌ ◦ ${prefix}ping
└ ◦ ${prefix}owner

_*Group Menu*_
┌ ◦ ${prefix}add
│ ◦ ${prefix}kick
│ ◦ ${prefix}linkgroup
│ ◦ ${prefix}hidetag
│ ◦ ${prefix}demote
│ ◦ ${prefix}demote
│ ◦ ${prefix}group
└ ◦ ${prefix}tagall

_*Owner Menu*_
┌ ◦ ${prefix}setppbot
│ ◦ ${prefix}setnamabot
│ ◦ ${prefix}setbiobot
│ ◦ >
│ ◦ =>
│ ◦ $
│ ◦ ${prefix}join
└ ◦ ${prefix}leave

● *_Power by putz.my.id_*
`
indrx.sendMessage(m.chat, { text: text, contextInfo: { forwardingScore: 10, isForwarded: true, businessMessageForwardInfo: { businessOwnerJid: botNumber }}})
}
break
case 'owner': {
const repf = await indrx.sendMessage(from, { 
contacts: { 
displayName: `${list.length} Contact`, 
contacts: list }, mentions: [sender] }, { quoted: m })
indrx.sendMessage(from, { text : `Hi @${sender.split("@")[0]}, Here is my handsome owner😇`, mentions: [sender]}, { quoted: repf })
}
break
case 'tiktok':
case 'tiktokdl': {
if (!q) return reply(`Example: ${prefix + command} link lu`)
let res = await fetchJson(`https://www.putz.my.id/api/download?type=tiktok&q=${q}`)
indrx.sendMessage(sender, { video: { url: res.result.nowm }, fileName: `tiktok.mp4`, mimetype: 'video/mp4' }).then(() => {
indrx.sendMessage(sender, { audio: { url: res.result.audio }, fileName: `tiktok.mp3`, mimetype: 'audio/mp4' })
})
m.reply(`halo kak ${pushname}\nvideo dan audio sudah di kirim ke private message`)
}
break
case 'ytmp4':{
if (!q) return reply(`Example: ${prefix + command} link lu`)
let res = await fetchJson(`https://www.putz.my.id/api/youtube?type=ytDonlodMp4&q=${q}`)
indrx.sendMessage(sender, { video: { url: res.url }, fileName: `youtube.mp4`, mimetype: 'video/mp4' })
m.reply(`halo kak ${pushname}\nvideo sudah di kirim ke private message`)
}
break
case 'ytmp3':{
if (!q) return reply(`Example: ${prefix + command} link lu`)
let res = await fetchJson(`https://www.putz.my.id/api/youtube?type=ytDonlodMp3&q=${q}`)
indrx.sendMessage(sender, { video: { url: res.url }, fileName: `youtube.mp4`, mimetype: 'video/mp4' })
m.reply(`halo kak ${pushname}\naudio sudah di kirim ke private message`)
}
break
        case 'lahelu':{
if (!q) return reply(`Example: ${prefix + command} link lu`)
let res = await fetchJson(`https://www.putz.my.id/api/download?type=lahelu&q=${q}`)
indrx.sendMessage(sender, { video: { url: res.result.media }, fileName: `youtube.mp4`, mimetype: 'video/mp4' })
m.reply(`halo kak ${pushname}\naudio sudah di kirim ke private message`)
}
break
case 'gemini':{
if (!q) return reply(`Example: ${prefix + command} kapan indonesia merdeka`)
let res = await fetchJson(`https://www.putz.my.id/api/gemini?text=${q}`)
m.reply(res.result)
}
break
case 'linkgroup': case 'linkgc': {
if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
let response = await indrx.groupInviteCode(from)
indrx.sendText(from, `https://chat.whatsapp.com/${response}\n\nLink Group : ${groupMetadata.subject}`, m, { detectLink: true })
}
break
case 'kick': {
if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!isAdmins) return reply(mess.admin)
let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
await indrx.groupParticipantsUpdate(from, [users], 'remove')
}
break
case 'add': {
if (!isCreator) return reply(mess.owner)
if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!isAdmins) return reply(mess.admin)
let users = m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
await indrx.groupParticipantsUpdate(from, [users], 'add')
}
break
case 'promote': {
if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!isAdmins) return reply(mess.admin)
let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
await indrx.groupParticipantsUpdate(from, [users], 'promote')
}
break
case 'demote': {
if (!m.isGroup) return reply(mess.group)
if (!isBotAdmins) return reply(mess.botAdmin)
if (!isAdmins) return reply(mess.admin)
let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
await indrx.groupParticipantsUpdate(from, [botNumber], 'demote')
}
break
case 'hidetag': {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins) return reply(mess.admin)
indrx.sendMessage(from, { text : q ? q : '' , mentions: participants.map(a => a.id)}, {quoted:koi})
}
break
case 'group': {   
if (!m.isGroup) return reply(mess.group)
if (!isAdmins) return reply(mess.admin)
if (args[0] === 'close'){
await indrx.groupSettingUpdate(from, 'announcement').then((res) => reply(`Sukses Menutup Group`)).catch((err) => reply(jsonformat(err)))
} else if (args[0] === 'open'){
await indrx.groupSettingUpdate(from, 'not_announcement').then((res) => reply(`Sukses Membuka Group`)).catch((err) => reply(jsonformat(err)))
} else {
m.reply("Ketik .group open atau .group close")
 }
}
break
case 'join': {
if (!isCreator) return reply(mess.owner)
if (!text) throw 'Masukkan Link Group!'
let result = args[0].split('https://chat.whatsapp.com/')[1]
await indrx.groupAcceptInvite(result).then((res) => reply(jsonformat(res))).catch((err) => reply(jsonformat(err)))
}
break
case 'leave': {
if (!isCreator) return reply(mess.owner)
reply("👋🏻 Sayonara Minasan~")
await indrx.groupLeave(m.chat).then((res) => reply(jsonformat(res))).catch((err) => reply(jsonformat(err)))
}
break
case 'tagall': {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins) return reply(mess.admin)
let teks = `══✪〘 *👥 Tag All* 〙✪══
 ➲ *Pesan : ${q ? q : 'kosong'}*\n\n`
for (let mem of participants) {
teks += `⭔ @${mem.id.split('@')[0]}\n`
}
indrx.sendMessage(m.chat, { text: teks, mentions: participants.map(a => a.id) }, { quoted:m })
}
break
case 'setnamabot': case 'setnamebot': {
if (!isCreator) return reply(mess.owner)
if (!text) return reply(`Example : ${prefix + command} WhatsApp ✅`)
let name = await indrx.updateProfileName(text)
m.reply(`Successfully renamed bot to ${name}`)
}
break
case 'setstatus': case 'setbiobot': case 'setbotbio': {
if (!isCreator) return reply(mess.owner)
if (!text) return reply(`this is a WhatsApp Bot named indrx-Morou`)
let name = await indrx.updateProfileStatus(text)
m.reply(`Successfully changed bot bio status to ${name}`)
}
break
case "setppbot": {
if (!isCreator) return reply(mess.owner)
if (!quoted) return reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
if (!/image/.test(mime)) return reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
if (/webp/.test(mime)) return reply(`Kirim/Reply Image Dengan Caption ${prefix + command}`)
var medis = await indrx.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg')
if (args[0] == `/full`) {
var { img } = await generateProfilePicture(medis)
await indrx.query({
tag: 'iq',
attrs: {
to: botNumber,
type:'set',
xmlns: 'w:profile:picture'
},
content: [
{
tag: 'picture',
attrs: { type: 'image' },
content: img
}
]
})
reply(mess.success)
} else {
var memeg = await indrx.updateProfilePicture(botNumber, { url: medis })
reply(mess.success)
}
}
break        
        case"ping":{
   var old = performance.now(); 
   var neww = performance.now(); 
   var speed = neww - old; 
            reply(`Speed : ${speed} Second`)
        }
        break
default:
if (budy.startsWith('=>')) {
if (!isCreator) return reply(mess.owner)
function Return(sul) {
sat = JSON.stringify(sul, null, 2)
bang = util.format(sat)
if (sat == undefined) {
bang = util.format(sul)}
return reply(bang)}
try {
reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
} catch (e) {
reply(String(e))}}
if (budy.startsWith('>')) {
if (!isCreator) return reply(mess.owner)
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await reply(evaled)
} catch (err) {
await reply(String(err))}}
if (budy.startsWith('$')) {
if (!isCreator) return reply(mess.owner)
exec(budy.slice(2), (err, stdout) => {
if(err) return reply(err)
if (stdout) return reply(stdout)})}
}
} catch (err) {
m.reply(util.format(err))
}
}
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})
