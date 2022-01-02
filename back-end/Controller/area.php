<?php

require_once "../Model/Connection.php";
extract($_POST);
$retorno = array();
session_start();

if(isset($_POST['tipo'])){
    if($tipo == "cadastrar"){
        $con = new Connection();

        if($categoria == -1){
            $categoria = $ocategoria;
            $sql = "INSERT INTO categoria VALUES(0, :c)";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':c', $categoria);
            if($stmt->execute()){
                $catCadastrada = 1;
                $sql = "SELECT id_categoria FROM categoria WHERE nome_categoria = :n";
                $stmt = $con->connect()->prepare($sql);
                $stmt->bindParam(':n', $categoria);
                $stmt->execute();
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $categoria = $data['id_categoria'];
            } else {
                $catCadastrada = 0;
            }
        }
        
        if(isset($_FILES['imgArea'])){
            $notImage = $_FILES['imgArea']['name'] == "" ? true : false;
            $imgName = $_FILES['imgArea']['name'];
            $tmpName = $_FILES['imgArea']['tmp_name'];

            $imgExplode = explode('.', $imgName);
            $imgExt = end($imgExplode);

            $extensions = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];

            if(($imgName != "" && in_array($imgExt, $extensions) === true) || $notImage){
                $time = time();
                $newImageName = !$notImage ? $time.$imgName : "default.png";
                if(($imgName != "" && move_uploaded_file($tmpName, '../../front-end/img/areas/'.$newImageName)) || $notImage){
                    if(!isset($catCadastrada) || $catCadastrada == 1){
                        $sql = 'INSERT INTO area_cadastrada VALUES(0, :ic, :ip, :t, :d, :te, :i)';
                        $stmt = $con->connect()->prepare($sql);
                        $stmt->bindParam(':ic', $categoria);
                        $stmt->bindParam(':ip', $_SESSION['idusuario']);
                        $stmt->bindParam(':t', $titulo);
                        $stmt->bindParam(':d', $descricao);
                        $stmt->bindParam(':te', $tipoEstudo);
                        $stmt->bindParam(':i', $newImageName);
                        if($stmt->execute()){
                            $retorno['status'] = 1;
                            $retorno['msg'] = "Área cadastrada com sucesso!";
                        } else {
                            $retorno['status'] = 0;
                            $retorno['msg'] = "Falha ao cadastrar área";
                        }
                    } else{
                        $retorno['status'] = 0;
                        $retorno['msg'] = "Falha ao cadastrar categoria";
                    }
                } else {
                    $retorno['status'] = 0;
                    $retorno['msg'] = "Falha ao enviar imagem!";
                }
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Envie uma imagem no formato jpg, png ou jpeg!";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Envie uma imagem no formato jpg, png ou jpeg!";
        }

    } else if($tipo == "listarAreas"){
        if(isset($_POST['busca'])){  
            $sqlTipoEstudo = $tipoEstudo != "ambos" ? $tipoEstudo : "";
            $sqlCategoria = $categoria != "default" ? "area_cadastrada.id_categoria = $categoria" : "categoria.nome_categoria LIKE '%%'";
            $sqlCidade = $cidadeUf != "default" ? $cidadeUf : "";
        } else {
            $busca = "";
            $sqlTipoEstudo = "";
            $sqlCidade = "";
            $sqlCategoria = "categoria.nome_categoria LIKE '%%'";
        }
        $sqlSolicitacao = isset($_POST['areasSolicitadas']) ? "AND area_cadastrada.id_area IN $areasSolicitadas" : "";
        $con = new Connection();
        $sql = "SELECT categoria.nome_categoria, categoria.id_categoria, area_cadastrada.id_area, area_cadastrada.titulo, area_cadastrada.descricao, area_cadastrada.tipo_estudo, area_cadastrada.imagem 'imgArea', professor.id_professor, professor.nome, professor.imagem 'imgProfessor', professor.cidade FROM categoria INNER JOIN area_cadastrada ON categoria.id_categoria = area_cadastrada.id_categoria INNER JOIN professor ON area_cadastrada.id_professor = professor.id_professor WHERE (area_cadastrada.titulo LIKE '%$busca%' OR categoria.nome_categoria LIKE '%$busca%' OR area_cadastrada.tipo_estudo LIKE '%$busca%') AND area_cadastrada.tipo_estudo LIKE '%$sqlTipoEstudo%' AND $sqlCategoria AND professor.cidade LIKE '%$sqlCidade%' $sqlSolicitacao ORDER BY rand() LIMIT 10";
        $stmt = $con->connect()->prepare($sql);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($data){
            $retorno['status'] = 1;
            $retorno['areas'] = $data;
            $retorno['sql'] = $sql;
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = !isset($_POST['areasSolicitadas']) ? 'Não há áreas cadastradas nestas opções!' : 'Não há áreas cadastradas!';
            $retorno['sql'] = $sql;

        }
    } else if($tipo == "listarAreasProfessor"){
        $sqlUniqueArea = isset($idArea) ? "AND area_cadastrada.id_area = $idArea" : "";
        $idProfessor = isset($_POST['idProfessor']) ? $_POST['idProfessor'] : $_SESSION['idusuario'];
        $con = new Connection();
        $sql = "SELECT categoria.nome_categoria, categoria.id_categoria, area_cadastrada.id_area, area_cadastrada.titulo, area_cadastrada.descricao, area_cadastrada.tipo_estudo, area_cadastrada.imagem 'imgArea', professor.id_professor, professor.nome, professor.imagem 'imgProfessor' FROM categoria INNER JOIN area_cadastrada ON categoria.id_categoria = area_cadastrada.id_categoria INNER JOIN professor ON area_cadastrada.id_professor = professor.id_professor WHERE area_cadastrada.id_professor = :ip $sqlUniqueArea";
        $stmt = $con->connect()->prepare($sql);
        $stmt->bindParam(':ip', $idProfessor);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if($data){
            $retorno['status'] = 1;
            $retorno['areas'] = $data;
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = 'Não há áreas cadastradas!';
        }
    } else if($tipo == "alterar"){
        $con = new Connection();

        if($aCategoria == -1){
            $aCategoria = $aOcategoria;
            $sql = "INSERT INTO categoria VALUES(0, :c)";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':c', $aCategoria);
            if($stmt->execute()){
                $catCadastrada = 1;
                $sql = "SELECT id_categoria FROM categoria WHERE nome_categoria = :n";
                $stmt = $con->connect()->prepare($sql);
                $stmt->bindParam(':n', $aCategoria);
                $stmt->execute();
                $data = $stmt->fetch(PDO::FETCH_ASSOC);
                $aCategoria = $data['id_categoria'];
            } else {
                $catCadastrada = 0;
            }
        }
        
        if(isset($_FILES['aImgArea'])){
            $notImage = $_FILES['aImgArea']['name'] == "" ? true : false;
            $imgName = $_FILES['aImgArea']['name'];
            $tmpName = $_FILES['aImgArea']['tmp_name'];

            $imgExplode = explode('.', $imgName);
            $imgExt = end($imgExplode);

            $extensions = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG'];

            if(($imgName != "" && in_array($imgExt, $extensions) === true) || $notImage){
                $time = time();
                $newImageName = !$notImage ? $time.$imgName : "";
                if(($imgName != "" && move_uploaded_file($tmpName, '../../front-end/img/areas/'.$newImageName)) || $notImage){
                    if(!isset($catCadastrada) || $catCadastrada == 1){

                        if($newImageName == ""){
                            $sql = 'UPDATE area_cadastrada SET id_categoria = :ic, id_professor = :ip, titulo = :t, descricao = :d, tipo_estudo = :te WHERE id_area = :ia';
                            $stmt = $con->connect()->prepare($sql);

                        } else {
                            $sql = 'UPDATE area_cadastrada SET id_categoria = :ic, id_professor = :ip, titulo = :t, descricao = :d, tipo_estudo = :te, imagem = :i WHERE id_area = :ia';
                            $stmt = $con->connect()->prepare($sql);
                            $stmt->bindParam(':i', $newImageName);
                        }
                        
                        $stmt->bindParam(':ic', $aCategoria);
                        $stmt->bindParam(':ip', $_SESSION['idusuario']);
                        $stmt->bindParam(':t', $titulo);
                        $stmt->bindParam(':d', $aDescricao);
                        $stmt->bindParam(':te', $aTipoEstudo);
                        $stmt->bindParam(':ia', $idAlterarArea);
                        if($stmt->execute()){
                            $retorno['status'] = 1;
                            $retorno['msg'] = "Área atualiza com sucesso!";
                        } else {
                            $retorno['status'] = 0;
                            $retorno['msg'] = "Falha ao atualizar área";
                        }
                    } else{
                        $retorno['status'] = 0;
                        $retorno['msg'] = "Falha ao cadastrar categoria";
                    }
                } else {
                    $retorno['status'] = 0;
                    $retorno['msg'] = "Falha ao enviar imagem!";
                }
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Envie uma imagem no formato jpg, png ou jpeg!";
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Campos Vazios!";
        }
    } else if($tipo == "deletarArea"){
        if(isset($idArea)){
            $sql = "DELETE FROM area_cadastrada WHERE id_area = :id";
            $con = new Connection();
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':id', $idArea);
            if($stmt->execute()){
                $retorno['status'] = 1;
                $retorno['msg'] = 'Área deletada com sucesso!';
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = 'Falha ao excluir área!';
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = 'Área não selecionada!';
        }
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = 'Requisição inválida';
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>