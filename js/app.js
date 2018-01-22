var currentPage = 1;
var maxPage = 1;
var scrollDisable = false;
var vm;

function showMessage(msg) {
    $("#view_notice_msg").html(msg);
    $("#view_notice").modal("open");
}

//获取历史数据
function get_history_content(offset) {
    scrollDisable = true;
    $.ajax({
        type: "post",
        url: "api.php",
        async: true,
        dataType: "json",
        data: {
            type: "list",
            offset: offset
        },
        success: function(data, status) {
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
        type: "post",
        url: "api.php",
        async: true,
        data: {
            type: "search",
            word: word
        },
        dataType: "json",
        success: function(data, status) {
            scrollDisable = true; //禁止滑动加载
            currentPage = 1;
            vm.items = JSON.parse(data.data);
        }
    });
}

//通过id获取查询内容
function get_content_by_id(id) {
    //转到详情页面
    vm.url = "";
    vm.detail = "";
    vm.lang = "nohighlight";
    $("ul.tabs").tabs("select_tab", "view_detail");
    $.ajax({
        type: "post",
        url: "api.php",
        async: true,
        data: {
            type: "get",
            id: id
        },
        dataType: "json",
        success: function(data, status) {
            if(data.data === null) {
                return;
            }
            var u = window.location.protocol + "//" + window.location.host + "/?id=" + data.data.id;
            vm.onUpdateCode(u, data.data.language, data.data.content);
        }
    });
}

//添加新内容
function add_new_content(title, nick, language, content) {
    if(title === "" || nick === "" || language === "" || content === "") {
        return showMessage("填写内容不完整");
    }
    $.ajax({
        type: "post",
        url: "api.php",
        async: true,
        data: {
            type: "add",
            title: title,
            nick: nick,
            language: language,
            content: content
        },
        dataType: "json",
        success: function(data, status) {
            if(data.code === 1) {
                //转到详情页面
                vm.detail = "";
                vm.lang = "nohighlight";
                $("ul.tabs").tabs("select_tab", "view_detail");
                var u = window.location.protocol + "//" + window.location.host + "/?id=" + data.data;
                vm.onUpdateCode(u, language, content);
                //插入到历史记录开头
                vm.items.splice(0, 0, [{
                    id: data.data,
                    title: title,
                    nick: nick,
                    language: language,
                    content: content,
                    time: new Date().toJSON()
                }]);
            } else {
                showMessage(data.msg);
            }
        }
    });
}

//获取最大页数
function init_maxpage() {
    $.ajax({
        type: "post",
        url: "api.php",
        async: true,
        data: {
            type: "count"
        },
        dataType: "json",
        success: function(data, status) {
            maxPage = data.data / 20;
            if(maxPage === 0) {
                maxPage = 1;
            } else {
                maxPage = data.data % 20 == 0 ? maxPage : maxPage + 1;
            }
        }
    });
}

(function($) {
    $.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r != null) return unescape(r[2]);
        return null;
    };
})(jQuery);

$(document).ready(function() {
    new Vue({
        el: "#header",
        data: {
            word: "",
            //搜索词
            title: "Paste Code" //标题
        },
        methods: {
            onSearch: function(event) {
                if(this.word !== "") {
                    get_content_by_word(this.word);
                } else {
                    currentPage = 1;
                    get_history_content(currentPage);
                }
            }
        }
    });
    vm = new Vue({
        el: "#main",
        data: {
            title: "", //输入的标题
            nick: "", //输入的昵称
            content: "", //输入的内容
            url: "", //链接
            detail: "", //详情
            items: [], //当前页面的item集合
            lang: "nohighlight", //高亮语言
            languages: [
                "nohighlight",
                "apache",
                "bash",
                "css",
                "coffeescript",
                "diff",
                "html",
                "ini",
                "json",
                "java",
                "javascript",
                "makefile",
                "markdown",
                "nginx",
                "php",
                "perl",
                "python",
                "ruby",
                "sql",
                "shell ",
                "xml"
            ]
        },
        methods: {
            onAddCode: function(event) {
                add_new_content(
                    this.title,
                    this.nick,
                    $("#language").val(),
                    this.content
                );
            },
            onLoadMore: function(event) {
                if(maxPage > currentPage) {
                    get_history_content(currentPage);
                }
            },
            onGetById: function(id) {
                get_content_by_id(id);
            },
            onUpdateCode: function(url, lang, detail) {
                this.url = url;
                this.lang = lang;
                this.detail = detail;
                this.$nextTick(function() {
                    //dom更新了
                    $("#view_code_detail").html(detail);
                    hljs.highlightBlock(document.getElementById('view_code_detail'));
                });
            }
        },
        directives: {
            scroll: {
                bind: function(el, binding) {
                    window.addEventListener("scroll", function() {
                        if(
                            document.body.scrollTop + window.innerHeight >=
                            el.clientHeight
                        ) {
                            if(!scrollDisable) {
                                vm.onLoadMore();
                            }
                        }
                    });
                }
            }
        },
        created: function() {
            //动态添加的select option选项需要重新设置
            //$('select').material_select();
        }
    });
    $("select").material_select();
    $("ul.tabs").tabs({
        onShow: function(tab) {
            //不允许历史记录异步加载
            scrollDisable = tab.eq(0).attr("id") !== "view_history";
        }
    });
    $("ul.tabs").tabs("select_tab", "view_history");
    $("#view_notice").modal();
    $(document)
        .ajaxSend(function() {
            $(".progress").css("display", "block");
        })
        .ajaxComplete(function(response, status, xhr) {
            $(".progress").css("display", "none");
        })
        .ajaxError(function(event, xhr, options, exc) {
            showMessage(exc);
        });
    init_maxpage();
    get_history_content(currentPage);
    var id = $.getUrlParam("id");
    if(id !== null) {
        get_content_by_id(id);
    }
});