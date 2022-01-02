<?php

require_once "../Model/Connection.php";
extract($_POST);
$retorno = array();
session_start();

if(isset($_POST['tipo'])){
    if($tipo == 'retornarCategorias'){
        $con = new Connection();
        $sql = "SELECT * FROM categoria";
        $stmt = $con->connect()->prepare($sql);
        $stmt->execute();
        $lista = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($lista){
            $retorno['status'] = 1;
            $retorno['lista'] = $lista;
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Não há nenhuma categoria cadastrada!";
        }
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = 'Requisição inválida';
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>