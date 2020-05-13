/* eslint-env node */
'use strict';
const Funnel = require('broccoli-funnel');
const getDebugMacros = require('./src/debug-macros').debugMacros;

const VersionChecker = require('ember-cli-version-checker');

function assertValidEmberData(addon) {
  let checker = VersionChecker.forProject(addon.project);

  // full ember-data brings store and model starting in 3.16
  // so we do not need to check for full ember-data, just the specific packages
  // we care about since our current support is 3.16+
  let check = checker.check({
    '@ember-data/store': '>= 3.16.0',
    '@ember-data/model': '>= 3.16.0',
    'ember-inflector': '>= 3.0.0',
  });

  check.assert(
    '[ember-m3] requires either "ember-data" be installed (which brings the below packages) or at least the following versions of them.'
  );
}

module.exports = {
  name: 'ember-m3',

  included() {
    this._super.included.call(this, ...arguments);

    assertValidEmberData(this);

    this.configureBabelOptions();
  },

  treeForAddon(tree) {
    const isProd = process.env.EMBER_ENV === 'production';

    if (isProd) {
      tree = new Funnel(tree, {
        exclude: ['-infra', 'adapters'],
      });
    }

    return this._super.treeForAddon.call(this, tree);
  },

  configureBabelOptions() {
    let app = this._findHost();

    this.options = this.options || {};
    this.options.babel = this.options.babel || {};
    let plugins = this.options.babel.plugins;
    let newPlugins = getDebugMacros(app, this.isDevelopingAddon());
    this.options.babel.plugins = Array.isArray(plugins) ? plugins.concat(newPlugins) : newPlugins;

    this.options.babel.loose = true;
  },
};
