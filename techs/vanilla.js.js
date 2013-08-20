'use strict';

var BEM = require('bem'),
    Template = BEM.require('./template');

exports.baseTechName = 'js';

exports.techMixin = {

    getSuffixes : function() {
        return ['vanilla.js'];
    },

    getBuildSuffixes : function() {
        return ['vanilla.js'];
    },

    getBuildSuffixesMap : function() {
        return this.getSuffixes()
            .reduce(function(map, suffix) {
                map[suffix] = [suffix];
                return map;
            }, {});
    },

    getCreateResult : function(path, suffix, vars) {
        /*jshint expr:true*/
        var moduleName = vars.BlockName;
        vars.ElemName &&
            (moduleName += '__' + vars.ElemName);
        vars.ModName &&
            (moduleName += '_' + vars.ModName);
        vars.ModVal &&
            (moduleName += '_' + vars.ModVal);
        vars.ModuleName = moduleName;

        return Template.process([
            '/*global modules:false */',
            '',
            'modules.define("{{bemModuleName}}", function(provide) {',
            '',
            '});',
            ''
        ], vars);
    }

};
