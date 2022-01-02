let changeButton = document.querySelector('#changeButton')
let boxResult = document.querySelector('#boxResult')
let formSearchBar = document.querySelector('#formSearchBar')
let formSearchByOptions = document.querySelector('#formSearchByOptions')
let userLogged = false
let disabled


window.onload = ()=>{

    verificaLogin((retorno)=>{
        if(retorno.status == 1){
            userLogged = true
            changeButton.innerHTML = "PAINEL"
            retorno.tipousuario == 'aluno' ? panelUrl = 'cpanel/cpanelCl.html' : panelUrl = 'cpanel/cpanelPr.html'
            changeButton.setAttribute('href',  panelUrl)
            executarListagem(userLogged, true)

            formSearchByOptions['categoria'].innerHTML = '<option value="default">Todas</option>'
            listCatInSelect(formSearchByOptions['categoria'], "", "")
        
            formSearchByOptions['cidadeUf'].innerHTML = '<option value="default">Todas</option>'
            listCityInSelect(formSearchByOptions['cidadeUf'], "", "")
            
        } else {  
            executarListagem(userLogged, true)

            formSearchByOptions['categoria'].innerHTML = '<option value="default">Todas</option>'
            listCatInSelect(formSearchByOptions['categoria'], "", "")
        
            formSearchByOptions['cidadeUf'].innerHTML = '<option value="default">Todas</option>'
            listCityInSelect(formSearchByOptions['cidadeUf'], "", "")
            
        }
    }, URL_WEBSERVICE+'usuario.php')

    formSearchBar.addEventListener('submit', (e)=>{
        e.preventDefault()
        executarListagem(userLogged, false)
    })
    
    formSearchByOptions.addEventListener('submit', (e)=>{
        e.preventDefault()
        executarListagem(userLogged, false)
    })
}


//firstList = primeira listagem

function executarListagem(isLogged, firstList){
    openModalLoading()
    let data
    if(!firstList){
        data = new FormData(formSearchByOptions)
        data.append('busca', formSearchBar['busca'].value.trim())
    } else {
        data = new FormData()
    }
    data.append('tipo', 'listarAreas')
    data.append('firstList', firstList)
    
    Ajax('POST', URL_WEBSERVICE+'area.php', data, (retorno)=>{
        exibeListagem(retorno, isLogged)
    })
}

exibeListagem = (retorno, isLogged)=>{
    let retornoListagem = retorno
    if(retorno.status == 1){
        !isLogged && openModal()
        listarAreasSolicitadas('', (retorno)=>{
            sessionStorage.clear()
            if(retorno.status == 1){
                let areasSolicitadas = retorno.areas.map(area => area.id_area)
                exibeDadosListagem(retornoListagem, areasSolicitadas)
            } else {
                exibeDadosListagem(retornoListagem)
            }
        })

    } else {
        !isLogged && openModal()
        closeModalLoading(500)
        boxResult.innerHTML = `
            <div class="card-alert">
                <h3>${retorno.msg}</h3>
            </div>
        `
    }
}

exibeDadosListagem = (retorno, areas = [])=>{
    boxResult.innerHTML = ""
        retorno.areas.forEach(area=>{
            tmText = 170
            txtDescricao = area['descricao'].length > tmText ? area['descricao'].substring(0, tmText).concat(' (...)') : area['descricao']

            if(userLogged){
                if(areas.includes(area['id_area'])){
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
                        <img src="img/users/${area['imgProfessor']}">
                    </div>
                    <div class="box-info-area">
                        <h3>${area['titulo']}</h3>
                        <p>${txtDescricao}</p>
                    </div>
                    <div class="box-access">
                        ${button}
                        <a href="profile-info.html?id=${area['id_professor']}" class="btn-profile">VER PERFIL</a>
                    </div>
                </div>
            </div>
            `
        })
        closeModalLoading(500)
}