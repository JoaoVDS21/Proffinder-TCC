let modalViewArea = document.querySelector('#modalViewArea')
let titleArea = document.querySelector('#viewTitleArea')
let imgArea = document.querySelector('.info-img-area img')
let infoProfessor = document.querySelector('.info-professor')
let formArea = document.querySelector('form#formViewArea')
let closeModalViewArea = document.querySelector('#closeModalViewArea')
let vDescricao = document.querySelector('#vDescricao')
let alertBox = document.querySelector('#alertBox')

closeModalViewArea.addEventListener('click', ()=>{
    modalViewArea.classList.add('hide')
})

function viewArea(id, idProfessor = "", inPanel){
    let data = new FormData()
    data.append('tipo', 'listarAreasProfessor')
    data.append('idArea', id)
    idProfessor != "" && data.append('idProfessor', idProfessor)
    dir = inPanel ? '../' : ''
    Ajax('POST', dir+URL_WEBSERVICE+'area.php', data, (retorno)=>{
        if(retorno.status == 1){
            openModalViewArea(retorno, inPanel, idProfessor)
        } else {
            alert(retorno.msg)
        }
    })
}

function openModalViewArea(retorno, inPanel = true){
    let dir = inPanel ? '../' : ''
    let nomeCut = retorno.areas[0]['nome'].split(' ')
    nomeCut = nomeCut[0]+' '.concat(nomeCut[1] || '')
    modalViewArea.classList.remove('hide')
    titleArea.innerText = retorno.areas[0]['titulo']
    imgArea.src = dir+'img/areas/'+retorno.areas[0]['imgArea']
    infoProfessor.children[0].src = dir+'img/users/'+retorno.areas[0]['imgProfessor']
    infoProfessor.children[1].innerText = nomeCut
    infoProfessor.children[1].href = dir+'profile-info.html?id='+retorno.areas[0]['id_professor']
    formArea['idArea'].value = retorno.areas[0]['id_area']
    if(formArea['idProfessor']){
        formArea['idProfessor'].value = retorno.areas[0]['id_professor']
    }
    formArea['vTipoEstudo'].value = retorno.areas[0]['tipo_estudo']
    formArea['vCategoria'].value = retorno.areas[0]['nome_categoria']
    vDescricao.innerText = retorno.areas[0]['descricao']
}

formArea.addEventListener('submit',(e)=>{
    if(userLogged){
        e.preventDefault()
        let data = new FormData(formArea)
        data.append('tipo', 'cadastrarSolicitacao')
        Ajax('POST', URL_WEBSERVICE+'solicitacao.php', data, posSolicitacao)
    } else {
        e.preventDefault()
        openModal()
    }
    
})

posSolicitacao = (retorno)=>{
    if(retorno.status == 1){
        location.href="cpanel/cpanelCl.html"
    } else {
        alert(retorno.msg)
    }
}