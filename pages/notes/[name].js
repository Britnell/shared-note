import React from 'react'
import db from '../../lib/db'
import { apiPost } from '../../lib/api'

import { usePopper } from 'react-popper';
import react from 'react';


function Element({data, id, focus, dispatch, }){  // eee

    const inputRef = React.useRef()
    const wrapRef = React.useRef()

    // React.useEffect(()=>{

    const keyDown = (ev)=>{
        if(ev.keyCode===13){    // enter key - add new
            ev.preventDefault()
            dispatch({ type:'insert', value:{ id, type: data.type } })
        }
        else if(ev.keyCode===8){
            if( data.text.length===0 ){
                dispatch({type:'delete', value: {id} })
            }
        }
    }

    const onChange = (ev)=>{
        dispatch({type: 'text',value:{ id, text: ev.target.value }})
    }
    const changeType = (ev)=>{
        if(data.type==='text')
            dispatch({type:'type',value:{ id, type:'list'}})    
        else if(data.type==='list')
            dispatch({type:'type',value:{ id, type:'todo'}})    
        else 
            dispatch({type:'type',value:{ id, type:'text'}})    
    }

    const todoInput = (ev)=>{
        dispatch({type:'todo',value: { id, done: ev.target.checked } })
    }

    
    // focus 
    React.useEffect(()=>{   
        if(focus===id)     inputRef.current.focus()
    },[focus,id])

    // * update text-div-twin
    const onTextInput = ()=>{
        wrapRef.current.dataset.replicatedValue = inputRef.current.value
    }
    React.useEffect(onTextInput,[])

    var icon;
    if(data.type==='text')
        icon = <div></div>
    else if(data.type==='list')  // ∙ • ○ ‣ ⁃ ⚫ ⚪ ⁌ ⁍ ➼ 
        icon = <div className="w-6 flex items-center justify-center ">•</div>
    else if(data.type==='todo')
        icon = (
            <div className="w-6 flex items-center justify-center ">
                <input type="checkbox" onChange={todoInput} checked={data.done} />
            </div>)

    const inputField = (<textarea 
        className=""
        rows={1} 
        onInput={onTextInput} 
        ref={inputRef} 
        value={data.text} 
        onChange={onChange} 
        onKeyDown={(ev)=>{ if(data.type!=='text')  keyDown(ev)     }}
    />)


    return (
        <div className="el-row bg-white rounded-lg shadow-md m-2 overflow-hidden ">            
            
            {icon}

            <div ref={wrapRef} className="el-input py-1 px-2">
                {inputField} 
            </div>
            <div className="el-type bg-gray-100 flex items-center justify-center">
                <button className="h-full" onClick={changeType} >{data.type}</button>
            </div>
        </div>)
    
}


function noteReducer(state,action){ //rrr
    let next = {...state} , i, el
    switch(action.type){
        case 'add':
            i = state.content[state.content.length-1]
            next.content = [...state.content,{
                key: state.keys,
                type: i? i.type : 'text',
                text: '',
                done: false,
            }]
            next.focus = next.content.length-1
            next.keys++;
            return next;
        case 'insert':
            i = action.value.id+1
            el = {   
                key: state.keys,
                type: action.value.type,     
                text: '',
                done: false,
            }
            next.content = [
                ...state.content.slice(0,i),
                el,
                ...state.content.slice(i),
            ]
            next.focus = i
            next.keys++;
            return next;
        case 'text': 
            next.content[action.value.id].text = action.value.text
            return next
        case 'type':
            next.content[action.value.id].type = action.value.type
            return next
        case 'todo':
            next.content[action.value.id].done = action.value.done
            return next;
        case 'delete':
            i = action.value.id
            next.content = [
                ...state.content.slice(0,i),
                ...state.content.slice(i+1)
            ]
            next.focus = i
            if(next.focus>=next.content.length)    
                next.focus = next.content.length-1
            return next;
        default:
            return next;
    }
}

function initReducer(note){    
    let max = 0
    for(let i in note.content){
        if(note.content[i].key>max) max = note.content[i].key
    }
    note.keys = max+1
    note.focus = note.content.length-1
    return note
}

function Empty(){

    return (<div> NOTE NOT FOUND </div>)
}

export default function Note({note}){

    if(!note)        return <Empty />

    const [state,dispatch] = React.useReducer(noteReducer,initReducer(note) )
    
    const saveRef = React.useRef()
    
    // console.log(state.content )
    
    const addClick = ()=> dispatch({type:'add',value:'text'})
    
    // * Save

    function save(){
        saveRef.current.disabled = true
        apiPost('/api/update',{ 
            id: note.id, 
            content: state.content 
        })
        .then(res=>{
            saveRef.current.textContent = 'saved'
            saveRef.current.disabled = true
        })
    }

    React.useEffect(()=>{
        saveRef.current.textContent = 'save'
        saveRef.current.disabled = false
        const timer = setTimeout(save , 1600)
        return ()=> clearTimeout(timer)
    },[state])


    const share = ()=>{
        if ("share" in navigator){  
            // app share
            navigator.share({
                title: 'Shared Note',
                text: `Here's a shared note for us`,
                url: window.location.href,
              })
              .then(() => console.log('Successful share'))
              .catch(error => console.log('Error sharing:', error));
        }
        else {  
            // clipboard
            navigator.clipboard.writeText(window.location.href)
            .then(() => console.log('copy success '))
            .catch(err => console.log('copy failed ' + err ));
        }

    }
    
    return (
        <div className="flex flex-col h-screen">
            <header className=" font-serif italic text-xl py-6 text-center bg-blue-300   "
                >{note.name}</header>
            
            <main className="flex-1 bg-blue-100">
            <div className="max-w-lg mx-auto ">

                <div className="flex  justify-between mx-2 mt-2 ">
                    <button 
                        className=" w-28 py-1 bg-gray-100 rounded-lg shadow-md disabled:opacity-50 "
                        ref={saveRef} 
                        onClick={save} 
                    >Save</button>
                    
                    <button 
                        className=" w-24 py-1 bg-blue-200 rounded-lg "
                        onClick={share}
                    >Share</button>

                </div>
                
                <div className="" >
                    {state.content.map((el,id)=> (
                        <Element 
                            key={el.key}
                            id={id}
                            data={el} 
                            dispatch={dispatch}
                            focus={state.focus}
                        />))}
                </div>
                <div className="flex justify-center">
                    <button className=" w-full h-8 py-1 my-4 mx-2 text-xl bg-blue-200 rounded-lg shadow-md "
                        onClick={addClick}>+</button>
                </div>

            </div>
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    let name = context.query.name 
    let passkey = context.query.key
    let note = await db.findNote({name,passkey})
    if(!note || !passkey)       return { props: { note: {name} } }
    if(!note.passkey===passkey) return { props: { note: {name} } }
    // let password = context.query.password
    // console.log(note, name, passkey, password )
    try {
        note.content = JSON.parse(note.content)
    } catch(e){
        note.content = {}
    }
    return {
      props: {  note, }, 
    }
  }