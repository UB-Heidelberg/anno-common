const deepExtend = require('deep-extend')
const lodashSet = require('lodash.set')
const {applyToAnno} = require('@kba/anno-util')
const UserBase = require('./user-base')

const METHODS = new Set([
    'get',
    'revise',
    'create',
    'search',
])

class CreatorInjector extends UserBase {

    constructor(users={}) {
        super('creator-injector', users)
    }

    _lookupUser(user, ctx) {
        if (!user) return
        const id = typeof user === 'string' ? user
            : user.user ? user.user
            : user.id
        // this.log.silly(`Looking up user ${JSON.stringify(user)}`)
        const ret = {id}
        if (!(id in this.users))
            return ret
        // console.log(`Found user ${id}`, this.users[id])
        deepExtend(ret, this.users[id])
        this.users[id][UserBase.RULESET].filterApply(ctx).forEach(kv =>
            Object.keys(kv).forEach(k => {
                if (k.indexOf('.') > -1) {
                    // 'public.displayName: ...'
                    lodashSet(ret, k, kv[k])
                } else {
                    // 'public: {displayName: ...}'
                    deepExtend(ret, kv[k])
                }
            }))
        return ret
    }

    process(ctx, cb) {
        if (!METHODS.has(ctx.method))
            return cb()

        // for DWork => Trigger project reindexing
        if(!ctx.dryRun && (ctx.method==='create' || ctx.method==='revise') && ctx.collection==='diglit' && ctx.metadata.projectname.match(/^[^.\/][^\/]*$/)) {
          const fs=require('fs');
          fs.appendFileSync('/data/diglitData/import/reindex/'+ctx.metadata.projectname+'.ready', "anno-plugins/creator-injektor.js\n");
        }

        if ('retvals' in ctx) {
            const fn = (anno) => {
                if (Array.isArray(anno.creator)) {
                    const creators = anno.creator.map(creator => {
                        const user = this._lookupUser(creator, ctx)
                        if (user && user.public)
                            creator = Object.assign({}, user.public, {id: user.id})
                        return creator
                    })
                    anno.creator = creators
                } else {
                    const user = this._lookupUser(anno.creator, ctx)
                    if (user && user.public)
                        anno.creator = Object.assign({}, user.public, {id: user.id})
                }
            }
            if (ctx.method === 'search') {
                for (let anno of ctx.retvals[0]) {
                    applyToAnno(anno, fn)
                }
            } else if (ctx.method === 'get') {
                applyToAnno(ctx.retvals[0], fn)
            }
        // pre-processing
        // XXX buggy this injects the CURRENT user as the creator for create which is very very wrong
        } else if (
               ctx.anno
            && ! ctx.metadataOnly
            && ! ctx.anno.creator
            && (ctx.anno.title || ctx.anno.motivation)
            && ctx.user
            && ctx.user.id
        ) {
            ctx.anno.creator = ctx.user.id
        }
        return cb()
    }

}

module.exports = CreatorInjector

// vim: sw=4
