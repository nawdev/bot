require("./settings")
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
    downloadContentFromMessage,
  fetchLatestWaWebVersion
} = require("@adiwajshing/baileys");
const fs = require("fs");
const pino = require("pino");
const path = require('path');
const FileType = require('file-type')
const { Boom } = require("@hapi/boom");
const PhoneNumber = require("awesome-phonenumber");
const readline = require("readline");
const { smsg } = require("./lib/myfunc");

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

const usePairingCode = true
const question = (text) => {
  const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
  });
  return new Promise((resolve) => {
rl.question(text, resolve)
  })
};

async function startBotz() {
const { state, saveCreds } = await useMultiFileAuthState("session")
const indrx = makeWASocket({
logger: pino({ level: "silent" }),
printQRInTerminal: !usePairingCode,
auth: state,
browser: ['Chrome (Linux)', '', '']
});
if(usePairingCode && !indrx.authState.creds.registered) {
		const phoneNumber = await question('Masukan Nomer Yang Aktif Awali Dengan 62 Recode :\n');
		const code = await indrx.requestPairingCode(phoneNumber.trim())
		console.log(`Pairing code: ${code}`)

	}

  store.bind(indrx.ev);

  indrx.ev.on("messages.upsert", async (chatUpdate) => {
       try {
          const mek = chatUpdate.messages[0]
          if (!mek.message) return
          mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
          if (mek.key && mek.key.remoteJid === 'status@broadcast'){
          if (autoread_status) { await indrx.readMessages([mek.key]) }} 
          if (!indrx.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
          if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
          const m = smsg(indrx, mek, store)
          require("./case")(indrx, m, chatUpdate, store)
       } catch (err) {
         console.log(err)
     }
  });

  // Setting
  indrx.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  indrx.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = indrx.decodeJid(contact.id);
      if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
    }
  });

  indrx.getName = (jid, withoutContact = false) => {
    id = indrx.decodeJid(jid);
    withoutContact = indrx.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name || v.subject)) v = indrx.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === indrx.decodeJid(indrx.user.id)
          ? indrx.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  indrx.public = true;

  indrx.serializeM = (m) => smsg(indrx, m, store);
  indrx.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`);
        startBotz();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting....");
        startBotz();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection Lost from Server, reconnecting...");
        startBotz();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
        startBotz();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Delete Folder Session yusril and Scan Again.`);
        startBotz();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        startBotz();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        startBotz();
      } else {
        console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
        startBotz();
      } 
      } else if (connection === 'connecting') {
        
      } else if (connection === "open") {
        indrx.sendMessage(indrx.user.id, { text: `Bot Connected` });
      }
  });
  
indrx.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
  let quoted = message.msg ? message.msg : message;
  let mime = (message.msg || message).mimetype || '';
  let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
  const stream = await downloadContentFromMessage(quoted, messageType);
  let buffer = Buffer.from([]);
  
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  let type = await FileType.fromBuffer(buffer);
  const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;

  // save to file
  await fs.writeFileSync(trueFileName, buffer);

  // set timeout for 5 seconds to delete the file
  setTimeout(() => {
    fs.unlinkSync(trueFileName);
    console.log(`File ${trueFileName} deleted after 5 seconds.`);
  }, 5000);

  return trueFileName;
}

  indrx.ev.on("creds.update", saveCreds);
  indrx.sendText = (jid, text, quoted = "", options) => indrx.sendMessage(jid, { text: text, ...options }, { quoted });
  return indrx;
}

startBotz();

//batas
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)
})
