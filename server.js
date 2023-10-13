
const ws = require('ws')
const writeFile = require('fs')
const { v4: uuid } = require('uuid');

const { Server } = ws
const clients = {}
const messages = []

const wss =  new Server({port:8000})
wss.on('connection', (ws) => {
   const id = uuid()
   clients[id] = ws
   ws.send(JSON.stringify(messages))
   console.log(`New client ${id}`);
   ws.on('message', (rawMessage) => {
      const {name, message} = JSON.parse(rawMessage)
      messages.push({name, message})
      for(const id in clients){
         clients[id].send(JSON.stringify([{name, message}]))
      }
   })
   ws.on('close', () => {
      delete clients[id]
      console.log(`Client is closed ${id}`);
   })
})
process.on('SIGINT', () => {
   wss.close()
   writeFile('Log', JSON.stringify(messages), err => {
      if(err){
         console.log(err);
      }
      process.exit()
   })
})