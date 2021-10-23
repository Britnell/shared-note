import db from '../../lib/db'

export default async function handler(req, res) {
    let data = await db.findNote({
        name: 'house',
        passkey: '123'
    })
    console.log(' FIND ', data)
    res.status(200).json({ name: 'John Doe' })
  }
  