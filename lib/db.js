import { PrismaClient } from '@prisma/client'

// See here: https://github.com/prisma/prisma-client-js/issues/228#issuecomment-618433162
let prisma

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient()
}
// `stg` or `dev`
else {
	if (!global.prisma) {
		global.prisma = new PrismaClient()
	}

	prisma = global.prisma
}


// function errorResp(error){}

function createNote({name,passkey,content}){
	return prisma.notes.create({
		data: { name,passkey, content }
	})
}
function findNote({name,passkey}){
	return prisma.notes.findFirst({
		where: {	name, passkey	}
	})
}

function updateNote(id,{content}){
	return prisma.notes.update({
		where: { id },
		data: {	content },
	})
}

const db = { 
	createNote, findNote, updateNote,
	
};

export default db;

// export default prisma
