<?php

require_once "../Model/Connection.php";
$retorno = array();
extract($_POST);

if(isset($_POST['tipo'])){
    if($tipo == "listar"){
        $con = new Connection();
        $sqlId = isset($_POST['id']) ? "WHERE id_professor = $id" : "";
        $sql = "SELECT id_professor, nome, imagem, email, cidade FROM professor $sqlId";
        $stmt = $con->connect()->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($data){
            $retorno['status'] = 1;
            $retorno['professores'] = $data;
        } else {
            $retorno['status'] = 0;
        }
    } else if($tipo == "listarCidades"){
        $con = new Connection();
        $sql = "SELECT cidade FROM professor";
        $stmt = $con->connect()->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($data){
            $retorno['status'] = 1;
            $retorno['cidades'] = $data;
        } else {
            $retorno['status'] = 0;
        }
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = "Requisição inválida!";
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>