<?php

require_once "../Model/Connection.php";
$retorno = array();
extract($_POST);
session_start();

if(isset($_POST['tipo'])){
    if($tipo == "cadastrarMsg"){
        if(isset($_POST['idContato'])){
            $con = new Connection();
            $sql = "INSERT INTO mensagem VALUES(0, :msgde, :msgpara, :msg)";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':msgde', $_SESSION['idusuario']);
            $stmt->bindParam(':msgpara', $idContato);
            $stmt->bindParam(':msg', $msg);
            if($stmt->execute()){
                $retorno['status'] = 1;
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Erro ao enviar mensagem!";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Não há contato selecionado!";
        }
    } else if($tipo == "listarContatos"){
        $con = new Connection();
        if($_SESSION['tipousuario'] == 'aluno'){
            $sql = "SELECT solicitacao.id_professor 'id_contato', professor.nome, professor.imagem FROM solicitacao INNER JOIN professor ON solicitacao.id_professor = professor.id_professor WHERE solicitacao.id_aluno = :iu GROUP BY solicitacao.id_professor";
            
        } else {
            $sql = "SELECT solicitacao.id_aluno 'id_contato', usuario.nome, usuario.imagem FROM solicitacao INNER JOIN usuario ON solicitacao.id_aluno = usuario.id_usuario WHERE solicitacao.id_professor = :iu GROUP BY solicitacao.id_aluno";
        }
        $stmt = $con->connect()->prepare($sql);
        $stmt->bindParam(':iu', $_SESSION['idusuario']);
        $stmt->execute();
        $contatos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($contatos){
            $retorno['status'] = 1;
            $retorno['contatos'] = $contatos;
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Não há contatos para exibir!";
        }
    } else if($tipo == "listarMensagens"){
        if(isset($_POST['idContato'])){
            $con = new Connection();
            $sql = "SELECT msg_de, msg_para, txt_msg FROM mensagem WHERE (msg_de = :iu AND msg_para = :ic) OR (msg_de = :ic AND msg_para = :iu)";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':iu', $_SESSION['idusuario']);
            $stmt->bindParam(':ic', $idContato);
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if($data){
                $retorno['status'] = 1;
                $retorno['mensagens'] = $data;
                $retorno['userAtual'] = $_SESSION['idusuario']; 
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Não há mensagens!";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Não há contato selecionado!";
        }
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = "Requisição inválida!";
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>