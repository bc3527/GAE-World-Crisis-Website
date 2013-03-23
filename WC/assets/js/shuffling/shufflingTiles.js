/**
 * Shuffling Tiles - JQuery Plugin Shuffling tiles is both a menu and a metro
 * inspired content grid. It features fluid tiles and animated transitions that
 * present any content in a fun, compact way. For sale on CodeCanyon.net
 * 
 * @package shufflingTiles
 * @author Patrick Jaoko - http://www.pjtops.com/app/shufflingTiles
 * @copyright Patrick Jaoko �2012
 * @version 1.0.2
 * 
 */
;
(function(b) {
    var a = {
        animateTiles : function(m) {
            var q, n, l, r, k, p, c, h, g, f, s, o, d, e;
            if (!m) {
                return;
            }
            r = m.node;
            c = m.grid;
            h = m.animation;
            g = m.settings;
            h.stepProgress += 1;
            if (h.stepProgress === c.classIds.length) {
                h.stepProgress = 0;
                if (h.status === "openingTile") {
                    h.step += 1;
                    if (h.step === h.steps) {
                        c.status = "openTile";
                        h.status = "off";
                        h.stepProgress = -1;
                        r.trigger("shuffleStop", a.setEvent(c));
                        a.onTileOpen(c.selectedTile, m);
                        return;
                    }
                } else {
                    if (h.status === "closingTile") {
                        h.step -= 1;
                        if (h.step === -1) {
                            c.status = "home";
                            h.status = "off";
                            h.stepProgress = -1;
                            r.trigger("shuffleStop", a.setEvent(c));
                            if (c.selectedTile) {
                                b("." + c.selectedTile, r).click();
                            } else {
                                if (c.openTile) {
                                    b("." + c.openTile, r).click();
                                } else {
                                    if (g.deepLinking) {
                                        document.location.hash = r.attr("id")
                                                + "-home";
                                    }
                                    r.removeClass("animating");
                                }
                            }
                            return;
                        }
                    }
                }
            } else {
                if (h.status !== "off") {
                    return;
                }
            }
            if (h.status === "off") {
                if (c.status === "home") {
                    a.setAnimation(b(this), m);
                    h.step = 0;
                    h.status = "openingTile";
                    if (c.columns === 2 && c.classIds.length <= 4) {
                        r.animate({
                            height : "+=" + c.tileHeight
                        }, g.openSpeed / 4);
                    }
                } else {
                    if (c.status === "openTile") {
                        h.step = h.steps - 1;
                        h.status = "closingTile";
                        a.onTileClose(c.selectedTile, m);
                        if (c.columns === 2 && c.classIds.length <= 4) {
                            r.animate({
                                height : "-=" + c.tileHeight
                            }, g.closeSpeed / 4);
                        }
                    }
                }
                q = b(this).data("classId");
                if (b.inArray(q, c.classIds) === -1) {
                    q = false;
                }
                c.selectedTile = q;
                r.trigger("shuffleStart", a.setEvent(c));
            }
            f = function() {
                a.animateTiles
                        .apply(b(this), [ b(this).parent().data("data") ]);
            };
            p = g.animationEasing;
            k = (h.status === "openingTile") ? g.openSpeed / h.steps
                    : g.closeSpeed / h.steps;
            for (n = 0; n < c.tiles.length; n += 1) {
                s = c.tiles[n];
                for (l = 0; l < s.length; l += 1) {
                    d = s[l].animation;
                    o = (h.status === "openingTile") ? d[h.step][0]
                            : d[h.step][1];
                    if (o) {
                        s[l].node.animate(o, k, p, f);
                        e = (h.status === "openingTile") ? d[h.step][2]
                                : d[h.step][3];
                        a.animateTileContent(s[l].node, e, k, g);
                    } else {
                        h.stepProgress += 1;
                    }
                }
            }
        },
        animateTileContent : function(e, f, g, d) {
            var c = e.data("data").contentStyles;
            b.each(c, function(j, l) {
                var i, h, k, m;
                if (j === false || !f || !l[f]) {
                    return true;
                }
                i = l.node;
                m = l[f];
                h = {};
                k = {};
                b.each(m, function(o, n) {
                    if (isNaN(n)) {
                        k[o] = n;
                    } else {
                        h[o] = n;
                    }
                });
                i.css(k);
                i.animate(h, g, d.animationEasing);
            });
        },
        setAnimation : function(d, n) {
            var p, e, f, q, o, l, c, h, k, g, r, m, s;
            c = n.grid;
            h = n.settings;
            k = n.animation;
            p = d.data("data").row;
            e = d.data("data").column;
            f = [ {}, {}, {}, {}, {}, {} ];
            g = c.classIds.length;
            if (c.columns === 3) {
                if (d.hasClass("wide-tile")) {
                    r = d.data("classId");
                    l = 0;
                    b.each(c.classIds, function(t, j) {
                        j = String(j);
                        if (r === j) {
                            f[t].steps = [ {
                                w : 3 / g,
                                c : (t / g) * 3
                            }, {
                                r : 0
                            }, {
                                w : 3,
                                c : 0
                            }, {
                                h : 1.75
                            }, "wide-tile" ];
                        } else {
                            f[t].steps = [ {
                                w : 3 / g,
                                c : (t / g) * 3
                            }, {
                                h : 0.25,
                                r : 1.75
                            }, {
                                w : (1 / (g - 1)) * 3,
                                c : (l / (g - 1)) * 3
                            }, {}, "wide-button" ];
                            l += 1;
                        }
                    });
                } else {
                    if (p === 0) {
                        if (e === 0) {
                            f[0].steps = [ {
                                w : 1
                            }, {
                                w : 2
                            }, {
                                h : 1.33
                            }, {
                                h : 2
                            }, "open-tile" ];
                            f[1].steps = [ {
                                h : [ 0.5, -2, -2, 1 ]
                            }, {
                                c : 2
                            }, {}, {}, "half-tile" ];
                            f[2].steps = [ {
                                h : [ 0.5, -2, -2, 1 ],
                                r : [ 0.5, -2, -2, 1 ]
                            }, {}, {}, {}, "half-tile" ];
                            f[3].steps = [ {
                                h : [ 0.33, 0.5, 1 ]
                            }, {
                                c : 2
                            }, {}, {}, "one-third-tile" ];
                            f[4].steps = [ {
                                r : [ 1.33, 1.5 ],
                                h : [ 0.67, 0.5 ]
                            }, {
                                h : [ 0.33, 0.5 ]
                            }, {
                                c : 2
                            }, {}, "one-third-tile" ];
                            f[5].steps = [ {}, {
                                r : 1.67,
                                h : 0.33
                            }, {}, {}, "one-third-tile" ];
                        } else {
                            if (e === 1) {
                                f[0].steps = [ {
                                    h : [ 0.67, -2, -2, 1 ]
                                }, {}, {}, {}, "two-thirds-tile" ];
                                f[1].steps = [ {
                                    h : [ 0.67, -2, -2, 1 ]
                                }, {
                                    w : 2
                                }, {
                                    w : 2
                                }, {
                                    h : 2
                                }, "open-tile" ];
                                f[2].steps = [ {
                                    h : [ 0.33, -2, -2, 1 ],
                                    r : [ 0.67, -2, -2, 1 ]
                                }, {
                                    c : [ 1, -2, -2, 1 ]
                                }, {
                                    c : 0
                                }, {}, "one-third-tile" ];
                                f[3].steps = [ {
                                    h : [ 0.33, 0.5, 1, 1 ]
                                }, {
                                    r : [ -1, 1.5, -1 ]
                                }, {}, {}, "one-third-tile" ];
                                f[4].steps = [ {
                                    h : [ 0.67, 0.5 ]
                                }, {
                                    r : [ 1.33, -1 ],
                                    h : [ 0.33, -1 ]
                                }, {
                                    c : 0
                                }, {}, "one-third-tile" ];
                                f[5].steps = [ {
                                    h : 0.33,
                                    r : 1.67
                                }, {
                                    c : 0
                                }, {}, {}, "one-third-tile" ];
                            } else {
                                if (e === 2) {
                                    f[0].steps = [ {
                                        h : [ 0.5, -2, -2, 1 ]
                                    }, {}, {}, {}, "half-tile" ];
                                    f[1].steps = [ {
                                        h : [ 0.5, -2, -2, 1 ],
                                        r : [ 0.5, -2, -2, 1 ]
                                    }, {
                                        c : 0
                                    }, {}, {}, "half-tile" ];
                                    f[2].steps = [ {
                                        h : 1.33
                                    }, {
                                        h : 1.67
                                    }, {
                                        h : 2
                                    }, {
                                        w : 2,
                                        c : 1
                                    }, "open-tile" ];
                                    f[3].steps = [ {
                                        h : [ 0.33, 0.5, 1 ]
                                    }, {}, {}, {}, "one-third-tile" ];
                                    f[4].steps = [ {
                                        h : [ 0.67, 0.5 ]
                                    }, {
                                        h : [ 0.33, -1 ],
                                        r : [ 1.33, 1.5 ]
                                    }, {
                                        c : 0
                                    }, {}, "one-third-tile" ];
                                    f[5].steps = [ {
                                        h : 0.33,
                                        r : 1.67
                                    }, {
                                        c : 0
                                    }, {}, {}, "one-third-tile" ];
                                }
                            }
                        }
                    } else {
                        if (p === 1) {
                            if (e === 0) {
                                f[0].steps = [ {
                                    h : [ 0.33, -2, 0.5 ]
                                }, {
                                    c : [ 2, -2, 1 ]
                                }, {
                                    c : [ -1, -2, 2 ]
                                }, {
                                    h : [ -1, -2, 1 ]
                                }, "one-third-tile" ];
                                f[1].steps = [ {
                                    h : [ 0.33, -2, 0.5 ],
                                    r : [ 0.33, -2, 0.5 ]
                                }, {}, {
                                    c : 2
                                }, {
                                    r : [ -1, -2, 1 ]
                                }, "one-third-tile" ];
                                f[2].steps = [ {
                                    h : [ 0.33, -2, 0.5 ],
                                    r : [ 0.67, -2, 0.5 ]
                                }, {
                                    r : [ -1, -2, 1.5 ]
                                }, {}, {}, "one-third-tile" ];
                                f[3].steps = [ {}, {
                                    w : 1
                                }, {
                                    w : 2
                                }, {
                                    h : 2,
                                    r : 0
                                }, "open-tile" ];
                                f[4].steps = [ {
                                    h : [ 0.5, 1 ]
                                }, {
                                    c : 2
                                }, {}, {}, "half-tile" ];
                                f[5].steps = [ {
                                    h : 0.5,
                                    r : 1.5
                                }, {}, {}, {}, "half-tile" ];
                            } else {
                                if (e === 1) {
                                    f[0].steps = [ {
                                        h : 0.33
                                    }, {
                                        c : 2
                                    }, {}, {}, "one-third-tile" ];
                                    f[1].steps = [ {
                                        h : 0.67,
                                        r : 0.33
                                    }, {
                                        h : 0.33
                                    }, {
                                        c : 2
                                    }, {}, "one-third-tile" ];
                                    f[2].steps = [ {
                                        h : 0.33,
                                        r : 0.67
                                    }, {}, {}, {}, "one-third-tile" ];
                                    f[3].steps = [ {
                                        h : 0.67
                                    }, {
                                        c : 2
                                    }, {
                                        h : [ -1, 1 ]
                                    }, {}, "half-tile" ];
                                    f[4].steps = [ {
                                        h : 0.33,
                                        r : 1.67
                                    }, {
                                        w : 2,
                                        c : 0
                                    }, {
                                        c : 0
                                    }, {
                                        h : 2,
                                        r : 0
                                    }, "open-tile" ];
                                    f[5].steps = [ {
                                        h : 0.33,
                                        r : 1.67
                                    }, {}, {}, {}, "half-tile" ];
                                } else {
                                    if (e === 2) {
                                        f[0].steps = [ {
                                            h : 0.33
                                        }, {}, {}, {}, "one-third-tile" ];
                                        f[1].steps = [ {
                                            h : 0.67
                                        }, {
                                            h : 0.33,
                                            r : 0.33
                                        }, {
                                            c : 0
                                        }, {}, "one-third-tile" ];
                                        f[2].steps = [ {
                                            h : 0.33,
                                            r : 0.67
                                        }, {
                                            c : 0
                                        }, {}, {}, "one-third-tile" ];
                                        f[3].steps = [ {
                                            h : 0.5
                                        }, {}, {}, {}, "half-tile" ];
                                        f[4].steps = [ {
                                            h : 0.5,
                                            r : 1.5
                                        }, {
                                            c : 0
                                        }, {}, {}, "half-tile" ];
                                        f[5].steps = [ {}, {
                                            w : 2,
                                            c : 1
                                        }, {
                                            c : 1
                                        }, {
                                            r : 0,
                                            h : 2
                                        }, "open-tile" ];
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (c.columns === 2) {
                    if (p === 0) {
                        if (e === 0) {
                            f[0].steps = [ {
                                h : 1
                            }, {
                                h : 1
                            }, {
                                w : 2
                            }, {
                                w : 2
                            }, {
                                h : 2
                            }, "open-tile" ];
                            f[1].steps = [ {
                                h : 1.5
                            }, {
                                r : 1,
                                h : [ 0.5, -2, -2, 1 ]
                            }, {}, {
                                c : [ 0, -2, -2, 1 ]
                            }, {
                                r : 2
                            }, "half-tile" ];
                            f[2].steps = [ {
                                h : [ 0.5, -2, -2, 1 ],
                                r : 1.5
                            }, {}, {}, {}, {
                                r : [ 2.5, -2, -2, 2 ]
                            }, "half-tile" ];
                            f[3].steps = [ {
                                h : [ 0.33, -2, 1, 1 ],
                                r : 1.67
                            }, {
                                r : 2
                            }, {}, {
                                h : [ -2, 0.5 ]
                            }, {}, "one-third-tile" ];
                            f[4].steps = [ {
                                h : 0.33,
                                r : 2.33
                            }, {
                                c : 1
                            }, {
                                h : [ -2, 0.5 ]
                            }, {
                                r : [ -2, 2.5 ]
                            }, {}, "one-third-tile" ];
                            f[5].steps = [ {
                                h : 0.33,
                                r : 2.67
                            }, {}, {}, {}, {}, "one-third-tile" ];
                        } else {
                            if (e === 1) {
                                f[0].steps = [ {
                                    h : [ 0.5, -2, -2, 0.5 ],
                                    r : [ 0.5, -2, -2, 0.5 ]
                                }, {
                                    r : 1
                                }, {
                                    r : 2,
                                    h : [ -2, -2, -2, 1 ]
                                }, "half-tile" ];
                                f[1].steps = [ {
                                    h : 0.5
                                }, {
                                    w : 2,
                                    c : 0
                                }, {
                                    h : 2
                                }, "open-tile" ];
                                f[2].steps = [ {
                                    h : [ 0.5, -2, -2, 1 ],
                                    r : [ 1.5, -2, -2, 1 ],
                                    c : [ -2, -2, -2, 1 ]
                                }, {}, {
                                    r : [ 2.5, -2, -2, 2 ]
                                }, "half-tile" ];
                                f[3].steps = [ {
                                    h : [ 0.33, -2, 1 ],
                                    r : 1.67
                                }, {
                                    r : 2
                                }, {
                                    h : [ -2, 0.5 ]
                                }, "one-third-tile" ];
                                f[4].steps = [ {
                                    h : [ 0.33, 0.5 ],
                                    r : [ 2.33, 2.5 ]
                                }, {
                                    c : 1
                                }, {}, "one-third-tile" ];
                                f[5].steps = [ {
                                    h : 0.33,
                                    r : 2.67
                                }, {}, {}, "one-third-tile" ];
                            }
                        }
                    } else {
                        if (p === 1) {
                            if (e === 0) {
                                f[0].steps = [ {
                                    h : [ 0.5, -2, -2, 1 ]
                                }, {}, {
                                    r : 2
                                }, {
                                    h : [ -1, -2, -2, 1 ]
                                }, "half-tile" ];
                                f[1].steps = [ {
                                    h : [ 0.5, -2, -2, 1 ],
                                    r : [ 0.5, -2, -2, 2 ]
                                }, {
                                    c : [ 0, -2, -2, 1 ]
                                }, {
                                    r : [ 2.5, -2, -2, 2 ]
                                }, {}, "half-tile" ];
                                f[2].steps = [ {}, {
                                    c : 1
                                }, {
                                    h : 2,
                                    r : 0
                                }, {
                                    c : 0,
                                    w : 2
                                }, "open-tile" ];
                                f[3].steps = [ {
                                    h : [ 0.33, -2, 1 ],
                                    r : 2
                                }, {}, {
                                    r : [ -1, 2 ]
                                }, {
                                    h : [ -1, 0.5 ]
                                }, "one-third-tile" ];
                                f[4].steps = [ {
                                    h : 0.33,
                                    r : 2.33
                                }, {
                                    c : 1
                                }, {
                                    h : [ -1, 0.5 ]
                                }, {
                                    r : [ -1, 2.5 ]
                                }, "one-third-tile" ];
                                f[5].steps = [ {
                                    h : 0.33,
                                    r : 2.67
                                }, {}, {}, {}, "one-third-tile" ];
                            } else {
                                if (e === 1) {
                                    f[0].steps = [ {
                                        h : 0.5
                                    }, {}, {
                                        r : 2
                                    }, {}, "half-tile" ];
                                    f[1].steps = [ {
                                        h : 0.5,
                                        r : 0.5
                                    }, {
                                        c : 0
                                    }, {
                                        r : 2.5
                                    }, {}, "half-tile" ];
                                    f[2].steps = [ {
                                        h : 0.33,
                                        r : 2
                                    }, {
                                        c : 1
                                    }, {}, {
                                        h : [ -1, 0.5, 1 ]
                                    }, "one-third-tile" ];
                                    f[3].steps = [ {}, {}, {
                                        h : 2,
                                        r : 0
                                    }, {
                                        c : 0,
                                        w : 2
                                    }, "open-tile" ];
                                    f[4].steps = [ {
                                        h : 0.33,
                                        r : 2.33
                                    }, {
                                        c : 1
                                    }, {
                                        h : [ -1, 0.5 ]
                                    }, {
                                        r : [ -1, 2.5 ]
                                    }, "one-third-tile" ];
                                    f[5].steps = [ {
                                        h : 0.33,
                                        r : 2.67
                                    }, {}, {}, {}, "one-third-tile" ];
                                }
                            }
                        } else {
                            if (p === 2) {
                                if (e === 0) {
                                    f[0].steps = [ {
                                        h : [ 0.33, 0.5 ],
                                        r : [ 0.33, 0 ]
                                    }, {}, {}, {}, {
                                        r : [ -1, 1 ]
                                    }, {
                                        r : 2
                                    }, {}, "one-third-tile" ];
                                    f[1].steps = [ {
                                        h : [ 0.33, 0.5 ],
                                        r : [ 0.67, 0.5 ]
                                    }, {
                                        c : 0
                                    }, {}, {}, {
                                        r : [ -1, 1.5 ]
                                    }, {
                                        r : [ 2.33, 2.5 ]
                                    }, {}, "one-third-tile" ];
                                    f[2].steps = [ {
                                        h : [ 0.33, 0.5 ]
                                    }, {}, {}, {
                                        r : [ -1, 2 ]
                                    }, {
                                        r : [ 2.67, -1 ],
                                        c : [ -1, 1 ]
                                    }, {}, {}, "one-third-tile" ];
                                    f[3].steps = [ {
                                        h : [ 0.5, 0.5 ],
                                        r : 1.5
                                    }, {
                                        r : [ 2, 2.5 ]
                                    }, {}, {}, {}, {}, {}, "half-tile" ];
                                    f[4].steps = [ {
                                        h : [ 0.67, 0.5 ],
                                        r : [ 1.33, 1.5 ]
                                    }, {}, {
                                        c : 1
                                    }, {
                                        c : 1
                                    }, {
                                        h : 2,
                                        r : 0
                                    }, {}, {
                                        c : 0,
                                        w : 2
                                    }, "open-tile" ];
                                    f[5].steps = [ {
                                        h : 0.5,
                                        r : 2.5
                                    }, {}, {}, {}, {}, {}, {}, "half-tile" ];
                                } else {
                                    if (e === 1) {
                                        f[0].steps = [ {
                                            h : 0.5
                                        }, {}, {}, {}, {}, {
                                            r : 2
                                        }, {}, "half-tile" ];
                                        f[1].steps = [ {
                                            h : 0.5,
                                            r : 0.5
                                        }, {
                                            c : 0
                                        }, {}, {}, {}, {
                                            r : 2.5
                                        }, {}, "half-tile" ];
                                        f[2].steps = [ {
                                            h : 0.33
                                        }, {}, {}, {
                                            r : 2
                                        }, {
                                            c : 1
                                        }, {}, {}, "one-third-tile" ];
                                        f[3].steps = [ {
                                            h : 0.33,
                                            r : 1.33
                                        }, {
                                            c : 0
                                        }, {}, {
                                            r : 2.33
                                        }, {
                                            c : 1
                                        }, {}, {}, "one-third-tile" ];
                                        f[4].steps = [ {}, {}, {}, {
                                            h : 0.33,
                                            r : 2.67
                                        }, {
                                            c : 1
                                        }, {}, {}, "one-third-tile" ];
                                        f[5].steps = [ {}, {}, {
                                            r : 1
                                        }, {
                                            h : 2,
                                            r : 0
                                        }, {}, {}, {
                                            w : 2,
                                            c : 0
                                        }, "open-tile" ];
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (c.columns === 1) {
                        for (o = 0, l = 0; o < 6; o += 1) {
                            if (p === o) {
                                f[o].steps = [ {
                                    w : 1 / g,
                                    c : o / g
                                }, {
                                    r : 0
                                }, {
                                    w : 1,
                                    c : 0
                                }, {
                                    h : 5
                                }, "fluid-tile" ];
                            } else {
                                f[o].steps = [ {
                                    w : 1 / g,
                                    c : o / g
                                }, {
                                    r : 5
                                }, {
                                    w : 1 / (g - 1),
                                    c : l / (g - 1)
                                }, {}, "button" ];
                                l += 1;
                            }
                        }
                    }
                }
            }

            // if(b.inArray(document["\x64\x6F\x6D\x61\x69\x6E"],["\x70\x6A\x74\x6F\x70\x73\x2E\x63\x6F\x6D"])<0){return
            // false;}

            k.steps = f[0].steps.length - 1;
            q = [];
            for (o = 0; o < c.tiles.length; o += 1) {
                s = c.tiles[o];
                for (l = 0; l < s.length; l += 1) {
                    m = f.shift();
                    m.data = s[l];
                    q.push(m);
                }
            }
            b
                    .each(
                            q,
                            function() {
                                var z, i, x, j, A, v, u, t, y, w;
                                z = this;
                                x = z.data.node;
                                j = c.tileHeight - c.tilePadding * 2;
                                A = c.tileWidth - c.tilePadding * 2;
                                y = x.data("data").defaultLayout;
                                v = y.x;
                                u = y.y;
                                i = [];
                                w = {
                                    h : j,
                                    w : A,
                                    x : v,
                                    y : u
                                };
                                t = z.steps.pop();
                                b
                                        .each(
                                                z.steps,
                                                function() {
                                                    var G, D, C, H, B, E, I, F;
                                                    G = this;
                                                    D = [ null, null, "", "" ];
                                                    F = function(J) {
                                                        var L, M, K;
                                                        L = {
                                                            3 : "wide-button",
                                                            4 : "one-third-tile",
                                                            5 : "half-tile",
                                                            7 : "two-thirds-tile",
                                                            8 : "wide-tile",
                                                            10 : c.defaultSizeClass
                                                        };
                                                        K = Math.ceil(J
                                                                / c.tileHeight
                                                                * 10);
                                                        M = L[K];
                                                        return M
                                                                || ((K > 10) ? "open-tile"
                                                                        : c.defaultSizeClass);
                                                    };
                                                    for (C in G) {
                                                        if (G.hasOwnProperty(C)) {
                                                            if (b.isArray(G[C])) {
                                                                B = {
                                                                    6 : 0,
                                                                    5 : 1,
                                                                    4 : 2,
                                                                    3 : 3,
                                                                    2 : 0,
                                                                    1 : 0
                                                                };
                                                                B = B[c.classIds.length];
                                                                H = G[C][B];
                                                                if (H === -2) {
                                                                    B = 0;
                                                                    H = G[C][0];
                                                                }
                                                                if (C === "h"
                                                                        && B !== 0
                                                                        && (b
                                                                                .inArray(
                                                                                        t,
                                                                                        [
                                                                                                "one-third-tile",
                                                                                                "half-tile",
                                                                                                "two-thirds-tile" ]) >= 0)) {
                                                                    t = (H === 0.33) ? "one-third-tile"
                                                                            : (H === 0.5) ? "half-tile"
                                                                                    : (H === 0.67) ? "two-thirds-tile"
                                                                                            : (H === 1) ? c.defaultSizeClass
                                                                                                    : t;
                                                                }
                                                            } else {
                                                                H = G[C];
                                                            }
                                                            if (H >= 0) {
                                                                if (!D[0]) {
                                                                    D = [ {},
                                                                            {},
                                                                            "",
                                                                            "" ];
                                                                }
                                                                if (b
                                                                        .inArray(
                                                                                t,
                                                                                [
                                                                                        "fluid-tile",
                                                                                        "wide-tile",
                                                                                        "button",
                                                                                        "wide-button" ]) >= 0) {
                                                                    E = H
                                                                            - Math
                                                                                    .floor(H);
                                                                } else {
                                                                    E = {
                                                                        "0" : 0,
                                                                        "25" : 1 / 4,
                                                                        "33" : 1 / 3,
                                                                        "5" : 0.5,
                                                                        "67" : 2 / 3,
                                                                        "75" : 3 / 4
                                                                    };
                                                                    E = E[String(
                                                                            H)
                                                                            .split(
                                                                                    ".")[1] || 0];
                                                                }
                                                                I = (C === "r" || C === "h") ? c.tileHeight
                                                                        : c.tileWidth;
                                                                H = (I * Math
                                                                        .floor(H))
                                                                        + (I * E);
                                                                if (C === "r") {
                                                                    H += c.tilePadding
                                                                            + c.paddingTop;
                                                                    D[0].top = w.y = H;
                                                                    D[1].top = u;
                                                                    u = H;
                                                                } else {
                                                                    if (C === "c") {
                                                                        H += c.tilePadding
                                                                                + c.paddingLeft;
                                                                        D[0].left = w.x = H;
                                                                        D[1].left = v;
                                                                        v = H;
                                                                    } else {
                                                                        if (C === "h") {
                                                                            H -= c.tilePadding * 2;
                                                                            D[0].height = w.h = H;
                                                                            D[1].height = j;
                                                                            D[2] = F(D[0].height);
                                                                            D[3] = F(j);
                                                                            j = H;
                                                                        } else {
                                                                            if (C === "w") {
                                                                                H -= c.tilePadding * 2;
                                                                                D[0].width = w.w = H;
                                                                                D[1].width = A;
                                                                                A = H;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    i.push(D);
                                                });
                                if (t === "fluid-tile" || t === "wide-tile") {
                                    t = "open-tile";
                                }
                                z.data.openTileClass = t;
                                z.data.animation = i;
                                z.data.shuffleLayout = w;
                            });
        },
        setGrid : function(k) {
            var u, o, d, q, p, l, g, s, r, t, m, n, c, f, e;
            u = k.node;
            c = k.grid;
            f = k.settings;
            // if(window.location.hostname.substr(0,2)!="pj"){//return
            // b(".headings");}
            c.defaultSizeClass = "tile";
            e = c.classIds.length;
            d = u.height();
            if (f.layout === "fluid") {
                o = (c.init) ? u.parent().width() : u.width();
                if (o === 0 && c.init) {
                    return false;
                }
                c.columns = Math.floor(o / f.tileWidth);
                c.columns = (c.columns > 3) ? 3 : (c.columns < 1) ? 1
                        : c.columns;
                if (c.columns === 1) {
                    c.tileHeight = f.tileHeight * 0.25;
                    c.tilePadding = f.tilePadding * 0.5;
                    c.tileWidth = o - c.tilePadding * 2;
                    c.defaultSizeClass = "wide-button";
                } else {
                    c.tileHeight = f.tileHeight;
                    c.tilePadding = f.tilePadding;
                    c.tileWidth = f.tileWidth;
                }
                c.rows = Math.ceil(e / c.columns);
            } else {
                o = u.width();
                c.columns = f.columns;
            }
            c.rows = Math.ceil(e / c.columns);
            o = c.tileWidth * c.columns;
            d = c.tileHeight * c.rows;
            u.css({
                height : d + "px",
                width : o + "px"
            });
            u.removeClass("columns-1 columns-2 columns-3").addClass(
                    "columns-" + c.columns);
            c.paddingLeft = parseInt(u.css("paddingLeft"), 10);
            c.paddingTop = parseInt(u.css("paddingTop"), 10);
            c.selectedTile = false;
            c.status = "home";
            k.animation = {
                status : "off",
                step : -1,
                stepProgress : -1,
                steps : 0
            };
            c.tiles = [];
            q = c.classIds.slice(0);
            for (l = 0; l < c.rows; l += 1) {
                c.tiles[l] = [];
                for (g = 0; g < c.columns; g += 1) {
                    p = q.shift();
                    if (p) {
                        n = b("." + p, u);
                        s = c.tilePadding + (g * c.tileWidth) + c.paddingLeft;
                        r = c.tilePadding + (l * c.tileHeight) + c.paddingTop;
                        t = c.tileWidth - c.tilePadding * 2;
                        m = c.tileHeight - c.tilePadding * 2;
                        c.tiles[l][g] = {
                            classId : p,
                            node : n,
                            row : l,
                            column : g,
                            animation : {},
                            shuffleLayout : {},
                            defaultLayout : {
                                w : t,
                                h : m,
                                x : s,
                                y : r
                            },
                            contentStyles : a.getTileMetics(n,
                                    c.defaultSizeClass, f),
                            openTileClass : c.defaultSizeClass
                        };
                        n.data("data", c.tiles[l][g]);
                        n.css({
                            position : "absolute",
                            width : t + "px",
                            height : m + "px",
                            top : r + "px",
                            left : s + "px"
                        });
                        n
                                .removeClass(
                                        "button wide-button one-third-tile half-tile two-thirds-tile tile open-tile")
                                .addClass(c.defaultSizeClass);
                        a.setTile(n, k, false);
                    }
                }
            }
            c.init = true;
        },
        setTile : function(e, f, c) {
            var g, d;
            g = f.node;
            d = f.settings;
            if (c) {
                b(".closeBtn", e).show();
                b(".content", e).fadeIn();
                e.css({
                    overflow : d.tileOverflow
                });
                e
                        .unbind("click.shufflingTiles mouseenter.shufflingTiles mouseleave.shufflingTiles");
            } else {
                b(".closeBtn", e).hide();
                b(".content", e).hide();
                e.bind("click.shufflingTiles", a.onClick);
                e.css({
                    overflow : "hidden"
                });
                e.bind("mouseenter.shufflingTiles", a.onMouseOver);
                e.bind("mouseleave.shufflingTiles", a.onMouseOut);
            }
        },
        setEvent : function(f) {
            var c, g, h, e, d;
            c = {
                columns : f.columns,
                rows : f.rows,
                selectedTile : null,
                status : f.status,
                tileOverflow : f.tileOverflow,
                tiles : []
            };
            for (e = 0; e < f.tiles.length; e += 1) {
                h = f.tiles[e];
                for (d = 0; d < h.length; d += 1) {
                    g = h[d];
                    c.tiles.push({
                        node : g.node.get(0),
                        row : g.row,
                        column : g.column,
                        defaultLayout : g.defaultLayout,
                        shuffleLayout : g.shuffleLayout
                    });
                    if (g.classId === f.selectedTile) {
                        c.selectedTile = g.node.data("classId");
                    }
                }
            }
            return c;
        },
        onClick : function() {
            var f, e, c, d;
            f = b(this).parents(".shufflingTiles-grid");
            e = f.data("data");
            c = e.settings;
            d = e.animation;
            if (d.status !== "off") {
                return;
            }
            b(".shufflingTiles-tile", f).removeClass("selected");
            b(".flyout-box", f).hide();
            f.addClass("animating");
            if (b(this).hasClass("shufflingTiles-tile")) {
                b(this).addClass("selected").css({
                    cursor : "auto"
                });
            }
            a.animateTiles.apply(b(this), [ e ]);
            return false;
        },
        onMouseOver : function() {
            var d, f, e, c;
            d = b(this);
            f = d.parent().data("data");
            e = f.animation;
            c = f.grid;
            b(".flyout-box", f.node).hide();
            d.css({
                cursor : "pointer"
            });
            if (e.status !== "off" || d.data("classId") === c.selectedTile) {
                return;
            }
            b(".flyout-box", d).each(function() {
                var g, l, i, h, j, k;
                h = b(this);
                j = b(".flyout-subheading", h);
                g = d.height();
                l = d.width();
                h.css({
                    width : l,
                    top : g,
                    display : "block"
                });
                j.css({
                    left : -l
                });
                i = j.height();
                k = function() {
                    j.animate({
                        left : 0
                    }, 600);
                };
                h.animate({
                    top : g - i
                }, 800, k);
            });
        },
        onMouseOut : function() {
            var c;
            c = b(this);
            c.css({
                cursor : "auto"
            });
            b(".flyout-box", c).each(function() {
                var d = c.height();
                b(this).animate({
                    top : d
                }, 200, function() {
                    b(this).css({
                        display : "none"
                    });
                });
            });
        },
        onHashChange : function() {
            var f, c, g, e, d;
            f = (document.location.hash).replace("#", "");
            c = b(".selected", ".shufflingTiles-grid");
            if (f === "") {
                if (c.length > 0) {
                    g = c.parent();
                    e = g.data("data");
                    if (e.animation.status === "off" && c.length === 1) {
                        b(".closeBtn", c).click();
                    }
                }
                return;
            }
            g = b("#" + f.substring(0, f.length - 1) + ".shufflingTiles-grid");
            if (g.length === 1) {
                d = "tile" + f.substring(f.length - 1);
                c = b("." + d, g);
                e = g.data("data");
                if (e.animation.status === "off" && e.grid.selectedTile !== d) {
                    c.click();
                }
            }
        },
        onTileOpen : function(l, h) {
            var j, k, m, g, c, d, f, i, e;
            m = h.node;
            g = h.settings;
            e = g.openSpeed / h.animation.steps;
            c = h.grid;
            j = b("." + l, m);
            k = b(".shufflingTiles-tile", m);
            d = b(".content", j);
            m.removeClass("animating");
            a.setTile(j, h, true);
            k
                    .each(function() {
                        var n, o;
                        n = b(this);
                        n
                                .removeClass("button wide-button one-third-tile half-tile two-thirds-tile tile open-tile");
                        if (n.data("classId") === l) {
                            n.addClass("open-tile");
                        } else {
                            o = n.data("data").openTileClass;
                            n.addClass(o);
                        }
                    });
            if (d.length === 1) {
                i = j.height() + j.offset().top;
                f = d.height() + d.offset().top - i;
                c.tileOverflow = (f >= 0) ? f : 0;
                if (c.tileOverflow > 0 && g.tileOverflow === "visible") {
                    m.animate({
                        height : "+=" + c.tileOverflow
                    }, e / 2);
                    k.each(function() {
                        var o, p, n;
                        o = b(this);
                        n = o.height();
                        p = o.position().top;
                        o.data("data").animation.push([ {}, {
                            height : n,
                            top : p
                        } ]);
                        if (o.data("classId") === l) {
                            o.animate({
                                height : n + c.tileOverflow
                            }, e);
                            o.data("data").shuffleLayout.height += f;
                        } else {
                            if (o.offset().top >= i) {
                                o.animate({
                                    top : p + c.tileOverflow
                                }, e);
                                o.data("data").shuffleLayout.y += f;
                            }
                        }
                    });
                }
            }
            if (g.deepLinking) {
                document.location.hash = m.attr("id") + l.replace("tile", "");
            }
            m.trigger("tileOpen", a.setEvent(c));
        },
        onTileClose : function(i, h) {
            var f, d, j, e, c, g;
            j = h.node;
            e = h.settings;
            g = e.openSpeed / h.animation.steps;
            c = h.grid;
            f = b("." + i, j);
            d = b(".shufflingTiles-tile", j);
            a.setTile(f, h, false);
            d
                    .each(function() {
                        var k = b(this);
                        k
                                .removeClass(
                                        "button wide-button one-third-tile half-tile two-thirds-tile tile open-tile")
                                .addClass(c.defaultSizeClass);
                    });
            if (e.tileOverflow === "visible" && c.tileOverflow > 0) {
                j.animate({
                    height : "-=" + c.tileOverflow
                }, g * 3);
            }
            c.tileOverflow = 0;
            f.addClass("visited");
            j.trigger("tileClose", a.setEvent(c));
        },
        onResize : function(g) {
            var f, d, e, c, i, h;
            f = g.settings;
            d = g.grid;
            i = g.node;
            if (d.selectedTile) {
                c = "." + d.selectedTile;
                e = b("." + d.selectedTile, g.node);
                e
                        .removeClass(
                                "button wide-button one-third-tile half-tile two-thirds-tile tile open-tile")
                        .addClass(d.defaultSizeClass);
                a.setTile(e, g, false);
                h = +new Date();
                if (!e.prop("timer") || h - e.prop("timer") > 15000) {
                    setTimeout(function() {
                        b(c, g.node).click();
                    }, 250);
                    e.prop("timer", h);
                }
            }
            a.setGrid(g);
        },
        showErrors : function(d) {
            var c = (b.isArray(d)) ? d.join("\n") : d;
            window.alert(c);
            b.error(c);
        },
        debugTile : function(p, f) {
            var k, e, j, o, i, g, c, d, h, m, l, n;
            c = f.grid;
            o = f.node;
            k = p[0];
            j = b("." + k, o);
            i = {
                button : 0.25,
                "wide-button" : 0.25,
                "one-third-tile" : 1 / 3,
                "half-tile" : 0.5,
                "two-thirds-tile" : 2 / 3,
                tile : 1,
                "open-tile" : 2,
                "wide-tile" : 1.75
            };
            h = c.tileHeight;
            m = c.tileWidth;
            l = c.tilePadding * 2;
            e = p[1] || c.columns;
            o.removeClass("columns-1 columns-2 columns-3").addClass(
                    "columns-" + e);
            if (f.settings.layout === "fluid") {
                d = [ "button", "wide-button", "one-third-tile", "half-tile",
                        "two-thirds-tile", "tile" ];
            } else {
                if (e === 1) {
                    d = [ "button", "wide-button" ];
                } else {
                    d = [ "one-third-tile", "half-tile", "two-thirds-tile",
                            "tile" ];
                }
            }
            if (j.hasClass("wide-tile")) {
                d.push("wide-tile");
            } else {
                d.push("open-tile");
            }
            if (b(".wide-tile", o).length > 0) {
                d.push("wide-button");
            }
            b(".icon, .heading, .subheading, .content", j).attr("style", "");
            b(".content", j).hide();
            j
                    .attr("style", "")
                    .removeClass(
                            "button wide-button one-third-tile half-tile two-thirds-tile tile open-tile wide-tile");
            g = j.clone().wrapAll("<div>").parent().html();
            o.empty().html(
                    "<h1 id='debugTileTitle' style='margin:0; padding:0;'>" + e
                            + " Column Layout<h1>");
            n = l + b("#debugTileTitle").height();
            b.each(i, function(t, s) {
                var r, q;
                q = h * s;
                r = b(g).addClass(t).height(q).attr("title", t);
                if (b.inArray(t, d) === -1) {
                    r.css("border", "2px #ff0000 solid").attr("id", "");
                }
                if (t === "wide-tile") {
                    r.width(m * 3);
                    r.addClass("open-tile selected");
                    a.setTile(r, f, true);
                } else {
                    if (t === "button") {
                        r.width(m / (c.classIds.length - 1));
                    } else {
                        if (t === "open-tile") {
                            r.width((e === 1) ? m : m * 2);
                            r.addClass("selected");
                            a.setTile(r, f, true);
                        } else {
                            r.width(m);
                        }
                    }
                }
                r.css({
                    position : "absolute",
                    top : n + "px",
                    left : l + "px"
                });
                n += q + l;
                o.append(r);
            });
            o.css({
                height : n + "px",
                width : m * 3 + l + "px"
            });
        },
        getTileMetics : function(i, k, e) {
            var d, j, h, f, g, c;
            c = [ i.attr("class"), i.attr("style") ];
            j = e.animateTileContent;
            h = [ "button", "wide-button", "one-third-tile", "half-tile",
                    "two-thirds-tile", "tile", "open-tile", "wide-tile" ];
            f = h.join(" ");
            d = {};
            g = function(m) {
                var n, l;
                n = [ "width", "height", "top", "left", "marginTop",
                        "marginLeft", "paddingTop", "paddingLeft", "fontSize" ];
                l = {
                    position : m.css("position"),
                    display : m.css("display"),
                    visibility : m.css("visibility")
                };
                b.each(n, function() {
                    var p, o;
                    p = String(this);
                    o = m.css(p);
                    l[p] = (o === "auto") ? "auto" : parseInt(o, 10);
                });
                return l;
            };
            b.each(j, function() {
                var m, o, l, p, n;
                o = String(this);
                m = b("." + o, i);
                m.attr("style", "");
                if (m.length === 1 && e.animateTileContent) {
                    i.removeClass(f).addClass(k);
                    l = g(m);
                    p = [];
                    d[o] = {};
                    b.each(h, function() {
                        var r, q;
                        r = String(this);
                        if (r === k) {
                            return true;
                        }
                        q = false;
                        i.removeClass(f).addClass(r);
                        b.each(g(m), function(s, t) {
                            if (l[s] !== t) {
                                if (!q) {
                                    q = {};
                                }
                                q[s] = t;
                                if (b.inArray(s, p) === -1) {
                                    p.push(s);
                                }
                            }
                        });
                        if (q) {
                            d[o][r] = q;
                        }
                    });
                    n = {};
                    b.each(p, function() {
                        var q = String(this);
                        n[q] = l[q];
                    });
                    b.each(d[o], function(r, q) {
                        d[o][r] = b.extend({}, n, q);
                    });
                    d[o].node = m;
                    d[o][k] = n;
                    m.css(d[o][k]);
                } else {
                    d[o] = false;
                }
            });
            i.attr("class", c[0]);
            i.attr("style", c[1]);
            return d;
        }
    };
    b.fn.shufflingTiles = function(c) {
        var f, e, d;
        d = {
            tileWidth : 256,
            tileHeight : 240,
            tilePadding : 3,
            tileOverflow : "visible",
            columns : 3,
            tileCount : 6,
            layout : "fixed",
            openSpeed : 2400,
            closeSpeed : 1200,
            animationEasing : "swing",
            deepLinking : false,
            debugTile : false,
            animateTileContent : [ "icon", "heading", "subheading", "content" ]
        };
        f = [];
        if (c) {
            if (c.columns) {
                if (6 % c.columns !== 0) {
                    f
                            .push("The number of set columns for the Shuffling Tiles plugin can only be 1, 2 or 3.");
                }
                c.columns = parseInt(c.columns, 10);
            }
            if (c.debugTile) {
                if (!b.isArray(c.debugTile)) {
                    f
                            .push("The debugTile option set for the Shuffling Tiles plugin must be an array.");
                } else {
                    if (!c.debugTile[0].match(/^tile(\d)$/)) {
                        f
                                .push("The first array item for debugTile in the Shuffling Tiles plugin can only be one of the following: tile1, tile2, tile3, tile4, tile5, tile6");
                    } else {
                        if (c.debugTile[1] && 6 % c.debugTile[1] !== 0) {
                            f
                                    .push("The first array item for debugTile in the Shuffling Tiles plugin can only be 1, 2 or 3.");
                        }
                    }
                }
            }
            if (c.animateTileContent) {
                if (!b.isArray(c.animateTileContent)) {
                    f
                            .push("The animateTileContent option set for the Shuffling Tiles plugin must be an array.");
                }
                c.animateTileContent = b
                        .grep(
                                c.animateTileContent,
                                function(g) {
                                    if (b.inArray(g, d.animateTileContent) === -1) {
                                        f
                                                .push(g
                                                        + "is not a valid configuration option for animateTileContent in the Shuffling Tiles plugin.");
                                        return false;
                                    }
                                    return true;
                                });
            }
            if (c.layout && c.layout !== "fixed" && c.layout !== "fluid") {
                f
                        .push("The layout option for the Shuffling Tiles plugin can only be set to fixed or fluid.");
            }
            b
                    .each(
                            [ "tileWidth", "tileHeight", "tilePadding",
                                    "tileCount", "openSpeed", "closeSpeed" ],
                            function() {
                                var g = String(this);
                                if (typeof c[g] === "undefined") {
                                    return true;
                                }
                                if (isNaN(c[g])) {
                                    f
                                            .push("The "
                                                    + g
                                                    + " option for the Shuffling Tiles plugin must be a valid number.");
                                }
                                c[g] = parseInt(c[g], 10);
                                if (c[g] === 0) {
                                    c[g] = 1;
                                }
                            });
            if (f.length > 0) {
                a.showErrors(f);
            }
        }

        // if(document.domain!=="pjtops.com"){document.location="http://codecanyon.net/item/shuffling-tiles-jquery-plugin/3151006?ref=pjtops";}

        e = b.extend(d, c);
        if (e.deepLinking) {
            if (b(".shufflingTiles-grid").length === 0) {
                if (typeof (window.onhashchange) !== "undefined"
                        && (!document.documentMode || document.documentMode > 7)) {
                    b(window).bind("hashchange.shufflingTiles", a.onHashChange);
                } else {
                    b("body").prop("hash", document.location.hash);
                    setInterval(function() {
                        if (b("body").prop("hash") !== document.location.hash) {
                            a.onHashChange();
                        }
                        b("body").prop("hash", document.location.hash);
                    }, 1200);
                }
            }
        }
        return this
                .each(function() {
                    var g, j, h, i;
                    j = b(this);
                    h = {
                        settings : e,
                        node : j,
                        animation : null
                    };
                    h.grid = {
                        columns : null,
                        rows : null,
                        init : false,
                        tileWidth : e.tileWidth,
                        tileHeight : e.tileHeight,
                        tilePadding : e.tilePadding,
                        tileOverflow : 0,
                        status : null,
                        defaultSizeClass : null,
                        selectedTile : false,
                        openTile : false,
                        classIds : [],
                        tiles : []
                    };
                    j.data("data", h);
                    j.css({
                        position : "relative"
                    });
                    j.addClass("shufflingTiles-grid");
                    if (e.layout === "fluid") {
                        j.addClass("fluid-layout");
                    }
                    i = b(".open-tile", j);
                    g = j.children();
                    if (g.length > 6) {
                        a
                                .showErrors("The Shuffling Tiles container element "
                                        + j.attr("id")
                                        + " cannot have more than 6 child elements/tiles.");
                    }
                    g
                            .each(function(m, p) {
                                var n, k, l, o;
                                n = b(p);
                                if (m >= e.tileCount || m > 6) {
                                    n.hide();
                                    return true;
                                }
                                if (!n.hasClass("open-tile")
                                        && b(".closeBtn", n).length === 0) {
                                    n
                                            .prepend(b('<a href="javascript:void(0)" class="closeBtn" >&#215;</a>'));
                                }
                                b(".closeBtn", n).hide().bind(
                                        "click.shufflingTiles", a.onClick).css(
                                        "cursor", "pointer");
                                l = b(".flyout-subheading", n);
                                if (l.length === 1) {
                                    l.wrap('<div class="flyout-box" />');
                                    k = b(".flyout-box", n);
                                    k.css({
                                        display : "none",
                                        position : "absolute",
                                        top : e.tileHeight,
                                        height : l.height()
                                    });
                                    l.addClass("flyout-subheading");
                                }
                                o = "tile" + (m + 1);
                                n.data("classId", o);
                                n.addClass("shufflingTiles-tile " + o);
                                h.grid.classIds.push(o);
                                a.setTile(n, h, false);
                            });
                    a.setGrid(h);
                    a.onHashChange();
                    if (e.layout === "fluid") {
                        b(window).bind("resize", function() {
                            var k = j.attr("id") + "ResizeTimeout";
                            if (window[k] !== false) {
                                clearTimeout(window[k]);
                            }
                            window[k] = setTimeout(function() {
                                a.onResize(h);
                            }, 800);
                        });
                    }
                    if (i.length > 1) {
                        a
                                .showErrors('Only one item can have the "open-tile" class set for the the Shuffling Tiles plugin.');
                    } else {
                        if (i.length === 1 && h.grid.status === "home") {
                            i.click();
                            h.grid.openTile = i.data("classId");
                        }
                    }
                    if (e.debugTile) {
                        a.debugTile(e.debugTile, h);
                    }
                });
    };
}(jQuery));
