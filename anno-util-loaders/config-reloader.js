const fs = require('fs')
const errors = require('@kba/anno-errors')
const chokidar = require('chokidar')
const parseYAML = require('safeload-yaml-pmb')
const {envyConf} = require('envyconf')

const supportedConfParsers = {
  yml: parseYAML,
  yaml: parseYAML,
  json: JSON.parse,
};


module.exports = function ConfigLoaderProcessorFactory(processorClass, envyconfName) {
    return function() {
        const CONF_FILE = envyConf('ANNO', {
            [envyconfName]: '/FILENAME-NOT-SET.json'
        })[envyconfName]
        // console.log({processorClass, envyconfName, CONF_FILE})
        let processor = new processorClass()

        function parseContents(err, contents) {
            if (err) {
                console.error(new Error(`Error reading file ${CONF_FILE} ${err}`))
                return
            }
            const confFext = (/\.(\w+)$/.exec(CONF_FILE) || false)[1];
            const confParser = supportedConfParsers[confFext];
            if (!confParser) {
              throw new Error('Unsupported config file type: ' + CONF_FILE);
            }
            const confData = confParser(contents);
            processor = new processorClass(confData);
        }
        try {
            const contents = fs.readFileSync(CONF_FILE)
            parseContents(null, contents)
        } catch (err) {
            console.log(errors.fileNotFound(CONF_FILE, err))
            throw errors.fileNotFound(CONF_FILE, err)
        }

        chokidar
            .watch(CONF_FILE, {persistent: true, usePolling: true})
            .on('change', () => {
                console.log(`***** ${CONF_FILE} changed, reloading ${processorClass.name} *****`)
                fs.readFile(CONF_FILE, parseContents)
            })

        const ret = (...args) => {
            return processor.process(...args)
        }
        ret.impl = processorClass.name
        return ret
    }
}
