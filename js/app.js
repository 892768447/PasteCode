//获取最近记录
function get_recent() {
    $.ajax({
        url: 'http://codepad.org/recent',
        type: 'get',
        async: true,
        dataType: 'html',
        success: function(data, status) {
            console.log(data);
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
    get_recent();
    $('#search_form').submit(function(e) {
        var word = $('#word').val().trim();
        if (word !== '') {
            get_content_by_word(word);
        }
        return false;
    });
    $('#new_form').submit(function(e) {
        //判断标题
        var title = $('#title').val().trim();
        if (title === '') {
            $('#title').addClass('invalid');
            $('#title').focus();
            return false;
        }
        $('#title').removeClass('invalid');
        $('#title').addClass('valid');
        //console.log(title);
        //判断昵称
        var user = $('#user').val().trim();
        if (user === '') {
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
        if (content === '') {
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