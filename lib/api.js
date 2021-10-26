async function fetchJson(...args) {
    try {
      const response = await fetch(...args);
      const data = await response.json();
  
      if (response.ok)  return data;
  
      const error = new Error(response.statusText);
      error.response = response;
      error.data = data;
      throw error;
    } 
    catch (error) {
      if (!error.data) {
        error.data = { message: error.message };
      }
      throw error;
    }
  }
  
function apiGet(uri,params){
    if(params)
      uri += '?' + Object.keys(params).map(key=> `${key}=${encodeURIComponent(params[key])}` ).join('&')
    return fetchJson(uri)  
  }
  
  function apiPost(uri,data){
    return fetchJson(uri,{
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({data})
    })
  }

  function getNoteUri(data){
      return `/notes/${data.name}?key=${data.passkey}`
  }

const colours = [
  0,20,30,
]

export {apiGet,apiPost,fetchJson, getNoteUri, colours,  };
  