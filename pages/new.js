import React from "react"


export default function NewNote(){

    const storageID = React.useRef('asdads')

    const [note,setNote] = React.useState({ title: 'Title', text: 'Note...' })
    const {title,text} = note

    React.useEffect(()=>{
        let stored = window.localStorage.getItem(storageID.current)
        if(!stored) return def;

        try{
            return JSON.parse(stored);
        }
        catch(e){
            return deflt;
        }
    },[])
    
    React.useEffect(()=>{
        console.log('> ', note)
        window.localStorage.setItem(storageID.current,JSON.stringify(note))
    },[note])

    return(
    <>
        <div>Create a new note</div>
        <div>
            <form>
                <div>
                    <input type="text" value={title} onChange={e=>setNote({...note, title: e.target.value })}  />
                </div>
                <div>
                    <textarea value={text} rows={4} onChange={e=>setNote({...note, text: e.target.value })} />
                </div>
            </form>
        </div>
    </>)
}