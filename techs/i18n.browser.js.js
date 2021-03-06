'use strict';
var BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-io/fs'),
    LangsMixin = require('./i18n').LangsMixin,
    I18NJS = require('../lib/i18n/i18n-js');



exports.baseTechName = 'browser.js';

exports.techMixin = BEM.util.extend({}, LangsMixin, {

    getBaseTechSuffix: function() {
        return 'js';
    },

    getWeakBuildSuffixesMap: function() {
        var suffixes = {};
        // would be something like
        // {
        //     'js': ['js','browser.js','vanilla.js'],
        //     'en.js': ['js','browser.js','vanilla.js'],
        //     'ru.js': ['js','browser.js','vanilla.js']
        // }

        this.getLangs()
            .map(this.getBuildSuffixForLang, this).concat([this.getBaseTechSuffix()])
            .forEach(function(s) {
                suffixes[s] = [this.getBaseTechSuffix(),'browser.js','vanilla.js'];
            }, this);

        return suffixes;
    },

    getBuildSuffixesMap: function() {
        var suffixes = {};

        this.getLangs()
            .map(this.getBuildSuffixForLang, this).concat([this.getBaseTechSuffix()])
            .forEach(function(s) {
                suffixes[s] = [this.getBaseTechSuffix(),'browser.js'];
            }, this);

        return suffixes;
    },

    getBuildSuffixForLang: function(lang) {
        return lang + '.' + this.getBaseTechSuffix();
    },

    getBuildPaths: function(decl, levels, output) {
        var _this = this,
            source = this.getPath(output, this.getSourceSuffix());
        return Q.all([this.__base(decl, levels), QFS.lastModified(source).invoke('getTime')])
                .spread(function(paths, sourceUpdate) {
                    Object.keys(paths).forEach(function(destSuffix) {
                        if (destSuffix !== _this.getBaseTechSuffix()) {
                            paths[destSuffix].push({
                                absPath: source,
                                suffix: _this.getSourceSuffix(),
                                lastUpdated: sourceUpdate
                            });
                        }
                    });
                    return paths;
                });
    },


    getBuildResults: function(decl, levels, output, opts) {
        var _this = this,
            source = this.getPath(output, this.getSourceSuffix()),
            base = this.__base;
        return BEM.util.readJsonJs(source)
            .then(function(data) {
                opts = opts || {};
                opts.ctx = {
                    data: data
                };

                return base.call(_this, decl, levels, output, opts);

            });
    },

    getBuildResult: function(files, suffix, output, opts) {
        if (suffix === this.getBaseTechSuffix()) {
            return Q.resolve(output);
        }

        var _this = this;
        return this.__base.apply(this, arguments)
            .then(function(res) {
                var lang = suffix.substr(0, 2),
                    dataLang = _this.extendLangDecl({}, opts.ctx.data.all || {});

                dataLang = _this.extendLangDecl(dataLang, opts.ctx.data[suffix.substr(0, 2)] || {});

                return res.concat(dataLang? _this.serializeI18nData(dataLang, lang) : [])
                    .concat([_this.serializeI18nInit(lang)]);
            });

    },

    getBuildResultChunk: function(relPath, path, suffix) {
        if (suffix === this.getSourceSuffix()) {
            return '';
        }
        return this.__base(relPath, path, suffix);
    },

    serializeI18nInit: I18NJS.serializeInit,

    serializeI18nData: I18NJS.serializeData,

    storeBuildResult: function(path, suffix, res) {

        if (suffix === this.getBaseTechSuffix()) {
            return BEM.util.symbolicLink(
                path,
                this.getPath(
                    res,
                    this.getBuildSuffixForLang(this.getDefaultLang())),
                true);
        }

        return this.__base(path, suffix, res);

    },

    getDependencies: function() {
        return ['i18n'];
    }

});
