function search(text) {
    var results = $("#search_results");
    var spinner = $("#search_spinner");
    var scroll = $("#results_scroll");
    var not_found = $("#search_not_found");
    scroll.tinyscrollbar();

    if (text) {
        spinner.show();
        $.ajax({
            url : "/data/search",
            data : {
                search : text
            },
            dataType : "json",
            success : function(response) {
                var list = $("<ul></ul>");
                var height;
                spinner.hide();
                console.debug(response);
                if (response.length) {
                    $.each(response, function() {
                        list.append("<li ref='" + this.url + "'>"
                                + "<img src='" + this.image + "' />"
                                + this.snippet
                                + "<div style='clear:both;'></div>" + "</li>");
                    });

                } else {
                    list = not_found.clone();
                }
                results.empty().html(list).slideDown(
                        function() {
                            height = Math.min(results.height() + 10, ($(window).height() - 100));

                            scroll.find(".viewport").animate({
                                "height" : height + "px"
                            }, function() {
                                scroll.tinyscrollbar_update();
                            });
                        });
            },
        });
    } else {
        scroll.find(".viewport").animate({
            "height" : "0"
        }, function() {
            results.slideUp(function() {
                $(this).html("");
                scroll.tinyscrollbar_update();
            });
        });
    }
}

$(document).ready(function() {
    var searchbar = $("#searchbar");
    var search_button = $("#search_button");
    var search_field = $("#search_field");
    var search_opened = false;
    var input = $("#search_field input");
    var keyup_timeout;
    var text;

    var open_search = function() {
        input.val("search");
        searchbar.animate({
            "left" : "0px"
        }, 500);

    };

    var close_search = function() {
        var results = $("#search_results");
        var scroll = $("#results_scroll");
        results.slideUp("slow").html("");
        searchbar.animate({
            "left" : "-300px"
        }, 500);

        scroll.find(".viewport").animate({
            "height" : "0"
        });
    };

    input.focus(function() {
        if ($(this).val() == "search") {
            $(this).val("");
        }
    });

    input.on("keyup", function() {
        if ($(this).val() != text) {
            text = $(this).val();
            if (keyup_timeout) {
                clearTimeout(keyup_timeout);
            }
            keyup_timeout = setTimeout(function() {
                search(text);
            }, 800);
        }
    });

    search_button.click(function() {
        if (search_opened) {
            close_search();
            search_opened = false;
        } else {
            open_search();
            search_opened = true;
        }
    });

    $("#search_results li").live('click', function() {
        history.pushState({
            from : "/",
            to : $(this).attr("ref")
        }, null, $(this).attr("ref"));
    });

});