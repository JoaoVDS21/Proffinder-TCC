let boxContatosSide = document.querySelector('#boxContatosSide')
let formChat = document.querySelector('#formChat')
let aboutContato = document.querySelector('.about-contato')
let chat = document.querySelector('.chat')
let callMsg

function loadMensagensPanel(){
    callMsg && clearInterval(callMsg)
    listaContatos()
    callMsg = setInterval(()=>listaMensagensChat(formChat['idContato'].value), 500)
}

chat.addEventListener('mouseenter', ()=>{
    chat.classList.add('active')
})

chat.addEventListener('mouseleave', ()=>{
    chat.classList.remove('active')
})


function listaContatos(){
    let data = new FormData()
    data.append('tipo', 'listarContatos')
    openModalLoading()
    Ajax('POST', '../'+URL_WEBSERVICE+'chat.php', data, (retorno)=>{
        boxContatosSide.innerHTML = ""
        if(retorno.status == 1){
            retorno.contatos.forEach((contato, index) =>{
                index == 0 && openChat(contato['id_contato'], contato['nome'], contato['imagem'])
                boxContatosSide.innerHTML += `
                    <div class="contato-item" onclick="openChat(${contato['id_contato']}, '${contato['nome']}', '${contato['imagem']}')">
                        <div class="photo">
                            <img src="../img/users/${contato['imagem']}">
                        </div>
                        <div class="contato-info">
                            <h4>${contato['nome']}</h4>
                        </div>
                    </div>
                `
            })
            closeModalLoading()
        } else {
            boxContatosSide.innerHTML = `<div style="width: 100%; height: 100%;display: flex; justify-content: center; align-items: center;"><strong>${retorno.msg}</strong></div>` 
            closeModalLoading()

        }
    })
}

function openChat(idContato, nome, imagem){
    aboutContato.children[0].src = '../img/users/'+imagem
    aboutContato.children[1].innerText = nome
    formChat['idContato'].value = parseInt(idContato)
    
    listaMensagensChat(idContato)
}

formChat.addEventListener('submit', e=>{
    e.preventDefault()
    if(formChat['msg'].value.trim() != ''){
        let data = new FormData(formChat)
        data.append('tipo', 'cadastrarMsg')
        Ajax('POST', '../'+URL_WEBSERVICE+'chat.php', data, (retorno)=>{
            if(retorno.status == 1){
                listaMensagensChat(formChat['idContato'].value)
                formChat['msg'].value = ""
            } else {
                console.log(retorno.msg)
            }
        })
    }
    
})



let listaMensagensChat = (idContato)=>{
    let data = new FormData()
    data.append('tipo', 'listarMensagens')
    data.append('idContato', idContato)
    Ajax('POST', '../'+URL_WEBSERVICE+'chat.php', data, (retorno)=>{
        chat.innerHTML = ""
        if(retorno.status == 1){
            
            retorno.mensagens.forEach(msg => {
                if(msg['msg_de'] == retorno.userAtual){
                    chat.innerHTML += `
                        <div class="mensagem-de">
                            <p>${msg['txt_msg']}</p>
                        </div>
                    `
                } else {
                    chat.innerHTML += `
                        <div class="mensagem-para">
                            <p>${msg['txt_msg']}</p>
                        </div>
                    `
                }
            })
            
            if(chat.scrollHeight - chat.clientHeight == chat.scrollTop){
                scrollToBottom(chat)
            } else if(!chat.classList.contains('active')){
                scrollToBottom(chat)
            }
        } else {
            chat.innerHTML = `<div style="width: 100%; height: 100%;display: flex; justify-content: center; align-items: center;"><strong>${retorno.msg}</strong></div>` 
        }
    })
} 

function scrollToBottom(div){
    div.scrollTop = div.scrollHeight
}

