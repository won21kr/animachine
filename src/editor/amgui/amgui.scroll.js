'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createRange: createRange,
        makeScrollable: makeScrollable,
    }
};



function makeScrollable(opt) {

    var pos = 0,
        deConts = opt.deCont,
        deTargets = opt.deTarget,
        range = opt.range;

    if (!Array.isArray(deConts)) deConts = [deConts];
    if (!Array.isArray(deTargets)) deTargets = [deTargets];

    deConts.forEach(function (deC) {

        deC.addEventListener('wheel', onWheel);
    });

    if (opt.range) {

        range.addEventListener('change', onChangeRange);
    }

    function onWheel(e) {

        var way = e.deltaY/18,
            maxH = getTargetMaxH();
        
        pos = Math.max(0, Math.min(maxH, pos + way));

        scroll();
    }

    function onChangeRange(e) {

        pos = getTargetMaxH() * e.detail.value;
        scroll();
    }

    function scroll() {

        deTargets.forEach(function (deT) {

            deT.style.top = -pos + 'px'
        });
    }

    function getTargetMaxH() {

        var contH = Math.max.apply(null, deConts.slice().map(getH)),
            targetH = Math.max.apply(null, deTargets.slice().map(getH));

        return targetH - contH;
    }

    function getH(de) {

        return de.getBoundingClientRect().height;
    }
}




function createRange(opt) {

    opt = opt || {};
  
    var value = 0, cursorWidth = 0, isVertical = !!opt.vertical;

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = opt.width || '12px';
    de.style.height = opt.height || '140px';
    de.style.background = 'grey';
    de.style.cursor = 'pointer';

    var deCursor = document.createElement('div');
    deCursor.style.position = 'absolute';
    deCursor.style[d('left','top')] = '0';
    deCursor.style[d('right','bottom')] = '0';
    deCursor.style.margin = d('auto 0','0 auto');
    deCursor.style.background = 'orange';
    deCursor.style[d('width','height')] = opt.cursorHeight || '100%';
    de.appendChild(deCursor);

    if (opt.parent) {
        opt.parent.appendChild(de);
    };

    de.setCursorWidth = function (w) {

        deCursor.style[d('height','width')] = w + 'px';
        cursorWidth = w;
    };
    de.setCursorWidth(opt.cursorWidth || 12);   

    amgui.makeDraggable({
        deTarget: de,
        onMove: function (md, mx, my) {

            var br = de.getBoundingClientRect(),
                p = d(mx, my) - (d(br.top, br.left) + cursorWidth/2),
                fw = d(br.height, br.width) - cursorWidth,
                pos = Math.max(0, Math.min(1, p / fw));

            de.setValue(pos);
        }
    });

    de.setValue = function (v) {

        if (v === value) return;

        value = v;
        
        var width = de.getBoundingClientRect()[d('height','width')];
        deCursor.style[d('top','left')] = ((width - cursorWidth) * value) + 'px';

        de.dispatchEvent(new CustomEvent('change', {detail: {value: value}}));
    };

    de.getValue = function () {

        return value;
    };

    function d (vertical, horisontal) {

        return isVertical ? vertical : horisontal;
    }

    return de;
};