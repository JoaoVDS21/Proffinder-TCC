<?php

require_once "../Model/Connection.php";
$retorno = array();
extract($_POST);
session_start();

if(isset($_POST['tipo'])){
    if($tipo == "cadastrarSolicitacao"){
        if(isset($_POST['idArea'])){
            $con = new Connection();
            $sql = "INSERT INTO solicitacao VALUES(0, :ia, :ip,:iac)";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':ia', $_SESSION['idusuario']);
            $stmt->bindParam(':ip', $idProfessor);
            $stmt->bindParam(':iac', $idArea);
            if($stmt->execute()){
                $retorno['status'] = 1;
                $retorno['msg'] = "Área solicitada com sucesso!";
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Falha ao solicitar área!";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Área não selecionada!";
        }
    } else if($tipo == "listar"){
        $con = new Connection();
        $sql = "SELECT * FROM solicitacao WHERE id_aluno = :ia";
        $stmt = $con->connect()->prepare($sql);
        $stmt->bindParam(':ia', $_SESSION['idusuario']);
        $stmt->execute();
        $areas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($areas){
            $retorno['status'] = 1;
            $retorno['areas'] = $areas;
        }else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Não há áreas solicitadas!";
        }
    } else if($tipo == "delete"){
        if(isset($_POST['idArea'])){
            $con = new Connection();
            $sql = "DELETE FROM solicitacao WHERE id_aluno = :ia AND id_area = :iac";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':ia', $_SESSION['idusuario']);
            $stmt->bindParam(':iac', $idArea);
            if($stmt->execute()){
                $retorno['status'] = 1;
                $retorno['msg'] = "Área solicitada deletada com sucesso";
            }else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Erro ao deletar área solicitada";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Não há área selecionada!";
        }
        
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = "Requisição inválida!";
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>