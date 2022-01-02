<?php

require_once "../Model/Connection.php";
session_start();
$retorno = array();
extract($_POST);

if(isset($_POST['tipo'])){
    if($tipo == "cadastrar"){
        if(isset($nome, $email, $senha, $tipousuario)){
            if(strlen($nome) >= 4){
                if(filter_var($email, FILTER_VALIDATE_EMAIL)){
                    $con = new Connection();
                    $sql1 = "SELECT COUNT(*) 'qtd', id_usuario FROM usuario WHERE email = :e";
                    $stmt1 = $con->connect()->prepare($sql1);
                    $stmt1->bindParam(':e', $email);
                    $stmt1->execute();
                    $res1 = $stmt1->fetch(PDO::FETCH_ASSOC);
        
                    $sql2 = "SELECT COUNT(*) 'qtd', id_professor FROM professor WHERE email = :e";
                    $stmt2 = $con->connect()->prepare($sql2);
                    $stmt2->bindParam(':e', $email);
                    $stmt2->execute();
                    $res2 = $stmt2->fetch(PDO::FETCH_ASSOC);
        
                    if(!($res1['qtd'] > 0 || $res2['qtd'] > 0)){
                        $con = new Connection();
                        $defaultImg = 'default.png';
                        if($tipousuario == 'aluno'){
                            $sql = 'INSERT INTO usuario (id_usuario, nome, email, senha, imagem) VALUES(0, :n, :e, sha1(:s), :i)';
                        } else if($tipousuario == 'professor'){
                            $sql = 'INSERT INTO professor (id_professor, nome, email, senha, imagem) VALUES(0, :n, :e, sha1(:s), :i)';
                        }
                        $stmt = $con->connect()->prepare($sql);
                        $stmt->bindParam(':n', $nome);
                        $stmt->bindParam(':e', $email);
                        $stmt->bindParam(':s', $senha);
                        $stmt->bindParam(':i', $defaultImg);
                        if($stmt->execute()){
                            $retorno['status'] = 1;
                            $retorno['msg'] = "Cadastro feito com sucesso!";
                        } else{
                            $retorno['status'] = 0;
                            $retorno['msg'] = "Cadastro inválido!";
                        }
                    } else {
                        $retorno['status'] = 0;
                        $retorno['msg'] = 'Este email já existe!';
                    }
                } else {
                    $retorno['status'] = 0;
                    $retorno['msg'] = 'Digite um email válido!';
                }    
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = 'Digite um nome com pelo menos 4 carácteres';
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Campos vazios!";
        }
        
    } else if($tipo == "login"){
        $con = new Connection();
        $sql = "SELECT COUNT(*) 'qtd', id_usuario FROM usuario WHERE email = :e AND senha = sha1(:s)";
        $stmt = $con->connect()->prepare($sql);
        $stmt->bindParam(':e', $email);
        $stmt->bindParam(':s', $senha);
        $stmt->execute();
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        if($res['qtd'] == 1){
            $_SESSION['idusuario'] = $res['id_usuario'];
            if(isset($_SESSION['idusuario'])){
                $retorno['status'] = 1;
                $retorno['tipousuario'] = 'aluno';
                $_SESSION['tipousuario'] = "aluno";
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Não foi possível iniciar sessão!";
            }
        } else if($res['qtd'] == 0){
            $con = new Connection();
            $sql = "SELECT COUNT(*) 'qtd', id_professor FROM professor WHERE email = :e AND senha = sha1(:s)";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':e', $email);
            $stmt->bindParam(':s', $senha);
            $stmt->execute();
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            if($res['qtd'] == 1){
                $_SESSION['idusuario'] = $res['id_professor'];
                if(isset($_SESSION['idusuario'])){
                    $retorno['status'] = 1;
                    $retorno['tipousuario'] = 'professor';
                    $_SESSION['tipousuario'] = "professor";
                } else {
                    $retorno['status'] = 0;
                    $retorno['msg'] = "Não foi possível iniciar sessão!";
                }
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = "Email ou senha inválidos!";
            }
        } else{
            $retorno['status'] = 0;
            $retorno['msg'] = "Login inválido!";
        }
    } else if($tipo == 'alterar'){
        if(isset($nome, $email, $_SESSION['tipousuario'], $_SESSION['idusuario'])){
            if(strlen($nome) >= 4){
                if(filter_var($email, FILTER_VALIDATE_EMAIL)){
                    $con = new Connection();
                    $sql1 = "SELECT COUNT(*) 'qtd', id_usuario FROM usuario WHERE email = :e AND id_usuario <> :id";
                    $stmt1 = $con->connect()->prepare($sql1);
                    $stmt1->bindParam(':e', $email);
                    $stmt1->bindParam(':id', $_SESSION['idusuario']);
                    $stmt1->execute();
                    $res1 = $stmt1->fetch(PDO::FETCH_ASSOC);
        
                    $sql2 = "SELECT COUNT(*) 'qtd', id_professor FROM professor WHERE email = :e AND id_professor <> :id";
                    $stmt2 = $con->connect()->prepare($sql2);
                    $stmt2->bindParam(':e', $email);
                    $stmt2->bindParam(':id', $_SESSION['idusuario']);
                    $stmt2->execute();
                    $res2 = $stmt2->fetch(PDO::FETCH_ASSOC);
        
                    if(!($res1['qtd'] > 0 || $res2['qtd'] > 0)){
                        if(isset($_FILES['imgPerfil']) && $_FILES['imgPerfil']['name'] != ""){
                            $con = new Connection();
                            $tipousuario = $_SESSION['tipousuario'];
    
                            $imgName = $_FILES['imgPerfil']['name'];
                            $tmpName = $_FILES['imgPerfil']['tmp_name'];

                            $imgExplode = explode('.', $imgName);
                            $imgExt = end($imgExplode);

                            $extensions = ['png','jpg','jpeg','PNG','JPG','JPEG'];

                            if(in_array($imgExt,$extensions) === true){
                                $time = time();
                                $newImageName = $time.$imgName;

                                if(move_uploaded_file($tmpName, "../../front-end/img/users/".$newImageName)){

                                    $con = new Connection();

                                    if($tipousuario == 'aluno'){
                                        $sql = 'UPDATE usuario SET nome = :n, imagem = :i, email = :e, cep = :c, logradouro = :l, numLogradouro = :nl, bairro = :b, cidade = :cd WHERE id_usuario = :id';
                                    } else if($tipousuario == 'professor'){
                                        $sql = 'UPDATE professor SET nome = :n, imagem = :i, email = :e, cep = :c, logradouro = :l, numLogradouro = :nl, bairro = :b, cidade = :cd WHERE id_professor = :id';
                                    }
                                    $stmt = $con->connect()->prepare($sql);
                                    $stmt->bindParam(':n', $nome);
                                    $stmt->bindParam(':i', $newImageName);
                                    $stmt->bindParam(':e', $email);
                                    $stmt->bindParam(':c', $cep);
                                    $stmt->bindParam(':l', $logradouro);
                                    $stmt->bindValue(':nl', $numLogradouro);
                                    $stmt->bindParam(':b', $bairro);
                                    $stmt->bindParam(':cd', $cidade);
                                    $stmt->bindParam(':id', $_SESSION['idusuario']);
                                    if($stmt->execute()){
                                        $retorno['status'] = 1;
                                        $retorno['msg'] = "Alteração feita com sucesso!";
                                    } else{
                                        $retorno['status'] = 0;
                                        $retorno['msg'] = "Erro ao salvar dados!";
                                    }

                                } else {
                                    $retorno['status'] = 0;
                                    $retorno['msg'] = "Erro ao fazer upload de imagem!";
                                }
                                
                            } else {
                                $retorno['status'] = 0;
                                $retorno['msg'] = "Selecione uma imagem em .png .jpg ou .jpeg!";
                            }
                            
                        } else {
                            $con = new Connection();
                            $tipousuario = $_SESSION['tipousuario'];

                            if($tipousuario == 'aluno'){
                                $sql = 'UPDATE usuario SET nome = :n, email = :e, cep = :c, logradouro = :l, numLogradouro = :nl, bairro = :b, cidade = :cd WHERE id_usuario = :id';
                            } else if($tipousuario == 'professor'){
                                $sql = 'UPDATE professor SET nome = :n, email = :e, cep = :c, logradouro = :l, numLogradouro = :nl, bairro = :b, cidade = :cd WHERE id_professor = :id';
                            }
                            $stmt = $con->connect()->prepare($sql);
                            $stmt->bindParam(':n', $nome);
                            $stmt->bindParam(':e', $email);
                            $stmt->bindParam(':c', $cep);
                            $stmt->bindParam(':l', $logradouro);
                            $stmt->bindValue(':nl', $numLogradouro);
                            $stmt->bindParam(':b', $bairro);
                            $stmt->bindParam(':cd', $cidade);
                            $stmt->bindParam(':id', $_SESSION['idusuario']);
                            if($stmt->execute()){
                                $retorno['status'] = 1;
                                $retorno['msg'] = "Alteração feita com sucesso!";
                            } else{
                                $retorno['status'] = 0;
                                $retorno['msg'] = "Erro ao salvar dados";
                            }
                        }
                        
                    } else {
                        $retorno['status'] = 0;
                        $retorno['msg'] = 'Este email já existe!';
                    }
                } else {
                    $retorno['status'] = 0;
                    $retorno['msg'] = 'Digite um email válido!';
                }    
            } else {
                $retorno['status'] = 0;
                $retorno['msg'] = 'Digite um nome com pelo menos 4 carácteres';
            }
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Campos vazios!";
        }
    } else if($tipo == "verificaLogin"){
        if(isset($_SESSION['idusuario'], $_SESSION['tipousuario'])){
            $retorno['status'] = 1;
            $retorno['id'] = $_SESSION['idusuario'];
            $retorno['tipousuario'] = $_SESSION['tipousuario'];
        } else {
            $retorno['status'] = 0;
        }
    } else if($tipo == "deslogar"){
        if(isset($_SESSION['idusuario'], $_SESSION['tipousuario'])){
            session_destroy();
            $retorno['status'] = 1;
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = "Sessão inexistente!";
        }
    } else if($tipo == "retornaUsuario" && isset($_SESSION['idusuario'], $_SESSION['tipousuario'])){
        if($_SESSION['tipousuario'] == "aluno"){
            $con = new Connection();
            $sql = "SELECT id_usuario, nome, imagem, email, cep, logradouro, numLogradouro, bairro, cidade FROM usuario WHERE id_usuario = :id";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':id', $_SESSION['idusuario']);
            $stmt->execute();
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            $retorno['status'] = 1;
            $retorno['usuario'] = $res;
        } else {
            $con = new Connection();
            $sql = "SELECT id_professor, nome, imagem, email, cep, logradouro, numLogradouro, bairro, cidade FROM professor WHERE id_professor = :id";
            $stmt = $con->connect()->prepare($sql);
            $stmt->bindParam(':id', $_SESSION['idusuario']);
            $stmt->execute();
            $res = $stmt->fetch(PDO::FETCH_OBJ);
            $retorno['status'] = 1;
            $retorno['usuario'] = $res;
        }
    } else if($tipo == 'consultaEndereco' && isset($cep)){
        define('URL_VIACEP', "https://viacep.com.br/ws/");
        define('METHOD', 'json');
        $cep = str_replace('-','',$cep);
        $url = URL_VIACEP.$cep.'/'.METHOD;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $endereco = curl_exec($ch);
        $endereco = json_decode($endereco);
        curl_close($ch);
        if(!isset($endereco->erro)){
            $retorno['status'] = 1;
            $retorno['endereco'] = $endereco;
        } else {
            $retorno['status'] = 0;
            $retorno['msg'] = 'CEP inválido!';
        }
    }
} else {
    $retorno['status'] = 0;
    $retorno['msg'] = "Requisição inválida!";
}

echo json_encode($retorno, JSON_UNESCAPED_UNICODE);

?>