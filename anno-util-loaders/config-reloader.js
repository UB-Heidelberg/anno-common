const fs = require('fs')
const errors = require('@kba/anno-errors')
const stripBom = require('strip-bom')
const parseYAML = require('safeload-yaml-pmb')
const {envyConf} = require('envyconf')

const supportedConfParsers = {
  yml: parseYAML,
  yaml: parseYAML,
  json: JSON.parse,
};


module.exports = function ConfigLoaderProcessorFactory(processorClass, envyconfName) {
    return function() {
        const CONF_FILE = envyConf('ANNO')[envyconfName]
        if (!CONF_FILE) {
          throw new Error('Filename not configured for option ' + envyconfName);
        }
        // console.log({processorClass, envyconfName, CONF_FILE})

        const configFileFormatParser = (function guessFormat() {
          const confFext = (/\.(\w+)$/.exec(CONF_FILE) || false)[1];
          const confParser = supportedConfParsers[confFext];
          if (confParser) { return confParser; }
          throw new Error('Unsupported config file type: ' + CONF_FILE);
        }());
        let confData;
        confData = fs.readFileSync(CONF_FILE);
        confData = confData.toString('UTF-8');
        confData = stripBom(confData);
        try {
          confData = configFileFormatParser(confData);
        } catch (parseErr) {
          const msg = ('Error while parsing config file ' + CONF_FILE
            + ': ' + (parseErr.message || parseErr));
          const err = new Error(msg);
          err.cause = parseErr;
          throw err;
        }
        const processor = new processorClass(confData);

        const ret = (...args) => {
            return processor.process(...args)
        }
        ret.impl = processorClass.name
        return ret
    }
}
