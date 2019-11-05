
/* Merged Plone Javascript file
 * This file is dynamically assembled from separate parts.
 * Some of these parts have 3rd party licenses or copyright information attached
 * Such information is valid for that section,
 * not for the entire composite file
 * originating files are separated by - filename.js -
 */

/* - ++resource++collective.z3cform.datagridfield/datagridfield.js - */
/*global window, console*/

jQuery(function($) {

    // No globals, dude!
    "use strict";

    // Local singleton object containing our functions
    var dataGridField2Functions = {};

    dataGridField2Functions.getInputOrSelect = function(node) {
        /* Get the (first) input or select form element under the given node */
        var inputs = node.getElementsByTagName("input");
        if(inputs.length > 0) {
            return inputs[0];
        }
        var selects = node.getElementsByTagName("select");
        if(selects.length > 0) {
            return selects[0];
        }
        return null;
    };

    dataGridField2Functions.getWidgetRows = function(currnode) {
        /* Return primary nodes with class of datagridwidget-row,
           they can be any tag: tr, div, etc. */
        var tbody = this.getParentByClass(currnode, "datagridwidget-body");
        return this.getRows(tbody);
    };

    dataGridField2Functions.getRows = function(tbody) {
        /* Return primary nodes with class of datagridwidget-row,
           they can be any tag: tr, div, etc. */
        var rows = $(tbody).children('.datagridwidget-row');
        return rows;
    };


    /**
     * Get all visible rows of DGF
     *
     * Incl. normal rows + AA row
     */
    dataGridField2Functions.getVisibleRows = function(tbody) {
        var rows = this.getRows(tbody);
        // We rape jQuery.filter here, because of
        // IE8 Array.filter http://kangax.github.com/es5-compat-table/

        // Consider "real" rows only
        var filteredRows = $(rows).filter(function() {
            var $tr = $(this);
            return !$tr.hasClass("datagridwidget-empty-row");
        });
        return filteredRows;
    };

    /**
     * Handle auto insert events by auto append
     */
    dataGridField2Functions.onInsert = function(e) {
        var currnode = e.currentTarget;
        this.autoInsertRow(currnode);
    },

    /**
     * Add a new row when changing the last row
     *
     * @param {Boolean} ensureMinimumRows we insert a special minimum row so the widget is not empty
     */
    dataGridField2Functions.autoInsertRow = function(currnode, ensureMinimumRows) {
        // fetch required data structure
        var dgf = $(dataGridField2Functions.getParentByClass(currnode, "datagridwidget-table-view"));
        var tbody = dataGridField2Functions.getParentByClass(currnode, "datagridwidget-body");
        var thisRow = dataGridField2Functions.getParentRow(currnode); // The new row we are working on
        var $thisRow = $(thisRow);
        var autoAppendMode = $(tbody).data("auto-append");

        if($thisRow.hasClass("minimum-row")) {
            // The change event was not triggered on real AA row,
            // but on a minimum ensured row (row 0).
            // 1. Don't add new row
            // 2. Make widget to "normal" state now as the user has edited the empty row so we assume it's a real row
            this.supressEnsureMinimum(tbody);
            return;
        }

        // Remove the auto-append functionality from the all rows in this widget
        var autoAppendHandlers = dgf.find('.auto-append .datagridwidget-cell, .auto-append .datagridwidget-block-edit-cell');
        autoAppendHandlers.unbind('change.dgf');
        $thisRow.removeClass('auto-append');

        // Create a new row
        var newtr = dataGridField2Functions.createNewRow(thisRow), $newtr = $(newtr);
        // Add auto-append functionality to our new row
        $newtr.addClass('auto-append');

        /* Put new row to DOM tree after our current row.  Do this before
         * reindexing to ensure that any Javascript we insert that depends on
         * DOM element IDs (such as plone.formwidget.autocomplete) will
         * pick up this row before any IDs get changed.  At this point,
         * we techinically have duplicate TT IDs in our document
         * (one for this new row, one for the hidden row), but jQuery
         * selectors will pick up elements in this new row first.
         */

        dgf.trigger("beforeaddrowauto", [dgf, newtr]);

        if(ensureMinimumRows) {
            // Add a special class so we can later deal with it
            $newtr.addClass("minimum-row");
            $newtr.insertBefore(thisRow);
        } else {
            $newtr.insertAfter(thisRow);
        }

        // Re-enable auto-append change handler feature on the new auto-appended row
        $(dgf).find('.auto-append .datagridwidget-cell, .auto-append .datagridwidget-block-edit-cell').bind("change.dgf", $.proxy(dataGridField2Functions.onInsert, dataGridField2Functions));
        dataGridField2Functions.reindexRow(tbody, newtr, 'AA');

        // Update order index to give rows correct values
        dataGridField2Functions.updateOrderIndex(tbody, true, ensureMinimumRows);
        dgf.trigger("afteraddrowauto", [dgf, newtr]);
    };

    /**
     * Creates a new row after the the target row.
     *
     * @param {Object} currnode DOM <tr>
     */
    dataGridField2Functions.addRowAfter = function(currnode) {
        // fetch required data structure
        var tbody = this.getParentByClass(currnode, "datagridwidget-body");
        var dgf = $(dataGridField2Functions.getParentByClass(currnode, "datagridwidget-table-view"));
        var thisRow = this.getParentRow(currnode);
        var newtr = this.createNewRow(thisRow);
        dgf.trigger("beforeaddrow", [dgf, newtr]);
        var filteredRows = this.getVisibleRows(currnode);

        // If using auto-append we add the "real" row before AA
        // We have a special case when there is only one visible in the gid
        if (thisRow.hasClass('auto-append') && !thisRow.hasClass("minimum-row")) {
            $(newtr).insertBefore(thisRow);
        } else {
            $(newtr).insertAfter(thisRow);
        }

        // Ensure minimum special behavior is no longer needed as we have now at least 2 rows
        if(thisRow.hasClass("minimum-row")) {
            this.supressEnsureMinimum(tbody);
        }

        // update orderindex hidden fields
        this.updateOrderIndex(tbody, true);
        dgf.trigger("afteraddrow", [dgf, newtr]);
    };

    /**
     * Creates a new row.
     *
     * The row is not inserted to the table, but is returned.
     *
     * @param {Object} <tr> or <tbody> DOM node in a table where we'll be adding the new row
     */
    dataGridField2Functions.createNewRow = function(node) {
        var tbody = this.getParentByClass(node, "datagridwidget-body");
        // hidden template row
        var emptyRow = $(tbody).children('.datagridwidget-empty-row').first();
        if(emptyRow.size() === 0) {
            // Ghetto assert()
            throw new Error("Could not locate empty template row in DGF");
        }
        var new_row = emptyRow.clone(true).removeClass('datagridwidget-empty-row');

        // enable patternslib
        $(new_row).find('*[class^="dgw-disabled-pat-"]')
        .attr('class', function(i, cls) {
          return cls.replace(/dgw\-disabled-pat-/, 'pat-');
        });
        if ( typeof require !== 'undefined' ) {
          var patRegistry = require('pat-registry');
          patRegistry.scan(new_row);
        }
        return new_row;
    };


    dataGridField2Functions.removeFieldRow = function(node) {
        /* Remove the row in which the given node is found */
        var tbody = this.getParentByClass(node, "datagridwidget-body");
        var row = this.getParentRow(node);
        $(row).remove();
        // ensure minimum rows in non-auto-append mode, reindex if no
        // minimal row was added, otherwise reindexing is done by ensureMinimumRows
        if ($(tbody).data("auto-append") || !this.ensureMinimumRows(tbody)) {
            this.updateOrderIndex(tbody, false);
        }
    };

    dataGridField2Functions.moveRow = function(currnode, direction){
        /* Move the given row down one */
        var nextRow;
        var dgf = $(dataGridField2Functions.getParentByClass(currnode, "datagridwidget-table-view"));
        var tbody = this.getParentByClass(currnode, "datagridwidget-body");
        var rows = this.getWidgetRows(currnode);
        var row = this.getParentRow(currnode);
        if(!row) {
            throw new Error("Couldn't find DataGridWidget row");
        }
        var idx = null;

        // We can't use nextSibling because of blank text nodes in some browsers
        // Need to find the index of the row
        rows.each(function (i) {
            if (this == row[0]) {
                idx = i;
            }
        });

        // Abort if the current row wasn't found
        if (idx == null)
            return;

        // The up and down should cycle through the rows, excluding the auto-append and
        // empty-row rows.
        var validrows = 0;
        rows.each(function (i) {
            if (!$(this).hasClass('datagridwidget-empty-row') && !$(this).hasClass('auto-append')) {
                validrows+=1;
            }
        });

        if (idx+1 == validrows) {
            if (direction == "down") {
                this.moveRowToTop(row);
            } else {
                nextRow = rows[idx-1];
                this.shiftRow(nextRow, row);
            }
        } else if (idx === 0) {
            if (direction == "up") {
                this.moveRowToBottom(row);
            } else {
                nextRow = rows[parseInt(idx+1, 10)];
                this.shiftRow(row, nextRow);
            }
        } else {
            if (direction == "up") {
                nextRow = rows[idx-1];
                this.shiftRow(nextRow, row);
            } else {
                nextRow = rows[parseInt(idx+1, 10)];
                this.shiftRow(row, nextRow);
            }
        }
        this.updateOrderIndex(tbody);
        dgf.trigger("aftermoverow", [dgf, row]);
    };

    dataGridField2Functions.moveRowDown = function(currnode){
        this.moveRow(currnode, "down");
    };

    dataGridField2Functions.moveRowUp = function(currnode){
        this.moveRow(currnode, "up");
    };

    dataGridField2Functions.shiftRow = function(bottom, top){
        /* Put node top before node bottom */
        $(top).insertBefore(bottom);
    };

    dataGridField2Functions.moveRowToTop = function (row) {
        var rows = this.getWidgetRows(row);
        $(row).insertBefore(rows[0]);
    };

    dataGridField2Functions.moveRowToBottom = function (row) {
        var rows = this.getWidgetRows(row);

        // make sure we insert the directly above any auto appended rows
        var insert_after = 0;
        rows.each(function (i) {
            if (!$(this).hasClass('datagridwidget-empty-row')  && !$(this).hasClass('auto-append')) {
                insert_after = i;
            }
        });
        $(row).insertAfter(rows[insert_after]);
    };

    /**
     * Fixup all attributes on all child elements that contain
     * the row index. The following attributes are scanned:
     * - name
     * - id
     * - for
     * - href
     * - data-fieldname
     *
     * On the server side, the DGF logic will rebuild rows based
     * on this information.
     *
     * If indexing for some reasons fails you'll get double
     * input values and Zope converts inputs to list, failing
     * in funny ways.
     *
     * @param  {DOM} tbody
     * @param  {DOM} row
     * @param  {Number} newindex
     */
    dataGridField2Functions.reindexRow = function (tbody, row, newindex) {
        var name_prefix = $(tbody).data('name_prefix') + '.';
        var id_prefix = $(tbody).data('id_prefix') + '-';
        var $row = $(row);
        var oldindex = $row.data('index');

        function replaceIndex(el, attr, prefix) {
            if (el.attr(attr)) {
                var val = el.attr(attr);
                var pattern = new RegExp('^' + prefix + oldindex);
                el.attr(attr, val.replace(pattern, prefix + newindex));
                if (attr.indexOf('data-') === 0) {
                    var key = attr.substr(5);
                    var data = el.data(key);
                    el.data(key, data.replace(pattern, prefix + newindex));
                }
            }
        }

        // update index data
        $row.data('index', newindex);
        $row.attr('data-index', newindex);

        $row.find('[id^="formfield-' + id_prefix + '"]').each(function(i, el) {
            replaceIndex($(el), 'id', 'formfield-' + id_prefix);
        });
        $row.find('[name^="' + name_prefix +'"]').each(function(i, el) {
            replaceIndex($(el), 'name', name_prefix);
        });
        $row.find('[id^="' + id_prefix +'"]').each(function(i, el) {
            replaceIndex($(el), 'id', id_prefix);
        });
        $row.find('[for^="' + id_prefix +'"]').each(function(i, el) {
            replaceIndex($(el), 'for', id_prefix);
        });
        $row.find('[href*="#' + id_prefix +'"]').each(function(i, el){
            replaceIndex($(el), 'href', '#' + id_prefix);
        });
        $row.find('[data-fieldname^="' + name_prefix + '"]').each(function(i, el) {
            replaceIndex($(el), 'data-fieldname', name_prefix);
        });
    };

    /**
     * Stop ensure miminum special behavior.
     *
     * The caller is responsible to check there was one and only one minimum-row in the table.
     *
     * Call when data is edited for the first time or a row added.
     */
    dataGridField2Functions.supressEnsureMinimum = function(tbody) {
        var autoAppendHandlers = $(tbody).find('.auto-append .datagridwidget-cell, .auto-append .datagridwidget-block-edit-cell');
        autoAppendHandlers.unbind('change.dgf');
        tbody.children().removeClass("auto-append");
        tbody.children().removeClass("minimum-row");
        dataGridField2Functions.updateOrderIndex(tbody, true, false);
    };

    /**
     * Update all row indexes on a DGF table.
     *
     * Each <tr> and input widget has recalculated row index number in its name,
     * so that the server can then parsit the submitted data in the correct order.
     *
     * @param  {Object} tbody     DOM of DGF <tbody>
     * @param  {Boolean} backwards iterate rows backwards
     * @param  {Boolean} ensureMinimumRows We have inserted a special auto-append row
     */
    dataGridField2Functions.updateOrderIndex = function (tbody, backwards, ensureMinimumRows) {
        var $tbody = $(tbody);
        var name_prefix = $tbody.attr('data-name_prefix') + '.';
        var i, idx, row, $row, $nextRow;

        // Was this auto-append table
        var autoAppend = false;
        var rows = this.getRows(tbody);
        for (i=0; i<rows.length; i++) {
            idx = backwards ? rows.length-i-1 : i;
            row = rows[idx], $row = $(row);

            if ($row.hasClass('datagridwidget-empty-row')) {
                continue;
            }
            if($row.hasClass('auto-append')) {
                autoAppend = true;
            }
            this.reindexRow(tbody, row, idx);
        }

        // Handle a special case where
        // 1. Widget is empty
        // 2. We don't have AA mode turned on
        // 3. We need to have minimum editable row count of 1
        if(ensureMinimumRows) {
            this.reindexRow(tbody, rows[0], "AA");
            autoAppend = true;
        }

        // Add a special first and class row classes
        // to hide manipulation handles
        // AA handling is different once again
        var visibleRows = this.getVisibleRows(tbody);
        for (i=0; i<visibleRows.length; i++) {
            row = visibleRows[i], $row = $(row);
            if(i<visibleRows.length-2) {
                $nextRow = $(visibleRows[i+1]);
            }
            if(i===0) {
                $row.addClass("datagridfield-first-filled-row");
            } else {
                $row.removeClass("datagridfield-first-filled-row");
            }
            // Last visible before AA
            if(autoAppend) {
                if($nextRow && $nextRow.hasClass("auto-append")) {
                    $row.addClass("datagridfield-last-filled-row");
                } else {
                    $row.removeClass("datagridfield-last-filled-row");
                }
            } else {
                if(i==visibleRows.length-1) {
                    $row.addClass("datagridfield-last-filled-row");
                } else {
                    $row.removeClass("datagridfield-last-filled-row");
                }
            }
        }

        // Set total visible row counts and such and hint CSS
        var vis = this.getVisibleRows(tbody).length;
        $tbody.attr("data-count", this.getRows(tbody).length);
        $tbody.attr("data-visible-count", this.getVisibleRows(tbody).length);
        $tbody.attr("data-many-rows", vis >= 2 ? "true" : "false");

        $(document).find('input[name="' + name_prefix + 'count"]').each(function(){
            // do not include the TT and the AA rows in the count
            var count = rows.length;
            if ($(rows[count-1]).hasClass('datagridwidget-empty-row')) {
                count--;
            }
            if ($(rows[count-1]).hasClass('auto-append')) {
                count--;
            }
            this.value = count;
        });
    };

    dataGridField2Functions.getParentElement = function(currnode, tagname) {
        /* Find the first parent node with the given tag name */
        tagname = tagname.toUpperCase();
        var parent = currnode.parentNode;
        while(parent.tagName.toUpperCase() != tagname) {
            parent = parent.parentNode;
            // Next line is a safety belt
            if(parent.tagName.toUpperCase() == "BODY")
                return null;
        }
        return parent;
    };

    dataGridField2Functions.getParentRow = function (node) {
        return this.getParentByClass(node, 'datagridwidget-row');
    };

    dataGridField2Functions.getParentByClass = function(node, klass) {
        var parent = $(node).closest("." + klass);

        if (parent.length) {
            return parent;
        }

        return null;
    };

    /**
     * Find the first parent node with the given id
     *
     * Id is partially matched: the beginning of
     * an element id matches parameter id string.
     *
     * @param  {DOM} currnode Node where ascending in DOM tree beings
     * @param  {String} id       Id string to look for.
     * @return {DOM} Found node or null
     */
    dataGridField2Functions.getParentElementById = function(currnode, id) {
        /*
        */

        id = id.toLowerCase();
        var parent = currnode.parentNode;

        while(true) {

            var parentId = parent.getAttribute("id");
            if(parentId) {
                 if(parentId.toLowerCase().substring(0, id.length) == id) break;
            }

            parent = parent.parentNode;
            // Next line is a safety belt
            if(parent.tagName.toUpperCase() == "BODY")
                return null;
        }

        return parent;
    };


    /**
     * Make sure there is at least one visible row available in DGF
     * to edit in all the time.
     *
     * We need a lot of special logic for the case where
     * we have empty datagridfield and need to have one OPTIONAL
     * row present there for the editing when the user opens
     * the form for the first time.
     *
     * There are cases where one doesn't want to have the count of DGF
     * rows to go down to zero. Otherwise there no insert handle left
     * on the edit mode and the user cannot add any more rows.
     *
     * One should case is when
     *
     * - DGF is empty on new form
     *
     * - Auto append is set to false (initial row is not visible)
     *
     * We fix this situation by checking the available rows
     * and generating one empty AA row if needed.
     *
     * ... or simply when the user removes all the rows
     *
     * @param {Object} tbody DOM object of <tbody>
     */
    dataGridField2Functions.ensureMinimumRows = function(tbody) {
        var rows = this.getRows(tbody);
        var filteredRows = this.getVisibleRows(tbody);
        var self = this;

        // Rows = 0 -> make one AA row available
        if(filteredRows.length === 0) {
            // XXX: make the function call signatures more sane
            var child = rows[0];
            this.autoInsertRow(child, true);
            return true;
        }
        return false;
    },


    /**
     * When DOM model is ready execute this actions to wire up page logic.
     */
    dataGridField2Functions.init = function() {

        // Reindex all rows to get proper row classes on them
        $(".datagridwidget-body").each(function() {

            // Initialize widget data on <tbody>
            // We keep some mode attributes around
            var $this = $(this);
            var aa;

            // Check if this widget is in auto-append mode
            // and store for later usage
            aa = $this.children(".auto-append").size() > 0;
            $this.data("auto-append", aa);

            // Hint CSS
            if(aa) {
                $this.addClass("datagridwidget-body-auto-append");
            } else {
                $this.addClass("datagridwidget-body-non-auto-append");
            }

            dataGridField2Functions.updateOrderIndex(this, false);

            if(!aa) {
                dataGridField2Functions.ensureMinimumRows(this);
            }
        });

        // Bind the handlers to the auto append rows
        // Use namespaced jQuery events to avoid unbind() conflicts later on
        $('.auto-append .datagridwidget-cell, .auto-append .datagridwidget-block-edit-cell').bind("change.dgf", $.proxy(dataGridField2Functions.onInsert, dataGridField2Functions));

        $(document).trigger("afterdatagridfieldinit");
    };


    $(document).ready(dataGridField2Functions.init);

    // Export module for customizers to mess around
    window.dataGridField2Functions = dataGridField2Functions;


});


/* - ++resource++govbr.busca/bundle.js - */
var govBrBusca=function(){"use strict";function a(){}function t(a){return a()}function e(){return Object.create(null)}function i(a){a.forEach(t)}function o(a){return"function"==typeof a}function r(a,t){return a!=a?t==t:a!==t||a&&"object"==typeof a||"function"==typeof a}function n(a,t){a.appendChild(t)}function c(a,t,e){a.insertBefore(t,e||null)}function s(a){a.parentNode.removeChild(a)}function l(a,t){for(let e=0;e<a.length;e+=1)a[e]&&a[e].d(t)}function d(a){return document.createElement(a)}function u(a){return document.createTextNode(a)}function m(){return u(" ")}function g(){return u("")}function p(a,t,e,i){return a.addEventListener(t,e,i),()=>a.removeEventListener(t,e,i)}function f(a,t,e){null==e?a.removeAttribute(t):a.setAttribute(t,e)}function v(a,t){t=""+t,a.data!==t&&(a.data=t)}function h(a,t){for(let e=0;e<a.options.length;e+=1){const i=a.options[e];i.selected=~t.indexOf(i.__value)}}function $(a){return[].map.call(a.querySelectorAll(":checked"),a=>a.__value)}function _(a,t,e){a.classList[e?"add":"remove"](t)}let F;function b(a){F=a}function S(a){(function(){if(!F)throw new Error("Function called outside component initialization");return F})().$$.on_mount.push(a)}const x=[],B=Promise.resolve();let A=!1;const I=[],N=[],O=[];function P(a){I.push(a)}function T(a){N.push(a)}function w(a){O.push(a)}function j(){const a=new Set;do{for(;x.length;){const a=x.shift();b(a),y(a.$$)}for(;I.length;)I.shift()();for(;N.length;){const t=N.pop();a.has(t)||(t(),a.add(t))}}while(x.length);for(;O.length;)O.pop()();A=!1}function y(a){a.fragment&&(a.update(a.dirty),i(a.before_render),a.fragment.p(a.dirty,a.ctx),a.dirty=null,a.after_render.forEach(T))}let k;function R(){k={remaining:0,callbacks:[]}}function C(){k.remaining||i(k.callbacks)}function z(a){k.callbacks.push(a)}function M(a,t,e){-1!==a.$$.props.indexOf(t)&&(a.$$.bound[t]=e,e(a.$$.ctx[t]))}function G(a,e,r){const n=a.$$,c=n.fragment,s=n.on_mount,l=n.on_destroy,d=n.after_render;c.m(e,r),T(()=>{const e=s.map(t).filter(o);l?l.push(...e):i(e),a.$$.on_mount=[]}),d.forEach(T)}function U(a,t){a.$$.dirty||(x.push(a),A||(A=!0,B.then(j)),a.$$.dirty=e()),a.$$.dirty[t]=!0}function E(t,o,r,n,c,s){const l=F;b(t);const d=o.props||{},u=t.$$={fragment:null,ctx:null,props:s,update:a,not_equal:c,bound:e(),on_mount:[],on_destroy:[],before_render:[],after_render:[],context:new Map(l?l.$$.context:[]),callbacks:e(),dirty:null};let m=!1;var g;u.ctx=r?r(t,d,(a,e)=>{u.ctx&&c(u.ctx[a],u.ctx[a]=e)&&(u.bound[a]&&u.bound[a](e),m&&U(t,a))}):d,u.update(),m=!0,i(u.before_render),u.fragment=n(u.ctx),o.target&&(o.hydrate?u.fragment.l((g=o.target,Array.from(g.childNodes))):u.fragment.c(),o.intro&&t.$$.fragment.i&&t.$$.fragment.i(),G(t,o.target,o.anchor),j()),b(l)}class L{$destroy(){var t,e;e=!0,(t=this).$$&&(i(t.$$.on_destroy),t.$$.fragment.d(e),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={}),this.$destroy=a}$on(a,t){const e=this.$$.callbacks[a]||(this.$$.callbacks[a]=[]);return e.push(t),()=>{const a=e.indexOf(t);-1!==a&&e.splice(a,1)}}$set(){}}function D(a,t,e){const i=Object.create(a);return i.tag=t[e],i}function q(a){var t,e,i=a.item.description;return{c(){t=d("span"),e=u(i),t.className="descricao"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.item&&i!==(i=t.item.description)&&v(e,i)},d(a){a&&s(t)}}}function H(a){for(var t,e,i=a.item.tags,o=[],r=0;r<i.length;r+=1)o[r]=V(D(a,i,r));return{c(){t=d("ul"),e=u("Tags:\n        ");for(var a=0;a<o.length;a+=1)o[a].c();t.className="tags-noticias"},m(a,i){c(a,t,i),n(t,e);for(var r=0;r<o.length;r+=1)o[r].m(t,null)},p(a,e){if(a.item){i=e.item.tags;for(var r=0;r<i.length;r+=1){const n=D(e,i,r);o[r]?o[r].p(a,n):(o[r]=V(n),o[r].c(),o[r].m(t,null))}for(;r<o.length;r+=1)o[r].d(1);o.length=i.length}},d(a){a&&s(t),l(o,a)}}}function V(a){var t,e,i,o,r=a.tag;function l(...t){return a.click_handler(a,...t)}return{c(){t=d("li"),e=d("a"),i=u(r),o=p(e,"click",l)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(t,e){a=e,t.item&&r!==(r=a.tag)&&v(i,r)},d(a){a&&s(t),o()}}}function J(a){var t,e;return{c(){t=d("span"),e=u(a.createdAtFormatted),t.className="data"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.createdAtFormatted&&v(e,t.createdAtFormatted)},d(a){a&&s(t)}}}function K(a){var t,e;return{c(){t=d("span"),e=u(a.modifiedAtFormatted),t.className="data"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.modifiedAtFormatted&&v(e,t.modifiedAtFormatted)},d(a){a&&s(t)}}}function Q(t){var e,i,o,r,l,p,f,h,$=t.item.title?t.item.title:t.item.contentUrl,_=t.item.description&&q(t),F=t.item.tags&&t.item.tags.length>0&&H(t);function b(a){return a.item.modifiedAt?K:a.item.createdAt?J:void 0}var S=b(t),x=S&&S(t);return{c(){e=d("span"),i=d("a"),o=u($),l=m(),_&&_.c(),p=m(),F&&F.c(),f=m(),x&&x.c(),h=g(),i.target="_blank",i.href=r=t.item.contentUrl,e.className="titulo"},m(a,t){c(a,e,t),n(e,i),n(i,o),c(a,l,t),_&&_.m(a,t),c(a,p,t),F&&F.m(a,t),c(a,f,t),x&&x.m(a,t),c(a,h,t)},p(a,t){a.item&&$!==($=t.item.title?t.item.title:t.item.contentUrl)&&v(o,$),a.item&&r!==(r=t.item.contentUrl)&&(i.href=r),t.item.description?_?_.p(a,t):((_=q(t)).c(),_.m(p.parentNode,p)):_&&(_.d(1),_=null),t.item.tags&&t.item.tags.length>0?F?F.p(a,t):((F=H(t)).c(),F.m(f.parentNode,f)):F&&(F.d(1),F=null),S===(S=b(t))&&x?x.p(a,t):(x&&x.d(1),(x=S&&S(t))&&(x.c(),x.m(h.parentNode,h)))},i:a,o:a,d(a){a&&(s(e),s(l)),_&&_.d(a),a&&s(p),F&&F.d(a),a&&s(f),x&&x.d(a),a&&s(h)}}}function W(a,t,e){let i,o,r,{item:n,tagSelecionada:c}=t;function s(a){e("tagSelecionada",c=a)}return a.$set=(a=>{"item"in a&&e("item",n=a.item),"tagSelecionada"in a&&e("tagSelecionada",c=a.tagSelecionada)}),a.$$.update=((a={item:1})=>{a.item&&e("base64Image",i=n&&n.encodedImage?`data:image/jpeg;base64, ${n.encodedImage}`:""),a.item&&e("createdAtFormatted",o=new Date(n.createdAt).toLocaleString()),a.item&&e("modifiedAtFormatted",r=new Date(n.modifiedAt).toLocaleString())}),{item:n,tagSelecionada:c,selecionarTag:s,createdAtFormatted:o,modifiedAtFormatted:r,click_handler:function({tag:a},t){return s(a)}}}class X extends L{constructor(a){super(),E(this,a,W,Q,r,["item","tagSelecionada"])}}function Y(a,t,e){const i=Object.create(a);return i.tag=t[e],i}function Z(a){var t,e,i=a.item.description;return{c(){t=d("span"),e=u(i),t.className="descricao"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.item&&i!==(i=t.item.description)&&v(e,i)},d(a){a&&s(t)}}}function aa(a){for(var t,e,i=a.item.tags,o=[],r=0;r<i.length;r+=1)o[r]=ta(Y(a,i,r));return{c(){t=d("ul"),e=u("Tags:\n        ");for(var a=0;a<o.length;a+=1)o[a].c();t.className="tags-noticias"},m(a,i){c(a,t,i),n(t,e);for(var r=0;r<o.length;r+=1)o[r].m(t,null)},p(a,e){if(a.item){i=e.item.tags;for(var r=0;r<i.length;r+=1){const n=Y(e,i,r);o[r]?o[r].p(a,n):(o[r]=ta(n),o[r].c(),o[r].m(t,null))}for(;r<o.length;r+=1)o[r].d(1);o.length=i.length}},d(a){a&&s(t),l(o,a)}}}function ta(a){var t,e,i,o=a.tag;return{c(){t=d("li"),e=d("a"),i=u(o)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(a,t){a.item&&o!==(o=t.tag)&&v(i,o)},d(a){a&&s(t)}}}function ea(a){var t,e;return{c(){t=d("span"),e=u(a.createdAtFormatted),t.className="data"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.createdAtFormatted&&v(e,t.createdAtFormatted)},d(a){a&&s(t)}}}function ia(a){var t,e;return{c(){t=d("span"),e=u(a.modifiedAtFormatted),t.className="data"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.modifiedAtFormatted&&v(e,t.modifiedAtFormatted)},d(a){a&&s(t)}}}function oa(t){var e,i,o,r,l,p,f,h,$=t.item.title?t.item.title:t.item.contentUrl,_=t.item.description&&Z(t),F=t.item.tags&&t.item.tags.length>0&&aa(t);function b(a){return a.item.modifiedAt?ia:a.item.createdAt?ea:void 0}var S=b(t),x=S&&S(t);return{c(){e=d("span"),i=d("a"),o=u($),l=m(),_&&_.c(),p=m(),F&&F.c(),f=m(),x&&x.c(),h=g(),i.target="_blank",i.href=r=t.item.contentUrl,e.className="titulo"},m(a,t){c(a,e,t),n(e,i),n(i,o),c(a,l,t),_&&_.m(a,t),c(a,p,t),F&&F.m(a,t),c(a,f,t),x&&x.m(a,t),c(a,h,t)},p(a,t){a.item&&$!==($=t.item.title?t.item.title:t.item.contentUrl)&&v(o,$),a.item&&r!==(r=t.item.contentUrl)&&(i.href=r),t.item.description?_?_.p(a,t):((_=Z(t)).c(),_.m(p.parentNode,p)):_&&(_.d(1),_=null),t.item.tags&&t.item.tags.length>0?F?F.p(a,t):((F=aa(t)).c(),F.m(f.parentNode,f)):F&&(F.d(1),F=null),S===(S=b(t))&&x?x.p(a,t):(x&&x.d(1),(x=S&&S(t))&&(x.c(),x.m(h.parentNode,h)))},i:a,o:a,d(a){a&&(s(e),s(l)),_&&_.d(a),a&&s(p),F&&F.d(a),a&&s(f),x&&x.d(a),a&&s(h)}}}function ra(a,t,e){let i,o,r,{item:n}=t;return a.$set=(a=>{"item"in a&&e("item",n=a.item)}),a.$$.update=((a={item:1})=>{a.item&&e("base64Image",i=n&&n.encodedImage?`data:image/jpeg;base64, ${n.encodedImage}`:""),a.item&&e("createdAtFormatted",o=new Date(n.createdAt).toLocaleString()),a.item&&e("modifiedAtFormatted",r=new Date(n.modifiedAt).toLocaleString())}),{item:n,createdAtFormatted:o,modifiedAtFormatted:r}}class na extends L{constructor(a){super(),E(this,a,ra,oa,r,["item"])}}function ca(a,t,e){const i=Object.create(a);return i.tag=t[e],i}function sa(a){var t,e,i,o=a.item.sigla;return{c(){t=u("("),e=u(o),i=u(")")},m(a,o){c(a,t,o),c(a,e,o),c(a,i,o)},p(a,t){a.item&&o!==(o=t.item.sigla)&&v(e,o)},d(a){a&&(s(t),s(e),s(i))}}}function la(a){var t,e,i=a.item.description;return{c(){t=d("span"),e=u(i),t.className="descricao"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.item&&i!==(i=t.item.description)&&v(e,i)},d(a){a&&s(t)}}}function da(a){var t,e,i=a.nomesCategorias.join(", ");return{c(){t=d("span"),e=u(i),t.className="categoria"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.nomesCategorias&&i!==(i=t.nomesCategorias.join(", "))&&v(e,i)},d(a){a&&s(t)}}}function ua(a){var t,e,i=a.nomesOrgaos.join(", ");return{c(){t=d("span"),e=u(i),t.className="orgao"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.nomesOrgaos&&i!==(i=t.nomesOrgaos.join(", "))&&v(e,i)},d(a){a&&s(t)}}}function ma(a){var t,e,i,o=a.item.nomesPopulares.join(", ");return{c(){t=d("span"),e=u("Você pode também conhecer este serviço como: "),i=u(o),t.className="nomes_populares"},m(a,o){c(a,t,o),n(t,e),n(t,i)},p(a,t){a.item&&o!==(o=t.item.nomesPopulares.join(", "))&&v(i,o)},d(a){a&&s(t)}}}function ga(a){for(var t,e,i=a.item.tags,o=[],r=0;r<i.length;r+=1)o[r]=pa(ca(a,i,r));return{c(){t=d("ul"),e=u("Tags:\n        ");for(var a=0;a<o.length;a+=1)o[a].c();t.className="tags-noticias"},m(a,i){c(a,t,i),n(t,e);for(var r=0;r<o.length;r+=1)o[r].m(t,null)},p(a,e){if(a.item){i=e.item.tags;for(var r=0;r<i.length;r+=1){const n=ca(e,i,r);o[r]?o[r].p(a,n):(o[r]=pa(n),o[r].c(),o[r].m(t,null))}for(;r<o.length;r+=1)o[r].d(1);o.length=i.length}},d(a){a&&s(t),l(o,a)}}}function pa(a){var t,e,i,o=a.tag;return{c(){t=d("li"),e=d("a"),i=u(o)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(a,t){a.item&&o!==(o=t.tag)&&v(i,o)},d(a){a&&s(t)}}}function fa(a){var t,e;return{c(){t=d("span"),e=u(a.createdAtFormatted),t.className="data"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.createdAtFormatted&&v(e,t.createdAtFormatted)},d(a){a&&s(t)}}}function va(a){var t,e;return{c(){t=d("span"),e=u(a.modifiedAtFormatted),t.className="data"},m(a,i){c(a,t,i),n(t,e)},p(a,t){a.modifiedAtFormatted&&v(e,t.modifiedAtFormatted)},d(a){a&&s(t)}}}function ha(t){var e,i,o,r,l,p,f,h,$,_,F,b,S=t.item.title?t.item.title:t.item.contentUrl,x=t.item.sigla&&sa(t),B=t.item.description&&la(t),A=t.nomesCategorias&&da(t),I=t.nomesOrgaos&&ua(t),N=t.item.nomesPopulares&&ma(t),O=t.item.tags&&t.item.tags.length>0&&ga(t);function P(a){return a.item.modifiedAt?va:a.item.createdAt?fa:void 0}var T=P(t),w=T&&T(t);return{c(){e=d("span"),i=d("a"),o=u(S),l=m(),x&&x.c(),p=m(),B&&B.c(),f=m(),A&&A.c(),h=m(),I&&I.c(),$=m(),N&&N.c(),_=m(),O&&O.c(),F=m(),w&&w.c(),b=g(),i.target="_blank",i.href=r=t.item.contentUrl,e.className="titulo"},m(a,t){c(a,e,t),n(e,i),n(i,o),n(e,l),x&&x.m(e,null),c(a,p,t),B&&B.m(a,t),c(a,f,t),A&&A.m(a,t),c(a,h,t),I&&I.m(a,t),c(a,$,t),N&&N.m(a,t),c(a,_,t),O&&O.m(a,t),c(a,F,t),w&&w.m(a,t),c(a,b,t)},p(a,t){a.item&&S!==(S=t.item.title?t.item.title:t.item.contentUrl)&&v(o,S),a.item&&r!==(r=t.item.contentUrl)&&(i.href=r),t.item.sigla?x?x.p(a,t):((x=sa(t)).c(),x.m(e,null)):x&&(x.d(1),x=null),t.item.description?B?B.p(a,t):((B=la(t)).c(),B.m(f.parentNode,f)):B&&(B.d(1),B=null),t.nomesCategorias?A?A.p(a,t):((A=da(t)).c(),A.m(h.parentNode,h)):A&&(A.d(1),A=null),t.nomesOrgaos?I?I.p(a,t):((I=ua(t)).c(),I.m($.parentNode,$)):I&&(I.d(1),I=null),t.item.nomesPopulares?N?N.p(a,t):((N=ma(t)).c(),N.m(_.parentNode,_)):N&&(N.d(1),N=null),t.item.tags&&t.item.tags.length>0?O?O.p(a,t):((O=ga(t)).c(),O.m(F.parentNode,F)):O&&(O.d(1),O=null),T===(T=P(t))&&w?w.p(a,t):(w&&w.d(1),(w=T&&T(t))&&(w.c(),w.m(b.parentNode,b)))},i:a,o:a,d(a){a&&s(e),x&&x.d(),a&&s(p),B&&B.d(a),a&&s(f),A&&A.d(a),a&&s(h),I&&I.d(a),a&&s($),N&&N.d(a),a&&s(_),O&&O.d(a),a&&s(F),w&&w.d(a),a&&s(b)}}}function $a(a,t,e){let i,o,r,n,c,{item:s}=t;return a.$set=(a=>{"item"in a&&e("item",s=a.item)}),a.$$.update=((a={item:1})=>{a.item&&e("base64Image",i=s&&s.encodedImage?`data:image/jpeg;base64, ${s.encodedImage}`:""),a.item&&e("nomesCategorias",o=s.idsCategorias.map(a=>window.categoriasFiltro[a])),a.item&&e("nomesOrgaos",r=s.idsOrgaos.map(a=>window.orgaosFiltro[a])),a.item&&e("createdAtFormatted",n=new Date(s.createdAt).toLocaleString()),a.item&&e("modifiedAtFormatted",c=new Date(s.modifiedAt).toLocaleString())}),{item:s,nomesCategorias:o,nomesOrgaos:r,createdAtFormatted:n,modifiedAtFormatted:c}}class _a extends L{constructor(a){super(),E(this,a,$a,ha,r,["item"])}}function Fa(a){var t,e;function i(e){a.tipopadrao_tagSelecionada_binding.call(null,e),t=!0,w(()=>t=!1)}let o={item:a.item};void 0!==a.tagSelecionada&&(o.tagSelecionada=a.tagSelecionada);var r=new X({props:o});return P(()=>M(r,"tagSelecionada",i)),{c(){r.$$.fragment.c()},m(a,t){G(r,a,t),e=!0},p(a,e){var i={};a.item&&(i.item=e.item),!t&&a.tagSelecionada&&(i.tagSelecionada=e.tagSelecionada),r.$set(i)},i(a){e||(r.$$.fragment.i(a),e=!0)},o(a){r.$$.fragment.o(a),e=!1},d(a){r.$destroy(a)}}}function ba(a){var t,e=new na({props:{item:a.item}});return{c(){e.$$.fragment.c()},m(a,i){G(e,a,i),t=!0},p(a,t){var i={};a.item&&(i.item=t.item),e.$set(i)},i(a){t||(e.$$.fragment.i(a),t=!0)},o(a){e.$$.fragment.o(a),t=!1},d(a){e.$destroy(a)}}}function Sa(a){var t,e=new _a({props:{item:a.item}});return{c(){e.$$.fragment.c()},m(a,i){G(e,a,i),t=!0},p(a,t){var i={};a.item&&(i.item=t.item),e.$set(i)},i(a){t||(e.$$.fragment.i(a),t=!0)},o(a){e.$$.fragment.o(a),t=!1},d(a){e.$destroy(a)}}}function xa(a){var t,e,i,o,r=[Sa,ba,Fa],n=[];function l(a){return"Serviço"==a.categoria.descricao||"Servico"==a.categoria.descricao?0:"Midia"==a.categoria.descricao||"Mídia"==a.categoria.descricao?1:2}return e=l(a),i=n[e]=r[e](a),{c(){t=d("span"),i.c()},m(a,i){c(a,t,i),n[e].m(t,null),o=!0},p(a,o){var c=e;(e=l(o))===c?n[e].p(a,o):(R(),z(()=>{n[c].d(1),n[c]=null}),i.o(1),C(),(i=n[e])||(i=n[e]=r[e](o)).c(),i.i(1),i.m(t,null))},i(a){o||(i&&i.i(),o=!0)},o(a){i&&i.o(),o=!1},d(a){a&&s(t),n[e].d()}}}function Ba(a,t,e){let i,{categoria:o,item:r={},tagSelecionada:n}=t;return a.$set=(a=>{"categoria"in a&&e("categoria",o=a.categoria),"item"in a&&e("item",r=a.item),"tagSelecionada"in a&&e("tagSelecionada",n=a.tagSelecionada)}),a.$$.update=((a={item:1})=>{a.item&&e("base64Image",i=r.encodedImage?`data:image/jpeg;base64, ${r.encodedImage}`:"")}),{categoria:o,item:r,tagSelecionada:n,tipopadrao_tagSelecionada_binding:function(a){e("tagSelecionada",n=a)}}}class Aa extends L{constructor(a){super(),E(this,a,Ba,xa,r,["categoria","item","tagSelecionada"])}}var Ia=function(a){if("string"==typeof a)return a;var t=[];for(var e in a)a.hasOwnProperty(e)&&t.push(encodeURIComponent(e)+"="+encodeURIComponent(a[e]));return t.join("&")};function Na(a){let t=Object.assign({},a);var e=new URL(t.urlBase+"api/busca"),i={q:t.search};return t.ordenacao&&("string"==typeof t.ordenacao?i.ordenacao=t.ordenacao:i.ordenacao=t.ordenacao.join("|")),t.somenteEsteSite&&(i.site=t.urlPortal),t.categoriasFiltro&&(i.categoriasFiltro=t.categoriasFiltro.join("|")),t.orgaosFiltro&&(i.orgaosFiltro=t.orgaosFiltro.join("|")),t.tipos&&(i.tipo=t.tipos.join("|")),t.tiposFiltro&&t.tiposFiltro.length>0&&(i.tipo=t.tiposFiltro.join("|")),t.dataInicio&&(i.dataInicio=t.dataInicio.replace("_","")),t.dataTermino&&(i.dataTermino=t.dataTermino.replace("_","")),t.total?i.total=!0:(i.pagina=t.pagina,i.tam_pagina=t.tamanhoPagina),e.search=Ia(i),fetch(e).then(a=>a.json())}function Oa(a,t,e){const i=Object.create(a);return i.item=t[e],i}function Pa(a){for(var t,e,i,o,r=a.resultado.items,u=[],g=0;g<r.length;g+=1)u[g]=Ta(Oa(a,r,g));function p(a,t,e){u[a]&&(t&&z(()=>{u[a].d(t),u[a]=null}),u[a].o(e))}var f=a.totalPaginas>1&&wa(a);return{c(){t=d("span"),e=d("ul");for(var a=0;a<u.length;a+=1)u[a].c();i=m(),f&&f.c(),e.className="searchResults noticias"},m(a,r){c(a,t,r),n(t,e);for(var s=0;s<u.length;s+=1)u[s].m(e,null);n(t,i),f&&f.m(t,null),o=!0},p(a,i){if(a.categoria||a.resultado||a.tagSelecionada){r=i.resultado.items;for(var o=0;o<r.length;o+=1){const t=Oa(i,r,o);u[o]?(u[o].p(a,t),u[o].i(1)):(u[o]=Ta(t),u[o].c(),u[o].i(1),u[o].m(e,null))}for(R();o<u.length;o+=1)p(o,1,1);C()}i.totalPaginas>1?f?f.p(a,i):((f=wa(i)).c(),f.m(t,null)):f&&(f.d(1),f=null)},i(a){if(!o){for(var t=0;t<r.length;t+=1)u[t].i();o=!0}},o(a){u=u.filter(Boolean);for(let a=0;a<u.length;a+=1)p(a,0);o=!1},d(a){a&&s(t),l(u,a),f&&f.d()}}}function Ta(a){var t,e,i;function o(t){a.itemresultado_tagSelecionada_binding.call(null,t),e=!0,w(()=>e=!1)}let r={categoria:a.categoria,item:a.item};void 0!==a.tagSelecionada&&(r.tagSelecionada=a.tagSelecionada);var n=new Aa({props:r});return P(()=>M(n,"tagSelecionada",o)),{c(){t=d("li"),n.$$.fragment.c()},m(a,e){c(a,t,e),G(n,t,null),i=!0},p(a,t){var i={};a.categoria&&(i.categoria=t.categoria),a.resultado&&(i.item=t.item),!e&&a.tagSelecionada&&(i.tagSelecionada=t.tagSelecionada),n.$set(i)},i(a){i||(n.$$.fragment.i(a),i=!0)},o(a){n.$$.fragment.o(a),i=!1},d(a){a&&s(t),n.$destroy()}}}function wa(a){var t,e,i,o,r,l,g,p,f,h,$=a.paramsAtuais.pagina,_=a.podeIrParaOffset(-1)&&ja(a),F=a.podeIrParaOffset(-2)&&ya(a),b=a.podeIrParaOffset(-1)&&ka(a),S=a.podeIrParaOffset(1)&&Ra(a),x=a.podeIrParaOffset(2)&&Ca(a),B=a.podeIrParaOffset(1)&&za(a);return{c(){t=d("ul"),_&&_.c(),e=m(),F&&F.c(),i=m(),b&&b.c(),o=m(),r=d("li"),l=d("span"),g=u($),p=m(),S&&S.c(),f=m(),x&&x.c(),h=m(),B&&B.c(),t.className="paginacao listingBar"},m(a,s){c(a,t,s),_&&_.m(t,null),n(t,e),F&&F.m(t,null),n(t,i),b&&b.m(t,null),n(t,o),n(t,r),n(r,l),n(l,g),n(t,p),S&&S.m(t,null),n(t,f),x&&x.m(t,null),n(t,h),B&&B.m(t,null)},p(a,r){r.podeIrParaOffset(-1)?_||((_=ja(r)).c(),_.m(t,e)):_&&(_.d(1),_=null),r.podeIrParaOffset(-2)?F?F.p(a,r):((F=ya(r)).c(),F.m(t,i)):F&&(F.d(1),F=null),r.podeIrParaOffset(-1)?b?b.p(a,r):((b=ka(r)).c(),b.m(t,o)):b&&(b.d(1),b=null),a.paramsAtuais&&$!==($=r.paramsAtuais.pagina)&&v(g,$),r.podeIrParaOffset(1)?S?S.p(a,r):((S=Ra(r)).c(),S.m(t,f)):S&&(S.d(1),S=null),r.podeIrParaOffset(2)?x?x.p(a,r):((x=Ca(r)).c(),x.m(t,h)):x&&(x.d(1),x=null),r.podeIrParaOffset(1)?B||((B=za(r)).c(),B.m(t,null)):B&&(B.d(1),B=null)},d(a){a&&s(t),_&&_.d(),F&&F.d(),b&&b.d(),S&&S.d(),x&&x.d(),B&&B.d()}}}function ja(a){var t,e,i;return{c(){t=d("li"),(e=d("a")).textContent="« Anterior",e.className="proximo",i=p(e,"click",a.click_handler)},m(a,i){c(a,t,i),n(t,e)},d(a){a&&s(t),i()}}}function ya(a){var t,e,i,o,r=a.paramsAtuais.pagina-2;return{c(){t=d("li"),e=d("a"),i=u(r),o=p(e,"click",a.click_handler_1)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(a,t){a.paramsAtuais&&r!==(r=t.paramsAtuais.pagina-2)&&v(i,r)},d(a){a&&s(t),o()}}}function ka(a){var t,e,i,o,r=a.paramsAtuais.pagina-1;return{c(){t=d("li"),e=d("a"),i=u(r),o=p(e,"click",a.click_handler_2)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(a,t){a.paramsAtuais&&r!==(r=t.paramsAtuais.pagina-1)&&v(i,r)},d(a){a&&s(t),o()}}}function Ra(a){var t,e,i,o,r=a.paramsAtuais.pagina+1;return{c(){t=d("li"),e=d("a"),i=u(r),o=p(e,"click",a.click_handler_3)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(a,t){a.paramsAtuais&&r!==(r=t.paramsAtuais.pagina+1)&&v(i,r)},d(a){a&&s(t),o()}}}function Ca(a){var t,e,i,o,r=a.paramsAtuais.pagina+2;return{c(){t=d("li"),e=d("a"),i=u(r),o=p(e,"click",a.click_handler_4)},m(a,o){c(a,t,o),n(t,e),n(e,i)},p(a,t){a.paramsAtuais&&r!==(r=t.paramsAtuais.pagina+2)&&v(i,r)},d(a){a&&s(t),o()}}}function za(a){var t,e,i;return{c(){t=d("li"),(e=d("a")).textContent="Próximo »",e.className="proximo",i=p(e,"click",a.click_handler_5)},m(a,i){c(a,t,i),n(t,e)},d(a){a&&s(t),i()}}}function Ma(a){var t,e,i=a.active&&a.resultado&&Pa(a);return{c(){i&&i.c(),t=g()},m(a,o){i&&i.m(a,o),c(a,t,o),e=!0},p(a,e){e.active&&e.resultado?i?(i.p(a,e),i.i(1)):((i=Pa(e)).c(),i.i(1),i.m(t.parentNode,t)):i&&(R(),z(()=>{i.d(1),i=null}),i.o(1),C())},i(a){e||(i&&i.i(),e=!0)},o(a){i&&i.o(),e=!1},d(a){i&&i.d(a),a&&s(t)}}}function Ga(a,t,e){let i,o,r,n,c,{categoria:s={},paramsBusca:l,active:d=!1,tagSelecionada:u}=t,m="";function g(a){Na(i).then(t=>{a?e("resultado",o=Object.assign({},o,{items:t.items})):(window.scrollTo(0,0),e("resultado",o=t)),e("mensagemErro",m="")},a=>{e("mensagemErro",m="Não foi possível realizar a busca. Serviço temporariamente indisponível.")})}function p(a){var t;return t=i.pagina+a,e("paramsAtuais",i=Object.assign({},i,{pagina:t})),g(!1),!1}return a.$set=(a=>{"categoria"in a&&e("categoria",s=a.categoria),"paramsBusca"in a&&e("paramsBusca",l=a.paramsBusca),"active"in a&&e("active",d=a.active),"tagSelecionada"in a&&e("tagSelecionada",u=a.tagSelecionada)}),a.$$.update=((a={paramsBusca:1,categoria:1,active:1,resultado:1,paramsAtuais:1,totalPaginas:1})=>{(a.paramsBusca||a.categoria||a.active)&&l&&(e("paramsAtuais",i=Object.assign({},{pagina:1,tipos:s.tipos},l)),d&&g()),(a.resultado||a.categoria||a.paramsAtuais)&&e("totalPaginas",r=o?Math.ceil(s.total/i.tamanhoPagina):0),(a.resultado||a.paramsAtuais)&&e("primeiraPagina",n=o&&1===i.pagina),(a.resultado||a.paramsAtuais||a.totalPaginas)&&e("ultimaPagina",c=o&&i.pagina>=r)}),{categoria:s,paramsBusca:l,active:d,tagSelecionada:u,paramsAtuais:i,resultado:o,irParaOffset:p,podeIrParaOffset:function(a){if(!i)return!1;let t=i.pagina+a;return t>=1&&t<=r},totalPaginas:r,itemresultado_tagSelecionada_binding:function(a){e("tagSelecionada",u=a)},click_handler:function(a){return p(-1)},click_handler_1:function(a){return p(-2)},click_handler_2:function(a){return p(-1)},click_handler_3:function(a){return p(1)},click_handler_4:function(a){return p(2)},click_handler_5:function(a){return p(1)}}}class Ua extends L{constructor(a){super(),E(this,a,Ga,Ma,r,["categoria","paramsBusca","active","tagSelecionada"])}}function Ea(a,t,e){const i=Object.create(a);return i.grupo=t[e],i}function La(a){var t,e,i,o=a.grupo.descricao;return{c(){t=d("option"),e=u(o),t.__value=i=a.grupo.tipos.join("|"),t.value=t.__value},m(a,i){c(a,t,i),n(t,e)},p(a,r){a.grupos&&o!==(o=r.grupo.descricao)&&v(e,o),a.grupos&&i!==(i=r.grupo.tipos.join("|"))&&(t.__value=i),t.value=t.__value},d(a){a&&s(t)}}}function Da(t){for(var e,i,o,r=t.grupos,u=[],m=0;m<r.length;m+=1)u[m]=La(Ea(t,r,m));return{c(){e=d("span"),i=d("select");for(var a=0;a<u.length;a+=1)u[a].c();void 0===t.value&&T(()=>t.select_change_handler.call(i)),i.multiple=!0,o=p(i,"change",t.select_change_handler)},m(a,o){c(a,e,o),n(e,i);for(var r=0;r<u.length;r+=1)u[r].m(i,null);h(i,t.value)},p(a,t){if(a.grupos){r=t.grupos;for(var e=0;e<r.length;e+=1){const o=Ea(t,r,e);u[e]?u[e].p(a,o):(u[e]=La(o),u[e].c(),u[e].m(i,null))}for(;e<u.length;e+=1)u[e].d(1);u.length=r.length}a.value&&h(i,t.value)},i:a,o:a,d(a){a&&s(e),l(u,a),o()}}}function qa(a,t,e){let{grupos:i,value:o}=t;return a.$set=(a=>{"grupos"in a&&e("grupos",i=a.grupos),"value"in a&&e("value",o=a.value)}),{grupos:i,value:o,select_change_handler:function(){o=$(this),e("value",o),e("grupos",i)}}}class Ha extends L{constructor(a){super(),E(this,a,qa,Da,r,["grupos","value"])}}function Va(a,t,e){const i=Object.create(a);return i.categoria=t[e],i.index=e,i}function Ja(a,t,e){const i=Object.create(a);return i.orgaoFiltro=t[e],i}function Ka(a,t,e){const i=Object.create(a);return i.categoriaFiltro=t[e],i}function Qa(a,t,e){const i=Object.create(a);return i.categoria=t[e],i.index=e,i}function Wa(a){var t;function e(a){return a.totalOcorrencias>0?Ya:Xa}var i=e(a),o=i(a);return{c(){t=d("div"),o.c(),t.className="col-sm-12 num-resultado"},m(a,e){c(a,t,e),o.m(t,null)},p(a,r){i===(i=e(r))&&o?o.p(a,r):(o.d(1),(o=i(r))&&(o.c(),o.m(t,null)))},d(a){a&&s(t),o.d()}}}function Xa(t){var e;return{c(){e=u("Nenhuma ocorrência encontrada")},m(a,t){c(a,e,t)},p:a,d(a){a&&s(e)}}}function Ya(a){var t,e,i,o,r=1===a.totalOcorrencias?" Resultado":" Resultados";return{c(){t=d("span"),e=u(a.totalOcorrencias),i=m(),o=u(r)},m(a,r){c(a,t,r),n(t,e),c(a,i,r),c(a,o,r)},p(a,t){a.totalOcorrencias&&v(e,t.totalOcorrencias),a.totalOcorrencias&&r!==(r=1===t.totalOcorrencias?" Resultado":" Resultados")&&v(o,r)},d(a){a&&(s(t),s(i),s(o))}}}function Za(a){var t,e,i,o,r,l,g,f,h,$=a.categoria.descricao,F=a.categoria.total;function b(...t){return a.click_handler(a,...t)}return{c(){t=d("li"),e=d("a"),i=u($),o=m(),r=d("span"),l=u("("),g=u(F),f=u(")"),_(t,"active",a.activeIndex==a.index),h=p(e,"click",b)},m(a,s){c(a,t,s),n(t,e),n(e,i),n(e,o),n(e,r),n(r,l),n(r,g),n(r,f)},p(e,o){a=o,e.abas&&$!==($=a.categoria.descricao)&&v(i,$),e.abas&&F!==(F=a.categoria.total)&&v(g,F),e.activeIndex&&_(t,"active",a.activeIndex==a.index)},d(a){a&&s(t),h()}}}function at(a){var t,e=a.categoria.total>0&&Za(a);return{c(){e&&e.c(),t=g()},m(a,i){e&&e.m(a,i),c(a,t,i)},p(a,i){i.categoria.total>0?e?e.p(a,i):((e=Za(i)).c(),e.m(t.parentNode,t)):e&&(e.d(1),e=null)},d(a){e&&e.d(a),a&&s(t)}}}function tt(a){for(var t,e,i,o,r,u,g=a.isFiltro&&et(a),p=a.abas,f=[],v=0;v<p.length;v+=1)f[v]=dt(Va(a,p,v));function h(a,t,e){f[a]&&(t&&z(()=>{f[a].d(t),f[a]=null}),f[a].o(e))}return{c(){t=d("div"),e=d("div"),i=d("div"),g&&g.c(),o=m(),r=d("div");for(var a=0;a<f.length;a+=1)f[a].c();var n,c;n="display",c="none",i.style.setProperty(n,c),e.className="column col-md-3 filtros",r.className="column col-md-9",t.className="row"},m(a,s){c(a,t,s),n(t,e),n(e,i),g&&g.m(i,null),n(t,o),n(t,r);for(var l=0;l<f.length;l+=1)f[l].m(r,null);u=!0},p(a,t){if(t.isFiltro?g?(g.p(a,t),g.i(1)):((g=et(t)).c(),g.i(1),g.m(i,null)):g&&(R(),z(()=>{g.d(1),g=null}),g.o(1),C()),a.abas||a.paramsBusca||a.activeIndex||a.tagSelecionada){p=t.abas;for(var e=0;e<p.length;e+=1){const i=Va(t,p,e);f[e]?(f[e].p(a,i),f[e].i(1)):(f[e]=dt(i),f[e].c(),f[e].i(1),f[e].m(r,null))}for(R();e<f.length;e+=1)h(e,1,1);C()}},i(a){if(!u){g&&g.i();for(var t=0;t<p.length;t+=1)f[t].i();u=!0}},o(a){g&&g.o(),f=f.filter(Boolean);for(let a=0;a<f.length;a+=1)h(a,0);u=!1},d(a){a&&s(t),g&&g.d(),l(f,a)}}}function et(a){var t,e,i,o,r,n,l,u=a.filtrarCategorias&&it(a),p=a.filtrarOrgaos&&rt(a),f=a.isMidia&&ct(a),v=a.isNoticia&&st(a);return{c(){(t=d("h4")).textContent="Filtrar",e=m(),u&&u.c(),i=m(),p&&p.c(),o=m(),f&&f.c(),r=m(),v&&v.c(),n=g()},m(a,s){c(a,t,s),c(a,e,s),u&&u.m(a,s),c(a,i,s),p&&p.m(a,s),c(a,o,s),f&&f.m(a,s),c(a,r,s),v&&v.m(a,s),c(a,n,s),l=!0},p(a,t){t.filtrarCategorias?u?u.p(a,t):((u=it(t)).c(),u.m(i.parentNode,i)):u&&(u.d(1),u=null),t.filtrarOrgaos?p?p.p(a,t):((p=rt(t)).c(),p.m(o.parentNode,o)):p&&(p.d(1),p=null),t.isMidia?f?(f.p(a,t),f.i(1)):((f=ct(t)).c(),f.i(1),f.m(r.parentNode,r)):f&&(R(),z(()=>{f.d(1),f=null}),f.o(1),C()),t.isNoticia?v?v.p(a,t):((v=st(t)).c(),v.m(n.parentNode,n)):v&&(v.d(1),v=null)},i(a){l||(f&&f.i(),l=!0)},o(a){f&&f.o(),l=!1},d(a){a&&(s(t),s(e)),u&&u.d(a),a&&s(i),p&&p.d(a),a&&s(o),f&&f.d(a),a&&s(r),v&&v.d(a),a&&s(n)}}}function it(a){for(var t,e,i,o,r,u=a.categoriasFiltro,g=[],f=0;f<u.length;f+=1)g[f]=ot(Ka(a,u,f));return{c(){t=d("div"),(e=d("h5")).textContent="Categoria",i=m(),o=d("select");for(var n=0;n<g.length;n+=1)g[n].c();void 0===a.paramsBusca.categoriasFiltro&&T(()=>a.select_change_handler.call(o)),o.multiple=!0,t.className="filtro",r=p(o,"change",a.select_change_handler)},m(r,s){c(r,t,s),n(t,e),n(t,i),n(t,o);for(var l=0;l<g.length;l+=1)g[l].m(o,null);h(o,a.paramsBusca.categoriasFiltro)},p(a,t){if(a.categoriasFiltro){u=t.categoriasFiltro;for(var e=0;e<u.length;e+=1){const i=Ka(t,u,e);g[e]?g[e].p(a,i):(g[e]=ot(i),g[e].c(),g[e].m(o,null))}for(;e<g.length;e+=1)g[e].d(1);g.length=u.length}a.paramsBusca&&h(o,t.paramsBusca.categoriasFiltro)},d(a){a&&s(t),l(g,a),r()}}}function ot(a){var t,e,i,o=a.categoriaFiltro.descricao;return{c(){t=d("option"),e=u(o),t.__value=i=a.categoriaFiltro.id,t.value=t.__value},m(a,i){c(a,t,i),n(t,e)},p(a,r){a.categoriasFiltro&&o!==(o=r.categoriaFiltro.descricao)&&v(e,o),a.categoriasFiltro&&i!==(i=r.categoriaFiltro.id)&&(t.__value=i),t.value=t.__value},d(a){a&&s(t)}}}function rt(a){for(var t,e,i,o,r,u=a.orgaosFiltro,g=[],f=0;f<u.length;f+=1)g[f]=nt(Ja(a,u,f));return{c(){t=d("div"),(e=d("h5")).textContent="Órgão",i=m(),o=d("select");for(var n=0;n<g.length;n+=1)g[n].c();void 0===a.paramsBusca.orgaosFiltro&&T(()=>a.select_change_handler_1.call(o)),o.multiple=!0,t.className="filtro",r=p(o,"change",a.select_change_handler_1)},m(r,s){c(r,t,s),n(t,e),n(t,i),n(t,o);for(var l=0;l<g.length;l+=1)g[l].m(o,null);h(o,a.paramsBusca.orgaosFiltro)},p(a,t){if(a.orgaosFiltro){u=t.orgaosFiltro;for(var e=0;e<u.length;e+=1){const i=Ja(t,u,e);g[e]?g[e].p(a,i):(g[e]=nt(i),g[e].c(),g[e].m(o,null))}for(;e<g.length;e+=1)g[e].d(1);g.length=u.length}a.paramsBusca&&h(o,t.paramsBusca.orgaosFiltro)},d(a){a&&s(t),l(g,a),r()}}}function nt(a){var t,e,i,o=a.orgaoFiltro.descricao;return{c(){t=d("option"),e=u(o),t.__value=i=a.orgaoFiltro.id,t.value=t.__value},m(a,i){c(a,t,i),n(t,e)},p(a,r){a.orgaosFiltro&&o!==(o=r.orgaoFiltro.descricao)&&v(e,o),a.orgaosFiltro&&i!==(i=r.orgaoFiltro.id)&&(t.__value=i),t.value=t.__value},d(a){a&&s(t)}}}function ct(a){var t,e,i,o,r;function l(t){a.grupostipos_value_binding.call(null,t),o=!0,w(()=>o=!1)}let u={grupos:a.gruposMidia};void 0!==a.paramsBusca.tiposFiltro&&(u.value=a.paramsBusca.tiposFiltro);var g=new Ha({props:u});return P(()=>M(g,"value",l)),{c(){t=d("div"),(e=d("h5")).textContent="Tipos de mídia",i=m(),g.$$.fragment.c(),t.className="filtro"},m(a,o){c(a,t,o),n(t,e),n(t,i),G(g,t,null),r=!0},p(a,t){var e={};a.gruposMidia&&(e.grupos=t.gruposMidia),!o&&a.paramsBusca&&(e.value=t.paramsBusca.tiposFiltro),g.$set(e)},i(a){r||(g.$$.fragment.i(a),r=!0)},o(a){g.$$.fragment.o(a),r=!1},d(a){a&&s(t),g.$destroy()}}}function st(a){var t,e,o,r,l,g,v,h,$,_,F;return{c(){t=d("div"),(e=d("h5")).textContent="Período",o=m(),r=d("label"),l=u("De:\n                        "),g=d("input"),v=m(),h=d("label"),$=u("Até:\n                        "),_=d("input"),f(g,"type","date"),g.name="dataInicio",g.id="dataInicio",r.className="parametro",r.htmlFor="dataInicio",f(_,"type","date"),_.name="dataTermino",_.id="dataTermino",h.className="parametro",h.htmlFor="dataTermino",t.className="filtro",F=[p(g,"input",a.input0_input_handler),p(_,"input",a.input1_input_handler)]},m(i,s){c(i,t,s),n(t,e),n(t,o),n(t,r),n(r,l),n(r,g),g.value=a.paramsBusca.dataInicio,n(t,v),n(t,h),n(h,$),n(h,_),_.value=a.paramsBusca.dataTermino},p(a,t){a.paramsBusca&&(g.value=t.paramsBusca.dataInicio),a.paramsBusca&&(_.value=t.paramsBusca.dataTermino)},d(a){a&&s(t),i(F)}}}function lt(a){var t,e;function i(e){a.categoria_tagSelecionada_binding.call(null,e),t=!0,w(()=>t=!1)}let o={paramsBusca:a.paramsBusca,categoria:a.categoria,active:a.activeIndex==a.index};void 0!==a.tagSelecionada&&(o.tagSelecionada=a.tagSelecionada);var r=new Ua({props:o});return P(()=>M(r,"tagSelecionada",i)),{c(){r.$$.fragment.c()},m(a,t){G(r,a,t),e=!0},p(a,e){var i={};a.paramsBusca&&(i.paramsBusca=e.paramsBusca),a.abas&&(i.categoria=e.categoria),a.activeIndex&&(i.active=e.activeIndex==e.index),!t&&a.tagSelecionada&&(i.tagSelecionada=e.tagSelecionada),r.$set(i)},i(a){e||(r.$$.fragment.i(a),e=!0)},o(a){r.$$.fragment.o(a),e=!1},d(a){r.$destroy(a)}}}function dt(a){var t,e,i=a.categoria.total>0&&lt(a);return{c(){i&&i.c(),t=g()},m(a,o){i&&i.m(a,o),c(a,t,o),e=!0},p(a,e){e.categoria.total>0?i?(i.p(a,e),i.i(1)):((i=lt(e)).c(),i.i(1),i.m(t.parentNode,t)):i&&(R(),z(()=>{i.d(1),i=null}),i.o(1),C())},i(a){e||(i&&i.i(),e=!0)},o(a){i&&i.o(),e=!1},d(a){i&&i.d(a),a&&s(t)}}}function ut(a){for(var t,e,i,o,r,u,g,p,f,v,h=a.buscaRealizada&&Wa(a),$=a.abas,_=[],F=0;F<$.length;F+=1)_[F]=at(Qa(a,$,F));var b=a.buscaRealizada&&tt(a);return{c(){t=d("div"),(e=d("div")).innerHTML='<div class="col-md-12 col-sm-10"><h2>Resultados da Busca</h2></div>',i=m(),o=d("div"),h&&h.c(),r=m(),u=d("div"),g=d("div"),p=d("ul");for(var a=0;a<_.length;a+=1)_[a].c();f=m(),b&&b.c(),e.className="row",o.className="row",g.className="column col-md-12",u.className="row abas",t.id="search-results"},m(a,s){c(a,t,s),n(t,e),n(t,i),n(t,o),h&&h.m(o,null),n(t,r),n(t,u),n(u,g),n(g,p);for(var l=0;l<_.length;l+=1)_[l].m(p,null);n(t,f),b&&b.m(t,null),v=!0},p(a,e){if(e.buscaRealizada?h?h.p(a,e):((h=Wa(e)).c(),h.m(o,null)):h&&(h.d(1),h=null),a.abas||a.activeIndex){$=e.abas;for(var i=0;i<$.length;i+=1){const t=Qa(e,$,i);_[i]?_[i].p(a,t):(_[i]=at(t),_[i].c(),_[i].m(p,null))}for(;i<_.length;i+=1)_[i].d(1);_.length=$.length}e.buscaRealizada?b?(b.p(a,e),b.i(1)):((b=tt(e)).c(),b.i(1),b.m(t,null)):b&&(R(),z(()=>{b.d(1),b=null}),b.o(1),C())},i(a){v||(b&&b.i(),v=!0)},o(a){b&&b.o(),v=!1},d(a){a&&s(t),h&&h.d(),l(_,a),b&&b.d()}}}function mt(a,t,e){let i,o,r,n,c,s,l,{categorias:d,categoriasFiltro:u,orgaosFiltro:m,ordenacoes:g,abas:p,gruposTipos:f,paramsBusca:v,activeIndex:h,totalOcorrencias:_,buscaRealizada:F,totalGeral:b,tagSelecionada:S}=t;function x(a){return e("activeIndex",h=a),!1}return a.$set=(a=>{"categorias"in a&&e("categorias",d=a.categorias),"categoriasFiltro"in a&&e("categoriasFiltro",u=a.categoriasFiltro),"orgaosFiltro"in a&&e("orgaosFiltro",m=a.orgaosFiltro),"ordenacoes"in a&&e("ordenacoes",g=a.ordenacoes),"abas"in a&&e("abas",p=a.abas),"gruposTipos"in a&&e("gruposTipos",f=a.gruposTipos),"paramsBusca"in a&&e("paramsBusca",v=a.paramsBusca),"activeIndex"in a&&e("activeIndex",h=a.activeIndex),"totalOcorrencias"in a&&e("totalOcorrencias",_=a.totalOcorrencias),"buscaRealizada"in a&&e("buscaRealizada",F=a.buscaRealizada),"totalGeral"in a&&e("totalGeral",b=a.totalGeral),"tagSelecionada"in a&&e("tagSelecionada",S=a.tagSelecionada)}),a.$$.update=((a={categorias:1,gruposTipos:1,totalGeral:1,activeIndex:1,filtrarCategorias:1,filtrarOrgaos:1,isMidia:1,isNoticia:1})=>{a.categorias&&e("todosTipos",o=d.map(a=>a.tipos).reduce((a,t)=>a.concat(t))),a.categorias&&e("totalGeral",b=(d||[]).map(a=>a.total).reduce((a,t)=>a+t)),(a.categorias||a.gruposTipos)&&d&&(e("gruposMidia",i=f.Midia),e("activeIndex",h=0)),(a.categorias||a.totalGeral||a.activeIndex)&&e("filtrarCategorias",r=d&&b>0&&void 0!==["Todos","Serviços"].find(a=>a===d[h].descricao)),(a.categorias||a.totalGeral||a.activeIndex)&&e("filtrarOrgaos",n=d&&b>0&&void 0!==["Serviços"].find(a=>a===d[h].descricao)),(a.categorias||a.activeIndex)&&e("isMidia",c=d&&void 0!==["Midia","Mídia"].find(a=>a==d[h].descricao)),(a.categorias||a.activeIndex)&&e("isNoticia",s=d&&void 0!==["Noticia","Notícia","Noticias","Notícias"].find(a=>a==d[h].descricao)),(a.filtrarCategorias||a.filtrarOrgaos||a.isMidia||a.isNoticia)&&e("isFiltro",l=r||n||c||s)}),{categorias:d,categoriasFiltro:u,orgaosFiltro:m,ordenacoes:g,abas:p,gruposTipos:f,paramsBusca:v,activeIndex:h,totalOcorrencias:_,buscaRealizada:F,totalGeral:b,tagSelecionada:S,gruposMidia:i,setActiveTab:x,filtrarCategorias:r,filtrarOrgaos:n,isMidia:c,isNoticia:s,isFiltro:l,click_handler:function({index:a},t){return x(a)},select_change_handler:function(){v.categoriasFiltro=$(this),e("paramsBusca",v),e("categoriasFiltro",u)},select_change_handler_1:function(){v.orgaosFiltro=$(this),e("paramsBusca",v),e("categoriasFiltro",u)},grupostipos_value_binding:function(a){v.tiposFiltro=a,e("paramsBusca",v)},input0_input_handler:function(){v.dataInicio=this.value,e("paramsBusca",v),e("categoriasFiltro",u)},input1_input_handler:function(){v.dataTermino=this.value,e("paramsBusca",v),e("categoriasFiltro",u)},categoria_tagSelecionada_binding:function(a){e("tagSelecionada",S=a)}}}class gt extends L{constructor(a){super(),E(this,a,mt,ut,r,["categorias","categoriasFiltro","orgaosFiltro","ordenacoes","abas","gruposTipos","paramsBusca","activeIndex","totalOcorrencias","buscaRealizada","totalGeral","tagSelecionada"])}}function pt(t){return{c:a,m:a,d:a}}function ft(a){var t,e,i;function o(e){a.abascategorias_activeIndex_binding.call(null,e),t=!0,w(()=>t=!1)}function r(t){a.abascategorias_tagSelecionada_binding.call(null,t),e=!0,w(()=>e=!1)}let n={gruposTipos:a.gruposTipos,categorias:a.categorias,ordenacoes:a.ordenacoes,categoriasFiltro:a.categoriasFiltro,orgaosFiltro:a.orgaosFiltro,buscaRealizada:a.buscaRealizada,totalOcorrencias:a.totalGeral,paramsBusca:a.paramsAtuais,abas:a.abas,$$slots:{default:[pt]},$$scope:{ctx:a}};void 0!==a.activeIndex&&(n.activeIndex=a.activeIndex),void 0!==a.tagSelecionada&&(n.tagSelecionada=a.tagSelecionada);var c=new gt({props:n});return P(()=>M(c,"activeIndex",o)),P(()=>M(c,"tagSelecionada",r)),{c(){c.$$.fragment.c()},m(a,t){G(c,a,t),i=!0},p(a,i){var o={};a.gruposTipos&&(o.gruposTipos=i.gruposTipos),a.categorias&&(o.categorias=i.categorias),a.ordenacoes&&(o.ordenacoes=i.ordenacoes),a.categoriasFiltro&&(o.categoriasFiltro=i.categoriasFiltro),a.orgaosFiltro&&(o.orgaosFiltro=i.orgaosFiltro),a.buscaRealizada&&(o.buscaRealizada=i.buscaRealizada),a.totalGeral&&(o.totalOcorrencias=i.totalGeral),a.paramsAtuais&&(o.paramsBusca=i.paramsAtuais),a.abas&&(o.abas=i.abas),a.$$scope&&(o.$$scope={changed:a,ctx:i}),!t&&a.activeIndex&&(o.activeIndex=i.activeIndex),!e&&a.tagSelecionada&&(o.tagSelecionada=i.tagSelecionada),c.$set(o)},i(a){i||(c.$$.fragment.i(a),i=!0)},o(a){c.$$.fragment.o(a),i=!1},d(a){c.$destroy(a)}}}function vt(a,t,e){let i,{urlBase:o,urlPortal:r,categorias:n,categoriasFiltro:c,orgaosFiltro:s,textoBusca:l,ordenacao:d,gruposTipos:u,tamanhoPagina:m}=t,g={search:"",categoriasSelecionadas:[...n],categoriasFiltro:[...c],orgaosFiltro:[...s],somenteEsteSite:!1,ordenacao:"",tiposFiltro:[],dataInicio:"",dataTermino:""},p=!1,f=[],v=0,h={},$=0;const _=n.find(a=>"Todos"===a.descricao);function F(){e("paramsAtuais",h=Object.assign({},g)),e("abas",f=[]),e("activeIndex",v=0),Na(Object.assign({},h,{total:!0,tipos:x})).then(a=>{e("buscaRealizada",p=!0);const t=g.categoriasSelecionadas.map(t=>{const e=a.items.filter(a=>t.tipos.find(t=>t===a.type)),i=e.map(a=>a.total).reduce((a,t)=>a+t,0),o=e.map(a=>a.max_score).reduce((a,t)=>a>t?a:t,0);return Object.assign({},{total:i,maxScore:o},t)});e("totalGeral",$=a.total);t.map(a=>a.max_score).reduce((a,t)=>a>t?a:t,0);e("abas",f=[...t])})}let b,x;return S(()=>{e("abas",f=[]),e("totalGeral",$=0),e("buscaRealizada",p=!1),g.search="",e("paramsBusca",g),e("tagSelecionada",i),g.ordenacao=d,e("paramsBusca",g),e("tagSelecionada",i),g.urlBase=o,e("paramsBusca",g),e("tagSelecionada",i),g.urlPortal=r,e("paramsBusca",g),e("tagSelecionada",i),g.tamanhoPagina=m,e("paramsBusca",g),e("tagSelecionada",i),g.categoriasFiltro=[],e("paramsBusca",g),e("tagSelecionada",i),g.orgaosFiltro=[],e("paramsBusca",g),e("tagSelecionada",i),g.tiposFiltro=[],e("paramsBusca",g),e("tagSelecionada",i),l&&(g.search=l,e("paramsBusca",g),e("tagSelecionada",i),F()),window.categoriasFiltro={},c.forEach(a=>{window.categoriasFiltro[a.id]=a.descricao}),window.orgaosFiltro={},s.forEach(a=>{window.orgaosFiltro[a.id]=a.descricao})}),a.$set=(a=>{"urlBase"in a&&e("urlBase",o=a.urlBase),"urlPortal"in a&&e("urlPortal",r=a.urlPortal),"categorias"in a&&e("categorias",n=a.categorias),"categoriasFiltro"in a&&e("categoriasFiltro",c=a.categoriasFiltro),"orgaosFiltro"in a&&e("orgaosFiltro",s=a.orgaosFiltro),"textoBusca"in a&&e("textoBusca",l=a.textoBusca),"ordenacao"in a&&e("ordenacao",d=a.ordenacao),"gruposTipos"in a&&e("gruposTipos",u=a.gruposTipos),"tamanhoPagina"in a&&e("tamanhoPagina",m=a.tamanhoPagina)}),a.$$.update=((a={tagSelecionada:1,categorias:1,paramsBusca:1})=>{a.tagSelecionada&&i&&(g.search=i,e("paramsBusca",g),e("tagSelecionada",i),document.forms.nolivesearchGadget_form.SearchableText.value=i,F()),(a.categorias||a.paramsBusca)&&e("buscarTodasCategorias",b=n&&g.categoriasSelecionadas.length===n.length),a.categorias&&e("todosTipos",x=_?[..._.tipos]:n.map(a=>a.tipos).reduce((a,t)=>a.concat(t)))}),{urlBase:o,urlPortal:r,categorias:n,categoriasFiltro:c,orgaosFiltro:s,textoBusca:l,ordenacao:d,gruposTipos:u,tamanhoPagina:m,buscaRealizada:p,abas:f,activeIndex:v,tagSelecionada:i,paramsAtuais:h,totalGeral:$,ordenacoes:[{id:"-data",descricao:"Data (mais novos primeiro)"},{id:"data",descricao:"Data (mais antigos primeiro)"},{id:"-relevancia",descricao:"Relevância"}],abascategorias_activeIndex_binding:function(a){e("activeIndex",v=a)},abascategorias_tagSelecionada_binding:function(a){e("tagSelecionada",i=a)}}}return{Busca:class extends L{constructor(a){super(),E(this,a,vt,ft,r,["urlBase","urlPortal","categorias","categoriasFiltro","orgaosFiltro","textoBusca","ordenacao","gruposTipos","tamanhoPagina"])}}}}();
//# sourceMappingURL=bundle.js.map

