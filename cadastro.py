from selenium import webdriver
import json 
import time

navegador = webdriver.Chrome(r"C:\driver\chromedriver.exe")
endereco_cad = "http://trabalhos/DSIII/Cadastro%20com%20Selenium/site/cliente.php"
arq_json = "json/clientes.json"


def cadCliente(nome, sobrenome, email, cidade, empresa):
    navegador.get(endereco_cad)

    input_nome = navegador.find_element_by_id('txtnome')
    input_sobrenome = navegador.find_element_by_id('txtsobrenome')
    input_email = navegador.find_element_by_id('txtemail')
    input_cidade = navegador.find_element_by_id('txtcidade')
    input_empresa = navegador.find_element_by_id('txtempresaatual')
    btn_cadastrar = navegador.find_element_by_id('btnCadastrar')

    input_nome.send_keys(nome)
    input_sobrenome.send_keys(sobrenome)
    input_email.send_keys(email)
    input_cidade.send_keys(cidade)
    input_empresa.send_keys(empresa)

    btn_cadastrar.click()


open_json = open(arq_json, encoding='utf-8')
lista_cliente = json.load(open_json)

for cliente in lista_cliente:
    cadCliente(cliente['nome'], cliente['sobrenome'], cliente['email'], cliente['cidade'], cliente['empresaatual'])
    time.sleep(0.5)

    # navegador.switch_to_alert() muda o foco do webdriver(navegador) para o alert, dando um accept(confirmação) nele
    alert = navegador.switch_to_alert()
    alert.accept()