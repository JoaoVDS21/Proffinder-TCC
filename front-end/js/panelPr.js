const navbarItems = document.querySelectorAll('.navbar-item')
const screens = document.querySelectorAll('.screen')
let btnLogout = document.querySelector('#btnLogout')
let itemLogout = document.querySelector('#itemLogout')
let titleProfilePanel = document.querySelector('#titleProfilePanel')
let photoNavbar = document.querySelector('.profile-info .profile-photo img')
let selectCat = document.querySelector('#categoria')
let otherCat = document.querySelector('#otherCat')
let titleCadastrarArea = document.querySelector('#title')
let boxAreas = document.querySelector('.box-areas')
let modalEditArea = document.querySelector('#modalEditArea')
let closeModalEditArea = document.querySelector('#closeModalEditArea')
let cardAreasCadastradas 
let titleAlterarArea = document.querySelector('#aTitle')
let divImgAlterarArea = document.querySelector('#divImgAlterarArea')
let formAlterarArea = document.querySelector('#formAlterarArea')
let aOtherCat = document.querySelector('#aOtherCat')

window.onload = ()=>{
    verificaLogin((retorno) => {
        if(retorno.status == 1 && retorno.tipousuario != 'professor'){
            location.href="cpanelCl.html"
        } else if(retorno.status == 0){
            location.href="../index.html"
        }
    }, '../'+URL_WEBSERVICE+'usuario.php')
    loadMensagensPanel()

    setTimeout(()=>{
        document.querySelector('.loading').classList.add('hide')
    }, 1000)
    
    for(screen of screens){
        if(screen.id != "mensagens"){
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

    itemLogout.addEventListener('click', (e)=>{
        deslogar(e)
    })

    retornaUsuario((retorno)=>{
        photoNavbar.src = '../img/users/'+retorno.usuario.imagem
        titleProfilePanel.innerText = 'Olá, '+retorno.usuario.nome
    })

    closeModalEditArea.addEventListener('click', ()=>{
        closeModal()
    })

    formAlterarArea['aImgArea'].addEventListener('change', (e)=>{
        preloadImg(e.target, divImgAlterarArea)
    })
    
}


function changeScreenPanel(tela, index){
    let item = tela === "" ? navbarItems[index] : tela
    console.log(item)

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
        case 'mensagens': 
            loadMensagensPanel();
            break;
        case 'areasCadastradas': 
            loadAreasCadastradas();
            clearInterval(callMsg)
            break;
        case 'editarPerfil': 
            loadEditPerfil();
            clearInterval(callMsg)
            break;
        case 'cadastrarArea': 
            loadCadastrarArea();
            clearInterval(callMsg)
            break;
        default:
            console.log('nada');
            clearInterval(callMsg)
            break;
    }
        
}


function loadCadastrarArea(){

    listCatInSelect(selectCat)

    selectCat.innerHTML = `
        <option value="default"> Escolha a categoria desejada</option>
        <option value="-1">Outro</option>
    `

    selectCat.addEventListener('change', ()=>{
        selectCat.children[0].disabled = "true"
        if(selectCat.value == -1){
            otherCat.style.display = "flex"
        } else {
            otherCat.style.display = "none"
            formCadastrarArea['ocategoria'].value = ""
        }
    })

}

formCadastrarArea.addEventListener('submit', e=>{
    e.preventDefault()
    let data = new FormData(formCadastrarArea)
    data.append('tipo', 'cadastrar')
    data.append('titulo', titleCadastrarArea.value)
    Ajax('POST', '../'+URL_WEBSERVICE+'area.php', data, posCadastroArea)
})

formAlterarArea.addEventListener('submit', (e)=>{
    e.preventDefault()
    let data = new FormData(formAlterarArea)
    data.append('tipo', 'alterar')
    data.append('titulo', titleAlterarArea.value)
    Ajax('POST', '../'+URL_WEBSERVICE+'area.php', data, (retorno)=>{
        if(retorno.status == 1){
            listarAreasProfessor()
            closeModal()
        }else {
            alert(retorno.msg)
        }
    })
})


posCadastroArea = (retorno) => {
    if(retorno.status == 1){
        alert(retorno.msg)
        changeScreenPanel("", 1)
        formCadastrarArea.reset()
        titleCadastrarArea.value=""
        divImgAlterarArea.src = "../img/areas/default.png"
    } else {
        alert(retorno.msg)
    }
}

function loadAreasCadastradas(){
    listarAreasProfessor()
}

listarAreasProfessor = ()=>{
    let data = new FormData()
    data.append('tipo', 'listarAreasProfessor')
    Ajax('POST', '../'+URL_WEBSERVICE+'area.php', data, posListagemAreas)
}

posListagemAreas = (retorno)=>{
    boxAreas.innerHTML = ""
    if(retorno.status == 1){
        retorno.areas.forEach(area =>{
            tmText = 170 //Tamanho maximo do texto
            txtDescricao = area['descricao'].length > tmText ? area['descricao'].substring(0, tmText).concat(' (...)') : area['descricao']
            boxAreas.innerHTML += `
            <div class="card-area" data-delete="${area['id_area']}">
                <div class="box-overlay-cat" onclick="viewArea(${area['id_area']}, '', true)">
                    <img src="../img/areas/${area['imgArea']}">
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
                        <a href="javascript: editArea(${area['id_area']})">EDITAR</a>
                        <a href="javascript: deleteArea(${area['id_area']})" class="btn-excluir">EXCLUIR</a>
                    </div>
                </div>
            </div>
            `
        })
        cardAreasCadastradas = document.querySelectorAll('.card-area')
        
    } else {
        boxAreas.innerHTML = `<div style="width: 100%; height: 100%;display: flex; justify-content: center; align-items: center;"><strong>${retorno.msg}</strong></div>` 
    }
}


function editArea(idArea){
    let data = new FormData()
    data.append('tipo', 'listarAreasProfessor')
    data.append('idArea', idArea)
    Ajax('POST', '../'+URL_WEBSERVICE+'area.php', data, (retorno)=>{
        if(retorno.status == 1){
            listCatInSelect(formAlterarArea['aCategoria'], ()=>{
                formAlterarArea['aCategoria'].value = retorno.areas[0]['id_categoria']
                formAlterarArea['aCategoria'].children[0].disabled = "true"
                formAlterarArea['aCategoria'].addEventListener('change', ()=>{
                    if(formAlterarArea['aCategoria'].value == -1){
                        aOtherCat.style.display = "flex"
                    } else {
                        aOtherCat.style.display = "none"
                        formCadastrarArea['aOcategoria'].value = ""
                    }
                })
            })
            
            modalEditArea.classList.remove('hide')
            divImgAlterarArea.src = '../img/areas/'+retorno.areas[0]['imgArea']
            titleAlterarArea.value = retorno.areas[0]['titulo']
            formAlterarArea['aTipoEstudo'].value = retorno.areas[0]['tipo_estudo']  
            formAlterarArea['aDescricao'].value = retorno.areas[0]['descricao']
            formAlterarArea['idAlterarArea'].value = retorno.areas[0]['id_area']
        } else {
            alert(retorno.msg)
        }
    })
}

function deleteArea(idArea){
    let data = new FormData()
    data.append('tipo', 'deletarArea')
    data.append('idArea', idArea)
    Ajax('POST', '../'+URL_WEBSERVICE+'area.php', data, (retorno)=>{
        if(retorno.status == 1){
            for(card of cardAreasCadastradas){
                card.dataset.delete == idArea && ocultaDiv(card)
            }
        } else {
            alert(retorno.msg)
        }
    })
}

function ocultaDiv(div){
    div.style.transform = "translateX(-200%)"
    setTimeout(()=>div.classList.add('hide'),500)
}

function closeModal(){
    modalEditArea.classList.add('hide')
    setTimeout(()=>{
        divImgAlterarArea.src = ""
        titleAlterarArea.value = ""
        formAlterarArea.reset()
        formAlterarArea['aCategoria'].innerHTML = `
            <option value="default"> Escolha a categoria desejada</option>
            <option value="-1">Outro</option>
        `
        aOtherCat.style.display = "none"
    }, 800)
}