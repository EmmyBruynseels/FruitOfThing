<?php
//This file will setup a connection with the database
//Api's will use it for doing sql querries

// CORS fix
header("Access-Control-Allow-Origin: *");

// db credentials LOCAL
// define('DB_HOST', 'localhost');
// define('DB_USER', 'root');
// define('DB_PASS', '');
// define('DB_NAME', 'pcfruit');

// db credentials SINNERS
define('DB_HOST', 'db.sinners.be');
define('DB_USER', 'floriandh');
define('DB_PASS', 'yu0p7fOrDc3g');
define('DB_NAME', 'floriandh_pcfruit');

// connect with the database
function sql_connect() {
    // Create connection
    $conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    // check connection
    if(!$conn){
        die("Connection failed: " . mysqli_connect_error());
    }

    mysqli_set_charset($conn, "utf8");
    return $conn;
}
// this function will execute sql commands
function sql_query($connection, $query) {
	return mysqli_query($connection, $query);
}
function sql_fetch_row($result) {
	return mysqli_fetch_assoc($result);
}
$con = sql_connect();
?>
