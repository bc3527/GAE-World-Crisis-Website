var current_dialog;

function get_cube_prefs(target, transition) {
    return {
        'transition' : transition,
        'controls' : null,
        'onInit' : function() {
            var self = this.slider;
            var spin = function() {
                self.prev();
                if (!self.stop) {
                    setTimeout(spin, 100);
                }
            };

            target.on('mouseover', function() {
                self.stop = false;
                spin();
            });

            target.on('mouseout', function() {
                self.stop = true;
            });
        },
        'afterChange' : function() {
            var self = this.slider;
            if (self.stop) {
                self.transition(0);
            }
        }
    };
};

/**
 * initializes the dialog
 */
function init_dialog(id) {

    var width = 800;
    var duration = 800;
    var widget;

    return $(id).dialog(
            {
                autoOpen : false,
                width : width,
                resizable : false,
                modal : true,
                draggable : false,
                position : {
                    my : "top",
                    at : "top",
                    of : window
                },
                create : function() {
                    window_width = $(document).width();
                    widget = $(this).dialog('widget');
                    widget.find('.ui-dialog-titlebar').remove();

                },
                open : function() {
                    if (current_dialog !== undefined) {
                        current_dialog.dialog('close');
                    }
                    var other = $(this);

                    var scrollPosition = [
                            self.pageXOffset
                                    || document.documentElement.scrollLeft
                                    || document.body.scrollLeft,
                            self.pageYOffset
                                    || document.documentElement.scrollTop
                                    || document.body.scrollTop ];

                    var html = jQuery('html');

                    html.data('scroll-position', scrollPosition);
                    html.data('previous-position', html.css('position'));

                    $("#wrapper").css({
                        "position" : "fixed",
                        "top" : -scrollPosition[1] + "px",
                    });

                    html.css({
                        "position" : "absolute",
                    });
                    window.scrollTo(scrollPosition[0], 0);

                    widget.css({
                        "left" : ($(document).width() + width),
                        "top" : 0
                    });

                    widget.animate({
                        "left" : "-=" + ($(document).width() + width) / 2,
                    }, duration);

                    $('.ui-widget-overlay').click(function() {
                        other.dialog('close');
                        history.pushState({
                            from : window.location.pathname,
                            to : "/"
                        }, null, "/");
                    });
                    current_dialog = other;
                },
                close : function() {
                    var html = jQuery('html');
                    var scrollPosition = html.data('scroll-position');

                    html.css({
                        'position' : html.data('previous-position'),
                        'top' : 0
                    });
                    $("#wrapper").css({
                        "position" : "absolute",
                        "top" : 0
                    });

                    window.scrollTo(scrollPosition[0], scrollPosition[1]);

                    current_dialog = undefined;
                    $("#temp_dialog").remove();
                },
            });

}

/**
 * a simple function that centers the content of a page
 */
function center_wrapper() {
    $("#wrapper").css("margin-left",
            ($(document).width() - $("#wrapper").width()) / 2);
}

function load_article(url) {
    var art = init_dialog('<div id="temp_dialog"></div>');
    art.append($("#loading_spinner").clone());
    art.load(url, function(){
        $("button").button().addClass("btn");
    });
    return art;
}

function init_bg_changer() {
    var images = [ 'bg_1.png', 'bg_2.png', 'bg_3.png', 'bg_4.png', 'bg_5.png' ];
    var i = 1;
    var duration = 7000;
    var trans_dur = 1500;
    var bgr = $('.tile_bg');
    var bgr_2 = $('.tile_bg_2');
    var img;

    setInterval(function() {
        bgr.show();
        img = '/assets/images/' + images[i];
        bgr_2.attr("src", img);

        bgr.fadeOut(trans_dur, function() {
            bgr.attr("src", img);
            i++;
            if (i >= images.length) {
                i = 0;
            }
        });
    }, duration);
}

/**
 * main
 */
$(document).ready(function() {
    center_wrapper();
    $("button").button().addClass("btn");

    // ---------------------init background changer-------------
    init_bg_changer();

    // ---------------------init dialogs------------------------
    var utils_dialog = init_dialog('#utilities');
    var about_us_dialog = init_dialog("#about_us");

    // --------------------init boxes----------------------------
    var box_crisis = $('#box_crisis .rs-slider');
    box_crisis.refineSlide(get_cube_prefs(box_crisis, 'cubeH'));
    box_crisis.find("li").click(function() {
        history.pushState({
            from : "/",
            to : "/crises"
        }, null, "/crises");
    });

    var box_utility = $('#box_utility .rs-slider');
    box_utility.refineSlide(get_cube_prefs(box_utility, 'cubeV'));
    box_utility.find("li").click(function() {
        history.pushState({
            from : "/",
            to : "/utility"
        }, null, "/utility");
    });

    var box_people = $('#box_people .rs-slider');
    box_people.refineSlide(get_cube_prefs(box_people, 'cubeV'));
    box_people.find("li").click(function() {
        history.pushState({
            from : "/",
            to : "/people"
        }, null, "/people");
    });

    var box_org = $('#box_org .rs-slider');
    box_org.refineSlide(get_cube_prefs(box_org, 'cubeH'));
    box_org.click(function() {
        history.pushState({
            from : "/",
            to : "/organizations"
        }, null, "/organizations");
    });

    var box_about_us = $('#box_about_us .rs-slider');
    box_about_us.refineSlide(get_cube_prefs(box_about_us, 'cubeV'));
    box_about_us.click(function() {
        history.pushState({
            from : "/",
            to : "/about_us"
        }, null, "/about_us");
        return false;
    });

    // ---------------read full article buttons------------------
    $('.read_full').live("click", function() {
        history.pushState({
            from : document.location.pathname,
            to : $(this).val()
        }, null, $(this).val());
        return false;
    });

    // ----------------window events----------------------------
    $(window).on("resize", center_wrapper);

    (function(history) {
        var pushState = history.pushState;
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") {
                history.onpushstate({
                    state : state
                });
            }
            return pushState.apply(history, arguments);
        }
    })(window.history);

    var navigate = function(hist) {
        var to, from, dialog;
        var path = document.location.pathname;

        if (hist.state == null) {
            if (path == "/") {
                return;
            } else {
                to = path;
                from = null;
            }
        } else {
            to = hist.state.to;
            from = hist.state.from;
        }

        switch (to) {
        case "/":
            if (current_dialog !== undefined) {
                current_dialog.dialog("close");
            }
            break;
        case "/people":
            dialog = load_article("/data/people");
            break;
        case "/crises":
            dialog = load_article("/data/crises");
            break;
        case "/organizations":
            dialog = load_article("/data/organizations");
            break;
        case "/utility":
            dialog = utils_dialog;
            break;
        case "/about_us":
            // dialog = about_us_dialog;
            dialog = load_article("/about");
            break;
        case "/import":
            dialog = load_article("/data/import");
            break;
        }

        if (!dialog && to.indexOf("/article") === 0) {
            dialog = load_article("/data" + to);
        }

        if (dialog) {
            if (current_dialog) {
                current_dialog.dialog('widget').animate({
                    "left" : "-=" + ($(document).width() + 800) / 2,
                }, 800, function() {
                    dialog.dialog("open");
                });
            } else {
                dialog.dialog("open");
            }
        }
    };

    // load appropriate content when navigating from url bar or
    // back/forward buttons
    history.onpushstate = navigate;

    window.onpopstate = function(hist) {
        navigate(hist);
    };
});