define(function(require, exports, module) {

    /**
     * 组件使用情况统计
     * @module Statistics
     */

    'use strict';

    var $ = require('$'),
        Base = require('base');

    var win = window,
        doc = document;

    /**
     * 组件使用情况统计
     *
     * @class Statistics
     * @extends Base
     * @constructor
     */
    var Statistics = Base.extend({

        defaults: {

            /**
             * 百度统计的网站ID
             * @type {String}
             */
            account : '970c9e413352b8e77854f54b3769dd51',

            /**
             * 过滤不统计的模块
             * @type {Array}
             */
            filter: ['$', 'jquery', 'handlebars']
        },

        initialize: function() {
            Statistics.superclass.initialize.apply(this, arguments);

            var self = this;
            var messageBus = win.messageBus;
            var filter = self.option('filter');
            var filterLength = filter.length;

            self.moduleMap = {
                url: win.location.href
            };
            self.filter = {};

            while (filterLength--) {
                self.filter[filter[filterLength]] = true;
            }

            if (messageBus) {
                messageBus.on('statistics', function(event, modules) {
                    self.statistics(modules);
                });
            }

            $(win).unload(function() {
                self.sendData();
            });

            self.createScript();
        },

        /**
         * 统计
         * @param  {[type]} modules 模块数组
         * @private
         */
        statistics: function(modules) {
            var self = this;
            var item;
            if (!modules) {
                return;
            }
            for (var i = modules.length - 1; i >= 0; i--) {
                item = modules[i];
                if (self.filter[item]) { //过滤不统计的模块
                    continue;
                }
                if (self.moduleMap[item]) {
                    self.moduleMap[item]++;
                } else {
                    self.moduleMap[item] = 1;
                }
            }
        },

        /**
         * 创建百度脚本
         * @private
         */
        createScript: function() {
            var script, firstScript;
            var account = this.option('account');
            if (win._hmt || win._bdhm_account) {
                return;
            }
            win._hmt = [];
            win._hmt.push(['_setAccount', account]);
            script = doc.createElement('script');
            script.src = '//hm.baidu.com/hm.js?' + account;
            firstScript = doc.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);
        },

        /**
         * 发送数据
         * @private
         */
        sendData: function() {
            var self = this;
            var str = this.parseData(this.moduleMap);
            if (win._hmt) {
                win._hmt.push(['_trackEvent', 'pandora', 'usageRate', str]);
            }
        },

        /**
         * 解析数据
         * @param  {Object} map
         * @return {String}
         * @private
         */
        parseData: function(map) {
            var tem = [];
            for (var name in map) {
                tem.push(name + ':' + map[name]);
            }
            return tem.join(',');
        }

    });

    module.exports = Statistics;

});
