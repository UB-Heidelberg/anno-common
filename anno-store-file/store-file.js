const nedb = require('nedb')
const fs = require('fs')
const callbackify = require('callbackify')
const Store = require('@kba/anno-store-mongolike')
const {envyConf,envyLog} = require('envyconf')

class FileStore extends Store {

    constructor() {
        super()
        const config = envyConf('ANNO', {
            STORE_FILE: `${process.env.HOME}/.local/cache/anno.nedb`,
            COLLECTION: 'default'
        })

        // this.dbfilename = `${config.STORE_FILE}/anno-${config.COLLECTION}.nedb`
        this.dbfilename = config.STORE_FILE
        envyLog('ANNO', 'store-file').debug(`nedb saved as ${this.dbfilename}`)
        this.db = new nedb({filename: this.dbfilename})
    }

    _init(options, cb) {
        if (typeof options === 'function') {
          [cb, options] = [options, {}];
        }
        this.db.loadDatabase(cb);
    }

    _wipe(options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        const self = this;
        (self.fs || fs).unlink(self.dbfilename, err => {
            if (err && err.code !== 'ENOENT')
                return cb(err)
            return self.init(options, cb)
        })
    }

}

module.exports = FileStore
