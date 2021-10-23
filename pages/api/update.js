import db from '../../lib/db'
import hasher from 'object-hash'

export default async function handler(req, res) {
    let data = req.body.data
    let resp = await db.updateNote(data.id,{ content: JSON.stringify(data.content) })
    res.status(200).json(resp)
  }
  