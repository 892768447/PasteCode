<?php
    require_once 'database.php';
    header('Content-type:text/json');
    $result = array('code'=>0,'msg'=>'','data'=>null);
    if(!isset($_POST['type'])) {
        $result['msg'] = '参数有误';
        echo json_encode($result);
        exit();
    }
    if($_POST['type'] == 'add') {
        //添加内容
        $title = $_POST['title'];
        $user = $_POST['user'];
        $language = $_POST['language'];
        $content = $_POST['content'];
        if(empty($title)) {
            $result['msg'] = '标题不能为空';
            echo json_encode($result);
            exit();
        }
        if(empty($user)) {
            $result['msg'] = '昵称不能为空';
            echo json_encode($result);
            exit();
        }
        if(empty($language)) {
            $result['msg'] = '语言类型不能为空';
            echo json_encode($result);
            exit();
        }
        if(empty($content)) {
            $result['msg'] = '内容不能为空';
            echo json_encode($result);
            exit();
        }
        //插入到数据库
        $id = add_content($title, $user, $language, $content);
        $result['code'] = 1;
        $result['msg'] = '添加成功';
        $result['data'] = $id;
        echo json_encode($result);
        exit();
    } elseif($_POST['type'] == 'count') {
        $result['code'] = 1;
        $result['msg'] = '查询成功';
        $result['data'] = get_total_count();
        echo json_encode($result);
        exit();
    } elseif($_POST['type'] == 'get') {
        $result['code'] = 1;
        $result['msg'] = '查询成功';
        $result['data'] = get_content_by_id($_POST['id']);
        echo json_encode($result);
        exit();
    } elseif($_POST['type'] == 'search') {
        $result['code'] = 1;
        $result['msg'] = '查询成功';
        $result['data'] = json_encode(array_chunk(get_content_by_word($_POST['word']), 4));
        echo json_encode($result);
        exit();
    } else {
        //分页获取列表
        $offset = $_POST['offset'];
        try {
            $offset = intval($offset) - 1;
        } catch(Exception $e) {
            $offset = 0;
        }
        $result['code'] = 1;
        $result['msg'] = '查询成功';
        $result['data'] = json_encode(array_chunk(get_contents($offset), 4));
        echo json_encode($result);
        exit();
    }
?>