let loading = document.querySelector('.loading')
let btnVoltar = document.querySelector('.btnVoltar')
let changeButton = document.querySelector('#changeButton')
let boxResult = document.querySelector('#boxResult')
let boxForms = document.querySelector('#boxForms')
let imgProfile = document.querySelector('#imgProfile')
let btnFavoritos = document.querySelector('.btn-favoritos')
let userLogged = false
var solicitacoes
let disabled


window.onload = ()=>{
    btnVoltar.addEventListener('click', function(){
        window.history.back()
    })

    verificaLogin((retorno)=>{
        let url_string = window.location.href
        let url = new URL(url_string)
        let data = parseInt(url.searchParams.get('id'))

        if(retorno.status == 1){
            changeButton.innerHTML = "PAINEL"
            let panelUrl = retorno.tipousuario == 'aluno' ? 'cpanel/cpanelCl.html' : 'cpanel/cpanelPr.html'
            changeButton.setAttribute('href',  panelUrl)

            
            if(isNaN(data) || !data){
                location.href="search.html"
            } else {
                showProfile(data)
            }
            userLogged = true
        } else {
            
            if(isNaN(data) || !data){
                location.href="search.html"
            } else {
                showProfile(data)
            }
            
        }
    }, URL_WEBSERVICE+'usuario.php')
}

function showProfile(idProfessor){
    let data = new FormData()
    data.append('tipo', 'listar')
    data.append('id', idProfessor)
    Ajax('POST', URL_WEBSERVICE+'professor.php', data, (retorno)=>{
        if(retorno.status == 1){
            exibeDadosProfessor(retorno.professores[0])
            closeModalLoading()

            let data = new FormData()
            data.append('tipo', 'listarAreasProfessor')
            data.append('idProfessor', idProfessor)
            Ajax('POST', URL_WEBSERVICE+'area.php', data, posListagemAreas)

        } else {
            location.href="search.html"
        }
    })
}

function exibeDadosProfessor(professor){
    boxForms['nome'].value = professor.nome != "" ? professor.nome : "Não informado!"
    boxForms['email'].value = professor.email != "" ? professor.email : "Não informado!"
    boxForms['cidade'].value = professor.cidade != "" ? professor.cidade : "Não informado!"
    imgProfile.src = 'img/users/'+professor.imagem

    if(userLogged){
        btnFavoritos.setAttribute('id', professor.id_professor)
        listaFavoritos("",verifyFavorite)
    } else {
        btnFavoritos.style.display = "none"
    }
    
}

posListagemAreas = (retorno)=>{
    boxResult.innerHTML = ""
    if(retorno.status == 1){
        let solicitacoes = listarAreasSolicitadas('', (retorno)=>{
            sessionStorage.clear()
            if(retorno.status == 1){
                let sol = retorno.areas.map(area => area.id_area)
                sessionStorage.setItem('solicitacoes', sol)
            } else {
                sessionStorage.setItem('solicitacoes', false)
            }
        })
        // console.log(sessionStorage.getItem('solicitacoes'))
        solicitacoes = sessionStorage.solicitacoes
        // console.log(sessionStorage.getItem('solicitacoes')
        
        retorno.areas.forEach(area =>{
            tmText = 170
            txtDescricao = area['descricao'].length > tmText ? area['descricao'].substring(0, tmText).concat(' (...)') : area['descricao']
            if(solicitacoes.includes(area['id_area'])){
                button = `
                    <a href="#" class="disabled" onclick="return false" disabled="disabled" style="background: #444">SOLICITADO</a>
                `
                disabled = `
                    onclick="return false"
                `
            } else {
                button = `
                    <a href="javascript: viewArea(${area['id_area']}, ${area['id_professor']}, false)">SOLICITAR</a>
                ` 
                disabled = `
                    onclick="viewArea(${area['id_area']}, ${area['id_professor']}, false)"
                `
            }

            boxResult.innerHTML += `
            <div class="card-area" data-delete="${area['id_area']}">
                <div class="box-overlay-cat" ${disabled}>
                    <img src="img/areas/${area['imgArea']}">
                    <span>${area['nome_categoria']} <p>${area['tipo_estudo']}</p></span>
                    
                </div>
                <div class="box-card-area">
                    <div class="box-img-profile">
                    </div>
                    <div class="box-info-area">
                        <h3>${area['titulo']}</h3>
                        <p>${txtDescricao}</p>
                    </div>
                    <div class="box-access">
                        ${button}
                    </div>
                </div>
            </div>
            `
        })
        cardAreasCadastradas = document.querySelectorAll('.card-area')
        
    } else {
        boxResult.innerHTML = `<div style="width: 100%; height: 100%;display: flex; justify-content: center; align-items: center;"><strong>${retorno.msg}</strong></div>` 
    }
}


function addFavorite(id){
    let data = new FormData()
    data.append('tipo','cadastrar')
    data.append('idProfessor',id)
    Ajax('POST',URL_WEBSERVICE+'favoritos.php', data, (retorno)=>{
        if(retorno.status == 1){
            listaFavoritos("",verifyFavorite)
        } else {
            alert(retorno.msg)
        }
    })
}

verifyFavorite = (retorno)=>{
    btnFavoritos = document.querySelector('.btn-favoritos')
    if(retorno.status == 1){
        let favsUser = retorno.favoritos.filter(fav => {
            return (fav.id_professor == btnFavoritos.id) && fav
            
        })
        if(favsUser.length > 0){
            btnFavoritos.innerHTML = `
                <i class="fas fa-check"></i>
                Adicionado aos favoritos
            `
            btnFavoritos.removeAttribute('onclick')
            btnFavoritos.classList.add('added')
            btnFavoritos.setAttribute('onclick', `removeFavorite("",${btnFavoritos.id}, ()=>listaFavoritos("",verifyFavorite))`)
            btnFavoritos.addEventListener('mouseover', mouseOverFav)
            btnFavoritos.addEventListener('mouseout', mouseOutFav)

        } else {
            btnFavoritos.innerHTML = `
                <i class="fas fa-heart"></i>
                Adicionar aos favoritos
            `
            btnFavoritos.classList.remove('added','remove')
            btnFavoritos.setAttribute('onclick', `addFavorite(${btnFavoritos.id})`)
            
            btnFavoritos.removeEventListener('mouseout', mouseOutFav)
            btnFavoritos.removeEventListener('mouseover',mouseOverFav)
            
        }
    } else {
        btnFavoritos.innerHTML = `
            <i class="fas fa-heart"></i>
            Adicionar aos favoritos
        `
        btnFavoritos.setAttribute('onclick', `addFavorite(${btnFavoritos.id})`)

        btnFavoritos.classList.remove('added','remove')
        btnFavoritos.classList.remove('remove')
        btnFavoritos.removeEventListener('mouseout', mouseOutFav)
        btnFavoritos.removeEventListener('mouseover',mouseOverFav)

    }
}

mouseOverFav = ()=>{
    btnFavoritos.classList.add('remove')
    btnFavoritos.innerHTML = `
        <i class="fas fa-ban"></i>
        Remover dos favoritos
    `
}
mouseOutFav = ()=>{
    btnFavoritos.classList.remove('remove')
    btnFavoritos.innerHTML = `
        <i class="fas fa-check"></i>
        Adicionado aos favoritos
    `
}