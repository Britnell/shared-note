import React from 'react'
import db from '../../lib/db'
import { apiPost } from '../../lib/api'


function Element({id, data, onChange, addNew, focus }){  // data = { type, text} 
    const [input,setInput] = React.useState(data.text)

    const inputRef = React.useRef()
    const wrapRef = React.useRef()

    const changeType = (ev)=>{
        if(data.type==='text')
            onChange(id,{...data,type: 'list'}) 
        else if(data.type==='list')
            onChange(id,{...data,type: 'todo', done: false })
        else 
            onChange(id,{...data,type: 'text'})
    }

    const keyDown = (ev)=>{
        if(ev.keyCode===13){    // enter key - add new
            ev.preventDefault()
            addNew({ type: data.type, id})
        }
    }

    const updateArea = (ev)=>{
        let area = ev.target
        setInput(area.value)
        onChange(id,{...data, text: area.value  })
    }

    
    // focus 
    React.useEffect(()=>{   
        if(id===focus)     inputRef.current.focus()
    },[focus])

    // * update text-div-twin
    const onTextInput = ()=>{
        wrapRef.current.dataset.replicatedValue = inputRef.current.value
    }
    React.useEffect(onTextInput,[])

    var icon;
    if(data.type==='text')
        icon = ''
    else if(data.type==='list')  // ∙ • ○ ‣ ⁃ ⚫ ⚪ ⁌ ⁍ ➼ 
        icon = '•'
    else if(data.type==='todo')
        icon = (<input type="checkbox" value={data.done}></input>)

    const inputField = (<textarea 
        className=" "
        rows={1} 
        onInput={onTextInput} 
        ref={inputRef} 
        value={input} 
        onChange={updateArea} 
        onKeyDown={(ev)=>{ if(data.type!=='text')  keyDown(ev)     }}
    />)


    return (
        <div className="el-row bg-white rounded-lg shadow-md m-2 overflow-hidden ">            
            <div className="w-6 flex items-center justify-center ">
                {icon}
            </div>

            <div ref={wrapRef} className="el-input py-1 ">
                {inputField} 
            </div>
            <div className="el-type bg-gray-100 flex items-center justify-center">
                <button className="h-full" onClick={changeType} >{data.type}</button>
            </div>
        </div>)
    
}



export default function Note({note}){

    const [content,setContent] = React.useState(note.content)
    const [focus,setFocus] = React.useState(0)

    // console.log(' <Note ', content )
    
    const add = ()=>{
        setFocus(content.length)
        setContent([...content,{
            type:content[focus].type,
            text:'', 
            id: content.length 
        }])
    }

    const elementChange = (id,data)=>{
        let _content = [...content]
        _content[id] = data
        setContent(_content)
    }

    
    const addNew = ({type,id})=>{
        setFocus(content.length)
        let _content = [ ...content.slice(0,id+1), {type,text:'',id: content.length}, ...content.slice(id+1) ]
        setFocus(id+1)
        setContent(_content)
    }

    const saveRef = React.useRef()

    function autosave(){
        // saveRef.current.textContent = 'auto-saving'
        saveRef.current.disabled = true
        save()
    }
    function manualsave(){
        // saveRef.current.textContent = 'saving'
        saveRef.current.disabled = true
        save()
    }
    function hasChanged(){
        saveRef.current.textContent = 'save'
        saveRef.current.disabled = false
    }

    function save(){
        apiPost('/api/update',{ id: note.id, content })
        .then(res=>{
            saveRef.current.textContent = 'saved'
            saveRef.current.disabled = true
        })
    }

    React.useEffect(()=>{   
        hasChanged()
        const timer = setTimeout(autosave , 1000)
        return ()=> clearTimeout(timer)
    },[content])


    
    return (
        <div className="container flex flex-col h-screen">
            <header className=" font-serif italic text-xl py-6 text-center bg-blue-300   "
                >{note.name}</header>
            
            <main className="flex-1 bg-blue-100">
                
                <div className="flex flex-row-reverse">
                    <button 
                        className=" w-28 py-1 mx-2 mt-2 bg-gray-100 rounded-lg shadow-md disabled:opacity-50 "
                        ref={saveRef} 
                        onClick={manualsave} 
                        >Save</button>
                </div>
                
                <div className="" >
                    {content.map((el,id)=> (
                        <Element 
                            key={el.id} 
                            id={id} 
                            data={el} 
                            onChange={elementChange} 
                            addNew={addNew}
                            focus={focus}
                        />))}
                </div>
                <div className="flex justify-center">
                    <button className=" w-32 py-1 text-xl   bg-white rounded-lg shadow-md "
                        onClick={add}>+</button>
                </div>
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    let name = context.query.name 
    let passkey = context.query.k
    let note = await db.findNote({name,passkey})
    try {
        let json = JSON.parse(note.content)
        note.content = json
    } catch(e){
        console.log(' ERROR parsing note content json ', e)
    }
    return {
      props: {  note, }, 
    }
  }