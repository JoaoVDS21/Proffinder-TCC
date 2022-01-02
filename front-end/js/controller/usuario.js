let divBoxForm = document.querySelector('.box-form#screenCadastro')
let formSignUp = document.querySelector('#form-signup')
let formSignIn = document.querySelector('#form-login')
let screenEditPerfil = document.querySelector('#screenEditPerfil')
let nameScreenEditPerfil = document.querySelector('#nameScreenEditPerfil')
let imgProfileEdit = document.querySelector('#imgProfileEdit')
let inputCep = document.querySelector('.box-info input[name="cep"]')
let formCadastrarArea = document.querySelector('#formCadastrarArea')
let divImgArea = document.querySelector('#divImgArea')
let modalLogin = document.querySelector('.modal-login')
let btnCloseModal = document.querySelector('.modal-login .box-form span')



formSignUp && formSignUp.addEventListener('submit', e => {
    e.preventDefault()
    let title = divBoxForm.children[0].innerText
    let data = new FormData(formSignUp)
    let tipousuario = title == "CADASTRE-SE COMO ALUNO" ? 'aluno' : 'professor'
    data.append('tipo', 'cadastrar')
    data.append('tipousuario', tipousuario)
    Ajax("POST", URL_WEBSERVICE+'usuario.php', data, posCadastro)

})

formSignIn && formSignIn.addEventListener('submit', e => {
    e.preventDefault()
    let data = new FormData(formSignIn)
    data.append('tipo', 'login')
    Ajax("POST", URL_WEBSERVICE+'usuario.php', data, posLogin)
})

screenEditPerfil && screenEditPerfil.addEventListener('submit', e=>{
    e.preventDefault()
    let data = new FormData(screenEditPerfil)
    data.append('tipo', 'alterar')
    data.append('nome', nameScreenEditPerfil.value)
    Ajax('POST', '../'+URL_WEBSERVICE+'usuario.php', data, posAlterar)
})

screenEditPerfil && screenEditPerfil['imgPerfil'].addEventListener('change', (e) => {
    preloadImg(e.target, imgProfileEdit)
})

formCadastrarArea && formCadastrarArea['imgArea'].addEventListener('change', (e) => {
    preloadImg(e.target, divImgArea)
})

btnCloseModal && btnCloseModal.addEventListener('click', ()=>{
    modalLogin.classList.remove('show')
})

function preloadImg(input, el){
    let img = input.files[0]
    let reader = new FileReader()
    reader.onloadend = ()=>{
        el.src = reader.result
    }
    img ? reader.readAsDataURL(img) : el.src = ""

    // O método readAsDataURL é usado para ler o conteúdo do tipo Blob ou File.
    // Quando a operação de leitura acaba, a flag readyState (en-US) muda para DONE e o evento loadend (en-US) é disparado.
    // Então o atributo result (en-US) irá conter a URL codificada em base64 do arquivo.
}

screenEditPerfil && inputCep.addEventListener('keyup', ()=>{
    if(inputCep.value.length == 8){
        let data = new FormData()
        data.append('tipo', 'consultaEndereco')
        data.append('cep', inputCep.value)
        Ajax('POST', '../'+URL_WEBSERVICE+'usuario.php', data, posConsultaEndereco)
    }
})



posCadastro = (retorno) => {
    if(retorno.status == 1){
        alert(retorno.msg)
        openModal()
    } else {
        alert(retorno.msg)
    }
}

posLogin = (retorno) => {
    if(retorno.status == 1){
        if(retorno.tipousuario == 'aluno'){
            location.href="cpanel/cpanelCl.html"
        } else {
            location.href="cpanel/cpanelPr.html"
        }
    } else {
        alert(retorno.msg)
    }
}

verificaLogin = (func, url)=>{
    let data = new FormData()
    data.append('tipo', 'verificaLogin')
    Ajax("POST", url, data, func)
}

posVerficacaoLogin = (retorno) => {
    if(retorno.status == 0){
        location.href="../index.html"
    }
}

function openModal(sure = true){
    sure && modalLogin.classList.add('show')
}

deslogar = (e) => {
    e.preventDefault()
    let data = new FormData()
    data.append('tipo','deslogar')
    Ajax('POST', '../'+URL_WEBSERVICE+'usuario.php', data, (retorno)=>{
        retorno.status == 1 ? location.href = "../index.html" : alert(retorno.msg)
    })
}

retornaUsuario = (func)=>{
    let data = new FormData()
    data.append('tipo', 'retornaUsuario')
    Ajax('POST', '../'+URL_WEBSERVICE+'usuario.php', data, func)
}


loadEditPerfil = ()=>{
    retornaUsuario((retorno)=>{
        imgProfileEdit.src = '../img/users/'+retorno.usuario.imagem
        nameScreenEditPerfil.value = retorno.usuario.nome
        screenEditPerfil['email'].value = retorno.usuario.email
        screenEditPerfil['senha'].placeholder = '*******'
        screenEditPerfil['cep'].value = retorno.usuario.cep
        screenEditPerfil['logradouro'].value = retorno.usuario.logradouro
        screenEditPerfil['numLogradouro'].value = retorno.usuario.numLogradouro
        screenEditPerfil['bairro'].value = retorno.usuario.bairro
        screenEditPerfil['cidade'].value = retorno.usuario.cidade
        retorno.usuario.cep ? screenEditPerfil['cep'].value : screenEditPerfil['cep'].placeholder = "Não há endereço cadastrado"
    })
}

posAlterar = (retorno)=>{
    if(retorno.status == 1){
        location.reload(true)
    } else {
        alert(retorno.msg)
    }
}

posConsultaEndereco = (retorno)=>{
    if(retorno.status == 1){
        screenEditPerfil['logradouro'].value = retorno.endereco.logradouro
        screenEditPerfil['bairro'].value = retorno.endereco.bairro
        screenEditPerfil['cidade'].value = retorno.endereco.localidade+' - '+retorno.endereco.uf
        screenEditPerfil['numLogradouro'].value = ""
    } else {
        alert(retorno.msg)
        screenEditPerfil['logradouro'].value = ""
        screenEditPerfil['bairro'].value = ""
        screenEditPerfil['cidade'].value = ""
        screenEditPerfil['numLogradouro'].value = ""
    }
}

function viewProfile(inPanel, idProfessor){ // Se estiver no painel
    let data = new FormData()
    data.append('tipo', 'listarProfessor')

    Ajax('POST', URL_WEBSERVICE+'usuario.php', data, (retorno)=>{
        showProfile
    })
}

function closeModalLoading(time = 1000){
    setTimeout(()=>{
        document.querySelector('.loading').classList.add('hide')
    }, time)
}

function openModalLoading(){
    document.querySelector('.loading').classList.remove('hide')

}

listCatInSelect = (element, func = "", dir = "../") => {
    let data = new FormData()
    data.append('tipo', 'retornarCategorias')
    Ajax('POST', dir+URL_WEBSERVICE+'categoria.php', data, (retorno)=>{
        if(retorno.status == 1){
            retorno.lista.forEach(cat => {
                element.innerHTML += `
                    <option value="${cat['id_categoria']}">${cat['nome_categoria']}</option>
                `
            })
            func == "" || func()
        }else{
            alert(retorno.msg)
        }
    })
}

listCityInSelect = (element, func = "", dir = "../") => {
    let data = new FormData()
    data.append('tipo', 'listarCidades')
    Ajax('POST', dir+URL_WEBSERVICE+'professor.php', data, (retorno)=>{
        if(retorno.status == 1){
            retorno.cidades.forEach(nome => {
                if(nome['cidade'] != "" && nome['cidade'] != null){
                    element.innerHTML += `
                    <option value="${nome['cidade']}">${nome['cidade']}</option>
                `
                }
                
            })
            func == "" || func()
        }else{
            alert(retorno.msg)
        }
    })
}

listaFavoritos = (dir = "../", func = "")=>{
    let data = new FormData()
    data.append('tipo','listar')
    Ajax('POST', dir+URL_WEBSERVICE+'favoritos.php', data, func)
}

removeFavorite = (dir = "../", id, func = "")=>{
    let data = new FormData()
    data.append('tipo','deletar')
    data.append('id', id)
    Ajax('POST', dir+URL_WEBSERVICE+'favoritos.php', data, func)
}

function listarAreasSolicitadas(dir = "", func = ""){
    let data = new FormData()
    data.append('tipo', 'listar')
    Ajax('POST',dir+URL_WEBSERVICE+'solicitacao.php', data, func)
} 