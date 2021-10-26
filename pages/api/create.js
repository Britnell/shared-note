import db from '../../lib/db'
import hasher from 'object-hash'
import { colours } from '../../lib/api'

function randomWords(){
    return fetch(`https://random-word-api.herokuapp.com/word?number=${3}`)
        .then(res=>res.json())
}

function createUid(name){
    name = name.toLowerCase()
    return randomWords()
           .then(words=>[name,...words].join('-') )
}

export default async function handler(req, res) {
    let name = req.body.data.name 
    let uid = await createUid(name)
    let hash = hasher({ uid, date: new Date().getTime(), millis: new Date().getMilliseconds()   })
    let c = Math.floor(Math.random()*colours.length)
    let created = await db.createNote({
        name: uid, 
        passkey: hash,
        content: '[{"type":"text","text":""}]',
        colour: colours[c],
     })
    res.status(200).json(created)
  }
  