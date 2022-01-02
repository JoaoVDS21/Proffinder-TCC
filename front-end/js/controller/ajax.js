const URL_WEBSERVICE = "../back-end/Controller/"

function Ajax(method, url, data, func){
    let req = new XMLHttpRequest();
    req.onreadystatechange = () => {
        if(req.readyState == 4 && req.status == 200){
            let obj = JSON.parse(req.responseText)
            func(obj)
        }
    }
    req.open(method, url, true)
    req.send(data)
}