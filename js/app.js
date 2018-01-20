var currentPage = 1;
var maxPage = 1;
var scrollDisable = false;
var vm;

function showMessage(msg) {
    $('#view_notice_msg').html(msg);
    $('#view_notice').modal('open');
}

//获取历史数据
function get_history_content(offset) {
    scrollDisable = true;
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        dataType: 'json',
        data: {
            type: 'list',
            offset: offset
        },
        success: function(data, status) {
            console.log(JSON.parse(data.data));
            currentPage += 1;
            vm.items.push.apply(vm.items, JSON.parse(data.data));
        },
        complete: function(xhr, status) {
            scrollDisable = false;
        },
        error: function(xhr, status, err) {
            currentPage -= 1;
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
            console.log(JSON.parse(data.data));
            currentPage = 0;
            vm.items = JSON.parse(data.data);
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
            console.log(data);
            //转到详情页面
            $('ul.tabs').tabs('select_tab', 'view_detail');
        }
    });
}

//添加新内容
function add_new_content(title, nick, language, content) {
    if (title === '' || nick === '' || language === '' || content === '') {
        return showMessage('填写内容不完整');
    }
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'add',
            title: title,
            nick: nick,
            language: language,
            content: content
        },
        dataType: 'json',
        success: function(data, status) {
            if (data.code === 1) {
                //显示到详情页面
            } else {
                showMessage(data.msg);
            }
        }
    });
}

//获取最大页数
function init_maxpage() {
    $.ajax({
        type: 'post',
        url: 'api.php',
        async: true,
        data: {
            type: 'count'
        },
        dataType: 'json',
        success: function(data, status) {
            maxPage = data.data / 20;
            if (maxPage === 0) {
                maxPage = 1;
            } else {
                maxPage = data.data % 20 == 0 ? maxPage: maxPage + 1
            }
            console.log(Math.floor(maxPage));
        }
    });
}

(function($) {
    $.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
})(jQuery);

$(document).ready(function() {
    new Vue({
        el: "#header",
        data: {
            word: '',
            //搜索词
            title: 'Paste Code' //标题
        },
        methods: {
            onSearch: function(event) {
                if (this.word !== '') {
                    get_content_by_word(this.word);
                } else {
                    currentPage = 1;
                    get_history_content(currentPage);
                }
            }
        }
    });
    vm = new Vue({
        el: '#main',
        data: {
            title: '',
            //输入的标题
            nick: '',
            //输入的昵称
            content: '',
            //输入的内容
            detail: '',
            //详情
            items: [] //当前页面的item集合
        },
        methods: {
            onAddCode: function(event) {
                add_new_content(this.title, this.nick, $('#language').val(), this.content);
            },
            onLoadMore: function(event) {
                if (maxPage > currentPage) {
                    get_history_content(currentPage);
                }
            },
            onGetById: function(id) {
                get_content_by_id(id);
            }
        },
        directives: {
            scroll: {
                bind: function(el, binding) {
                    window.addEventListener('scroll',
                    function() {
                        if (document.body.scrollTop + window.innerHeight >= el.clientHeight) {
                            if (!scrollDisable) {
                                vm.onLoadMore();
                            }
                        }
                    });
                }
            }
        }
    });
    $('select').material_select();
    $('#view_notice').modal();
    $(document).ajaxSend(function() {
        $('.progress').css('display', 'block');
    }).ajaxComplete(function(response, status, xhr) {
        $('.progress').css('display', 'none');
    }).ajaxError(function(event, xhr, options, exc) {
        showMessage(exc);
    });
    init_maxpage();
    get_history_content(currentPage);
});