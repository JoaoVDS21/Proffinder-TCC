let c = 0
let screens = document.querySelectorAll('.container-main')
let navbarItems = document.querySelectorAll('.navbar a')
const btnPrev = document.getElementById('ctrlPrev')
const btnNext = document.getElementById('ctrlNext')
const btnChangeCadastro = document.querySelector('.btn-changeCadastro')
const divChangeCadastro = document.querySelector('#changeCadastro')
const formCadastro = document.querySelector('.box-changeForm .box-form ')
const container = document.querySelector('.container')
const photoSobre = document.querySelectorAll('.box-testmonial-sobre img')
const root = document.documentElement
let changeButton = document.querySelector('#changeButton')

let tWidth = divChangeCadastro.clientWidth
let tFormWidth = formCadastro.clientWidth

let tHeight = divChangeCadastro.clientHeight
let tFormHeight = formCadastro.clientHeight


screens = Array.from(screens)
navbarItems = Array.from(navbarItems)

window.addEventListener('load', ()=>{
    let url_string = window.location.href
    let url = new URL(url_string)
    let data = parseInt(url.searchParams.get('i'))
    
    isNaN(data) ? changeScreen(0) : changeScreen(data)
    

    {
        btnPrev.addEventListener('click', ()=>{
            changeScreen(-1)
        })
        
        btnNext.addEventListener('click', ()=>{
            changeScreen(+1)
        })
        
        navbarItems.forEach(item => {
            item.addEventListener('click', (e)=>{
                item.getAttribute('href') == "#" && e.preventDefault()
                c = 0
                changeScreen(navbarItems.indexOf(item))
                
            })
        })

        
        
    }

    verificaLogin((retorno)=>{
        if(retorno.status == 1){
            changeButton.innerHTML = "PAINEL"
            retorno.tipousuario == 'aluno' ? panelUrl = 'cpanel/cpanelCl.html' : panelUrl = 'cpanel/cpanelPr.html'
            changeButton.setAttribute('href',  panelUrl)
            setTimeout(()=>{
                document.querySelector('.loading').classList.add('hide')
            }, 1000)
        } else {
            
            setTimeout(()=>{
                document.querySelector('.loading').classList.add('hide')
                openModal()
            }, 1000)
            
        }
    }, URL_WEBSERVICE+'usuario.php')
    
})





function changeScreen(ctrl){
    c += ctrl

    if(c >= screens.length){
        c = 0
    } else if(c < 0){
        c = screens.length - 1
    }
    screens[c].classList.add('show')

    if (screens[c] === screens[3]){
        let pWidth = photoSobre[0].clientWidth
        photoSobre.forEach(img => {
            img.style.height = `${pWidth}px`
            console.log(img.clientHeight, img.clientWidth)
        })
    }

    for(screen of screens){
        if(screen.classList.contains('show') && screen !== screens[c]) screen.classList.remove('show') 
    }
    
    let navbarItemSelected = document.querySelector(`.navbar a[data-main="${screens[c].dataset.main}"]`)
    navbarItemSelected.classList.add('active')
    for(item of navbarItems){
        if(item !== navbarItemSelected) item.classList.remove('active')
    }
    let child = c + 1


    

}


btnChangeCadastro.addEventListener('click', ()=> {

    formCadastro.style.transitionDelay = `0s`
    divChangeCadastro.style.transitionDelay = `0s`

    let forCellphone = window.matchMedia('(max-width: 480px)').matches 
    let typeTranslate1 = forCellphone ? `translateY(-${tHeight}px)` : `translateX(${tWidth}px)`
    let typeTranslate2 = forCellphone ? `translateY(${tFormHeight}px)` : `translateX(-${tFormWidth}px)`

    if(btnChangeCadastro.innerHTML == "CADASTRAR COMO PROFESSOR"){
        
        formCadastro.style.setProperty('transform', typeTranslate1)
        divChangeCadastro.style.setProperty('transform', typeTranslate2)
        setTimeout(()=>changeContent('aluno'), 250)
    } else {
        formCadastro.style.setProperty('transform', `translate(0)`)
        divChangeCadastro.style.setProperty('transform', `translate(0)`)

        setTimeout(()=>changeContent('professor'), 250)

    }

    

})

function changeContent(dest){
    if(dest == 'professor'){
        divChangeCadastro.children[0].innerHTML = "Se deseja se cadastrar como professor, clique no botão abaixo"
        divChangeCadastro.children[1].innerHTML = "CADASTRAR COMO PROFESSOR"
        container.classList.remove('change')

        formCadastro.children[0].innerHTML = "CADASTRE-SE COMO ALUNO"
    } else {
        divChangeCadastro.children[0].innerHTML = "Se deseja se cadastrar como aluno, clique no botão abaixo"
        divChangeCadastro.children[1].innerHTML = "CADASTRAR COMO ALUNO"
        container.classList.add('change')

        formCadastro.children[0].innerHTML = "CADASTRE-SE COMO PROFESSOR"


    }
    formCadastro.style.transitionDelay = `.5s`
    divChangeCadastro.style.transitionDelay = `.64s`
}