<?php
require_once 'rb.php';
ini_set('date.timezone', 'Asia/Shanghai');
//初始化数据库
R::setup('sqlite:./#data#.db');
R::setAutoResolve(TRUE);

//关闭连接
function db_uninit() {
    R::close();
}

//添加内容片段
function add_content($title, $nick, $language, $content) {
    //table
    $item = R::dispense('contents');
    $item->title = $title;
    $item->nick = $nick;
    $item->language = $language;
    $item->content = $content;
    $item->time = date('Y-m-d H:i:s');
    //返回id
    return R::store($item);
}

//根据ID查找
function get_content_by_id($id) {
    return R::findOne('contents', ' id = ? ', [$id]);
}

//like查询
function get_content_by_word($word) {
    return R::getAll('select id, title, nick, language, substr(content, 0, 250) content, time from contents where title like ? or content like ? order by contents.time desc;', ['%'.$word.'%', '%'.$word.'%']);
}

//分页获取数据
function get_contents($offset, $limit=20) {
    return R::getAll('select id, title, nick, language, substr(content, 0, 250) content, time from contents order by contents.time desc limit ? offset ?;', [$limit, $offset * $limit]);
    //return R::findAll('contents', 'order by contents.time desc limit ? offset ?', [$limit, $offset * $limit]);
}

//统计条数
function get_total_count() {
    return R::count('contents');
}
?>