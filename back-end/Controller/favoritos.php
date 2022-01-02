<?php

require_once "../Model/Connection.php";
$retorno = array();
extract($_POST);
session_start();

if(isset($_POST['tipo'])){
    if($tipo == "cadastrar"){
        $con = new Connection();
        $sql = "INSERT INTO favoritos VALUES(0, :ia, :ip)";
        $stmt = $con->connect()->prepare($sql);
        $stmt->bindParam(':ia', $_SESSION['idusuario']);
        $stmt->bindParam(':ip', $idProfessor);
        if($stmt->execute()){
            $retorno['status'] = 1;
            $retorno['msg'] = "Professor adicionado aos favoritos!";
        } else {
            $retorno['status'] = 1;
            $retorno['msg'] = "Erro ao adicionar aos favoritos";
        }
    } else if($tipo == "listar"){
        $con = new Connection();
        $sql = "SELECT * FROM favoritos INNER JOIN professor ON favoritos.id_professor = professor.id_professor WHERE id_aluno = :ia";
        $stmt = $con->connect()->prepare($sql);
        $stmt->bindParam(':ia', $_SESSION['idusuario']);
        $stmt->execute();
        $favoritos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($favoritos){
            $retorno['status'] = 1;
            $retorno['favoritos'] = $favoritos;
            $retorno['idusuario'] = $_SESSION['idusuario'];
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Nenhum professor adicionado aos favoritos!";
        }
    } else if($tipo = "deletar"){
        if(isset($_POST['id'])){
            $con = new Connection();
            $sql = "DELETE FROM favoritos WHERE id_aluno = :ia AND id_professor = :ip";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':ia', $_SESSION['idusuario']);
            $stmt->bindParam(':ip', $id);
            if($stmt->execute()){
                $retorno['status'] = 1;
                $retorno['msg'] = "Favorito deletado com sucesso!";
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Erro ao deletar favorito!";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Nenhum favorito selecionado!";
        }
        
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = "Requisição inválida!";
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>