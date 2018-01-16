<?php
    require_once 'database.php';
//  echo json_encode(array_chunk(get_contents(10,1), 4));
    echo json_encode(array_chunk(get_content_by_word('php'), 4));
?>