from selenium import webdriver
import os
import json 
import time

browser = webdriver.Chrome(r"C:\driver\chromedriver.exe")
signUpAdress = "http://trabalhos/DSIII/TCC/Original/Proffinder/front-end/"
fileJson = "json/areas.json"

def logar(email, password):
    browser.get(signUpAdress)
    state = 0

    while state == 0:
        if verifiyDivLoading('document.querySelector(".loading").classList.contains("hide")'):
            time.sleep(1)

            inputEmail = browser.find_element_by_id('lemail')
            inputPassword = browser.find_element_by_id('lsenha')
            buttonSubmit = browser.find_element_by_css_selector('#form-login > input[type=submit]:nth-child(5)')

            inputEmail.send_keys(email)
            inputPassword.send_keys(password)

            buttonSubmit.click()
            state = 1
        else: 
            state = 0
       
def verifiyDivLoading(element):
    stateLoading = browser.execute_script('return '+element)
    return stateLoading

def changeScreenPanel(dataScreen):
    state = 0

    while state == 0:
        if verifiyDivLoading('document.querySelector(".loading").classList.contains("hide")'):
            screen = browser.find_element_by_css_selector('.navbar-item[data-nav="'+dataScreen+'"]')
            screen.click()

            state = 1
        else: 
            state = 0

def existsCategory(category):
    listCat = browser.execute_script('return Array.from(document.querySelectorAll("#categoria option")).map(option => {return [option.value, option.innerText]})')
    listCatTexts = browser.execute_script('return Array.from(document.querySelectorAll("#categoria option")).map(option => option.innerText)')
    if category in listCatTexts:
        for cat in listCat:
            if cat[1] == category:
                return cat
    else:
        return False
    
def signUpArea(title, studyType, category, description):
    changeScreenPanel('cadastrarArea')
    studyType = studyType.lower()

    inputTitle = browser.find_element_by_id('title') 
    inputOtherCategory = browser.find_element_by_id('ocategoria')
    textareaDescription = browser.find_element_by_css_selector('textarea[name="descricao"]')
    buttonSubmit = browser.find_element_by_css_selector('#formCadastrarArea input[type="submit"]')
    
    inputTitle.send_keys(title)
    browser.execute_script('document.querySelector(`input#'+studyType+'[value="'+studyType+'"]`).checked = true')

    if existsCategory(category):
        # Não deu certo atribuir o value direto pelo selenium
        browser.execute_script('document.querySelector("#categoria").value = '+existsCategory(category)[0])
    else:
        browser.execute_script('document.querySelector("#categoria").value = -1')
        browser.execute_script('document.querySelector("#otherCat").style.display = "flex"')
        inputOtherCategory.send_keys(category)

    textareaDescription.send_keys(description)

    buttonSubmit.click()
    time.sleep(0.5)
    alert = browser.switch_to_alert()
    alert.accept()
    

def signUpAreas():
    logar('prof@gmail.com', '123')

    openJson = open(fileJson, encoding='utf-8')
    areasList = json.load(openJson)
    for area in areasList:
        signUpArea(area['title'], area['tipo_estudo'], area['categoria'], area['descricao'])

    
signUpAreas()
