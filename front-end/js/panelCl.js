const navbarItems = document.querySelectorAll('.navbar-item')
const screens = document.querySelectorAll('.screen')
let btnLogout = document.querySelector('#btnLogout')
let itemLogout = document.querySelector('#itemLogout')
let titleProfilePanel = document.querySelector('#titleProfilePanel')
let photoNavbar = document.querySelector('.profile-info .profile-photo img')
let boxFavoritos = document.querySelector('#boxFavoritos')
let boxAreas = document.querySelector('#boxAreas')
let cardAreas
let cardFav

window.onload = ()=>{
    verificaLogin((retorno) => {
        if(retorno.status == 1 && retorno.tipousuario != 'aluno'){
            location.href="cpanelPr.html"

        } else if(retorno.status == 0){
            location.href="../index.html"
        }
    }, '../'+URL_WEBSERVICE+'usuario.php')
    loadAreasSolicitadas();


    setTimeout(()=>{
        document.querySelector('.loading').classList.add('hide')
    }, 1000)
    
    for(screen of screens){
        if(screen.id != "areasSolicitadas"){
            screen.style.display = "none"
        }
    }
    navbarItems[0].classList.add('active')

    navbarItems.forEach((item, index) => {
        item.addEventListener('click', ()=>{
            changeScreenPanel(item, index)
        })
    })

    btnLogout.addEventListener('click', (e)=>{
        deslogar(e)
    })

    retornaUsuario((retorno)=>{
        photoNavbar.src = '../img/users/'+retorno.usuario.imagem
        titleProfilePanel.innerText = 'Olá, '+retorno.usuario.nome
    })

}

function changeScreenPanel(tela, index){
    let item = tela === "" ? navbarItems[index] : tela

    item.classList.add('active')
    screens[index].style.display = "flex"
    for(screen of screens){
        if(screen !== screens[index]){
            screen.style.display = "none"
        }
    }
    for(itemN of navbarItems){
        itemN !== item ? itemN.classList.remove('active') : null
    }

    switch(item.dataset.nav){
        case 'areasSolicitadas': 
            loadAreasSolicitadas();
            clearInterval(callMsg)
            break;
        case 'mensagens': 
            loadMensagensPanel();
            break;
        case 'editarPerfil': 
            loadEditPerfil();
            clearInterval(callMsg)
            break;
        case 'favoritos': 
            loadFavoritos();
            clearInterval(callMsg)
            break;
        default:
            clearInterval(callMsg)
            break;
    }
        
}

function loadAreasSolicitadas(){
    listarAreasSolicitadas('../', (retorno)=>{
        if(retorno.status == 1){
            areas = retorno.areas.map(area=>area['id_area'])
            // areas = [...areas]
            areasToString = '('+areas+')'
    
            let data = new FormData()
            data.append('tipo','listarAreas')
            data.append('areasSolicitadas', areasToString)
            Ajax('POST','../'+URL_WEBSERVICE+'area.php', data, posListagemAreasSolicitadas)
        } else {
            boxAreas.innerHTML = `
                <div class="alert-box">${retorno.msg}</div>
            `
        }
        
    })
}

posListagemAreasSolicitadas = (retorno)=>{
    boxAreas.innerHTML = ""
    if(retorno.status == 1){
        retorno.areas.forEach(area =>{
            boxAreas.innerHTML += `
                <div class="card-area" onclick="viewArea(${area['id_area']}, ${area['id_professor']}, true)" data-delete="${area['id_area']}">
                    <img src="../img/users/${area['imgProfessor']}" class="img-professor">
                    <span class="btn-delete" onclick="deleteSolicitacao(${area['id_area']})"><i class="fas fa-trash-alt"></i></span>
                    <img src="../img/areas/${area['imgArea']}" alt="">
                    <div class="text-card-area">
                        <h3>${area['titulo']}</h3>
                        <p class="cat-card">Categoria: ${area['nome_categoria']}</p>
                        <span>Cidade: ${area['cidade']}</span>
                        <button class="editar-area" onclick="changeScreenPanel('',1)">
                            <i class="far fa-edit"></i>
                            ESCREVER
                        </button>
                    </div>
                </div>
            `
        })
        cardAreas = document.querySelectorAll('.card-area')
    } else {
        boxAreas.innerHTML = `
            <div class="alert-box">${retorno.msg}</div>
        `
    }
}

deleteSolicitacao = (idArea)=>{
    let data = new FormData()
    data.append('tipo', 'delete')
    data.append('idArea', idArea)
    Ajax('POST', '../'+URL_WEBSERVICE+'solicitacao.php', data, (retorno)=>{
        if(retorno.status == 1){
            for(card of cardAreas){
                card.dataset.delete == idArea && ocultaDiv(card)
                openModal(false)
            }
        } else {

        }
    })
}

function loadFavoritos(){
    boxFavoritos.innerHTML = ""
    listaFavoritos("../", (retorno)=>{
        if(retorno.status == 1){
            retorno.favoritos.forEach(favorito =>{
                let nomeCut = favorito['nome'].split(' ')
                nomeCut = nomeCut[0]+' '.concat(nomeCut[1] || '')
                boxFavoritos.innerHTML += `
                    <div class="card-fav" data-delete="${favorito['id_favorito']}">
                        <div class="access-overlay">
                            <a href="../profile-info.html?id=${favorito['id_professor']}">Acessar</a>
                        </div>
                        <img src="../img/users/${favorito['imagem']}" alt="">
                        <h3>${nomeCut}</h3>
                        <span onclick="removeFavorite('../', ${favorito['id_professor']}, (retorno)=>{retorno.status==1?posDeleteFav(${favorito['id_favorito']}):alert(retorno.msg)})">X</span>
                    </div>
                `
            })
        } else {
            boxFavoritos.innerHTML = `
                <div class="alert-box">${retorno.msg}</div>
            `
        }
        
        cardFav = document.querySelectorAll('.card-fav')
        
    })
}

function posDeleteFav (idFav){
    for(card of cardFav){
        card.dataset.delete == idFav && ocultaDiv(card)
    }
}

function ocultaDiv(el){
    el.style.transform = "scale(0) translateX(-100%)"
    setTimeout(()=>{el.classList.add('delete')}, 500)
}