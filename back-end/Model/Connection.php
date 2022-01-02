<?php

    class Connection{
        private $host;
        private $dbname;
        private $user;
        private $password;

        function __construct()
        {
            $this->host = 'localhost';
            $this->dbname = "bd";
            $this->user = 'root';
            $this->password = "";
        }

        function connect(){
            $c = new PDO('mysql:host='.$this->host.';dbname='.$this->dbname,
            $this->user,
            $this->password,
            array(PDO::MYSQL_ATTR_INIT_COMMAND => "
                SET NAMES utf8"));
            return $c;
        }
    }

?>