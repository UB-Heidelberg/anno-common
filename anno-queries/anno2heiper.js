const {applyToAnno, ensureArray, splitIdRepliesRev} = require('@kba/anno-util')

function toArray(value) {
  if (!Array.isArray(value)) {
    if (value === undefined || value === null) {
      return []
    }
    else {
      return [value]
    }
  }
  return value
}

// TODO configurable defaults
function anno2heiper(tla, doiTemplate, doiSeparator='_') {
  const heiperJson = []
  applyToAnno(tla, (anno) => {
    const {_fullid, _unversioned, _revid} = splitIdRepliesRev(anno.id)
    let revision = ''
    if (_revid) {
      revision = doiSeparator + _revid
    }
    const doi = doiTemplate
      .replace('{{ fullid }}', _fullid)
      .replace('{{ unversioned }}', _unversioned)
      .replace('{{ revision }}', revision)
    // console.log({doi, _fullid})
    const internalIdentifier = _fullid
    const url = anno.id
    const annoCreators = toArray(anno.creator)
    const tlaCreators = toArray(tla.creator)
    const creators = annoCreators.length > 0 ? annoCreators : tlaCreators
    anno.doi = doi

    heiperJson.push({
      url,
      doi,
      internalIdentifier,
      type: "digital_copy",
      title: {eng: anno.title},
      availability: 'download',
      place: 'internet',
      date: anno.modified || anno.created || new Date(),
      lang: "ger",
      license: {
        eng: {
          description: `See ${anno.rights}`,
          url: anno.rights
        }
      },
      creators: creators.map(c => {return {
        displayForm: {eng: c.displayName},
        type: 'person',
      }})
    })
  }, {nestedProps: ['hasVersion']})
  return {heiperJson, anno: tla}
}

module.exports = {anno2heiper}
