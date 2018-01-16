//获取历史数据
function get_history_content(offset) {
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'list',
            offset: offset
        },
        success: function(data, status) {
            Materialize.toast(data.msg, 2000);
            $('#view_history_content').html(template('tpl_history_content', {
                rows: JSON.parse(data.data)
            }));
            $('ul.tabs').tabs('select_tab', 'view_history');
            //绑定动态生成的html事件
            $('div .item-panel').each(function(i, block) {
                $(this).click(function() {
                    //切换到详情标签
                    $('ul.tabs').tabs('select_tab', 'view_detail');
                    get_content_by_id($(this).data('id'))
                    //获取内容显示到第三个标签（文字太多，卡死）
                    //                  $('#view_code_detail').html($(this).find('p').html());
                    //                  $('#view_code_detail').attr('class', $(this).find('a').html());
                    //                  $('code').each(function(i, block) {
                    //                      hljs.highlightBlock(block);
                    //                      $(this).html("<ul><li>" + $(this).html().replace(/\n/g, "\n</li><li>") + "\n</li></ul>");
                    //                  });
                });
            });
        },
        error: function(xhr, status, err) {
            console.log("get_history_content error " + err);
            $('#view_notice_msg').html(status);
            $('#view_notice').modal('open');
        }
    });
}

//搜索
function get_content_by_word(word) {
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'search',
            word: word
        },
        dataType: 'json',
        success: function(data, status) {
            Materialize.toast(data.msg, 2000);
            $('#view_history_content').html(template('tpl_history_content', {
                rows: JSON.parse(data.data)
            }));
            $('ul.tabs').tabs('select_tab', 'view_history');
            //绑定动态生成的html事件
            $('div .item-panel').each(function(i, block) {
                $(this).click(function() {
                    //切换到详情标签
                    $('ul.tabs').tabs('select_tab', 'view_detail');
                    get_content_by_id($(this).data('id'))
                });
            });
        },
        error: function(xhr, status, err) {
            console.log("get_content_by_word error " + err);
            $('#view_notice_msg').html(status);
            $('#view_notice').modal('open');
        }
    });
}

//通过id获取查询内容
function get_content_by_id(id) {
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'get',
            id: id
        },
        dataType: 'json',
        success: function(data, status) {
            Materialize.toast(data.msg, 2000);
            $('#view_code_detail').html(data.data.content);
            $('#view_code_detail').attr('class', data.data.language);
            $('code').each(function(i, block) {
                hljs.highlightBlock(block);
                $(this).html("<ul><li>" + $(this).html().replace(/\n/g, "\n</li><li>") + "\n</li></ul>");
            });
        },
        error: function(xhr, status, err) {
            console.log("get_content_by_id error " + err);
            $('#view_notice_msg').html(status);
            $('#view_notice').modal('open');
        }
    });
}

//添加新内容
function add_new_content(title, user, language, content) {
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'add',
            title: title,
            user: user,
            language: language,
            content: content
        },
        dataType: 'json',
        success: function(data, status) {
            Materialize.toast(data.msg, 2000);
            if(data.code === 1) {
                get_history_content(1);
            }
        },
        error: function(xhr, status, err) {
            console.log("add_new_content error " + err);
            $('#view_notice_msg').html(status);
            $('#view_notice').modal('open');
        }
    });
}

//初始化分页
function init_pagination() {
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'count'
        },
        dataType: 'json',
        success: function(data, status) {
            Materialize.toast(data.msg, 2000);
            var lastPage = data.data / 20;
            if(lastPage === 0) {
                return;
            }
            $('#view_pagination').materializePagination({
                align: 'center',
                lastPage: data.data % 20 == 0 ? lastPage : lastPage + 1,
                firstPage: 1,
                useUrlParameter: false,
                onClickCallback: function(offset) {
                    get_history_content(offset);
                }
            });
        },
        error: function(xhr, status, err) {
            $('#view_notice_msg').html(status);
            $('#view_notice').modal('open');
        }
    });
}

$(document).ready(function() {
    $('select').material_select();
    $('#view_notice').modal();
    init_pagination();
    get_history_content(1);
    $('#search_form').submit(function(e) {
        var word = $('#word').val().trim();
        if(word !== '') {
            get_content_by_word(word);
        }
        return false;
    });
    $('#new_form').submit(function(e) {
        //判断标题
        var title = $('#title').val().trim();
        if(title === '') {
            $('#title').addClass('invalid');
            $('#title').focus();
            return false;
        }
        $('#title').removeClass('invalid');
        $('#title').addClass('valid');
        //console.log(title);
        //判断昵称
        var user = $('#user').val().trim();
        if(user === '') {
            $('#user').addClass('invalid');
            $('#user').focus();
            return false;
        }
        $('#user').removeClass('invalid');
        $('#user').addClass('valid');
        //console.log(user);
        //类型
        var language = $('#language').val();
        //console.log(language);
        //判断内容
        var content = $('#content').val().trim();
        if(content === '') {
            $('#content').addClass('invalid');
            $('#content').focus();
            return false;
        }
        $('#content').removeClass('invalid');
        $('#content').addClass('valid');
        //console.log(content);
        //提交
        add_new_content(title, user, language, content);
        return false;
    });
});