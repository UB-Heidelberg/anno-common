const isFunc = require('is-fn');

const ConfigReloader = require('./config-reloader')
const StaticLoader = require('./static-loader')

const async = require('async')
const {envyLog} = require('envyconf')
function loadPlugins(modNames, options, cb) {
    if (typeof options === 'function') [cb, options] = [options, {}]
    if (!(options.loadingModule)) throw new Error("Must provide 'loadingModule' option")
    if (!(options.afterLoad)) throw new Error("Must provide 'afterLoad' option")
    const log = envyLog('ANNO', 'loadPlugins')
    const modsList = modNames.replace(/,/g, ' ').match(/\S+/g) || [];
    async.eachSeries(modsList, (modNameRaw, next) => {
        const [modName, modImport] = modNameRaw.split(':')
        const descr = `Loading module ${modName}${
          modImport ? ('/' + modImport) : ''
          } for ${options.loadingModule.filename}`;
        let mod;
        try {
            log.silly(descr)
            mod = options.loadingModule.require(modName)
        } catch (err) {
            console.log(err)
            console.error(`Please install '${modName}'`)
            process.exit(1)
        }
        const modFunc = (modImport ? mod[modImport] : mod);
        if (!isFunc(modFunc)) {
          throw new TypeError(descr
            + ': Expected import to be a function but got a '
            + (typeof modFunc) + ' instead.');
        }
        const plugin = modFunc();
        options.afterLoad(plugin, next)
    }, cb)
}

module.exports = {
    StaticLoader,
    ConfigReloader,
    loadPlugins,
}
