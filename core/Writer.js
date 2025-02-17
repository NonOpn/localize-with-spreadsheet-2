const fs = require('fs')
const EOL = require('./Constants').EOL

//https://gist.github.com/jrajav/4140206
const writeFileAndCreateDirectoriesSync = function(filepath, content, encoding) {
  const mkpath = require('mkpath')
  const path = require('path')

  const dirname = path.dirname(filepath)
  mkpath.sync(dirname)

  fs.writeFileSync(filepath, content, encoding)
}

class Writer {

  getTransformedLines(lines, transformer) {
    let valueToInsert = ''
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
  
      if (!line.isEmpty()) {
        if (line.isComment()) {
          const transformed = transformer.transformComment(line.getComment())
  
          if (transformed !== null) {
            valueToInsert += transformed
  
            if (i !== lines.length - 1) {
              valueToInsert += EOL
            }
          }
        } else {
          valueToInsert += transformer.transformKeyValue(line.getKey(), line.getValue())
  
          if (i !== lines.length - 1) {
            valueToInsert += EOL
          }
        }
      }
    }
  
    return valueToInsert
  }
}

class FileWriter extends Writer {

  write(filePath, encoding, lines, transformer, options) {
    let fileContent = ''
    if (fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, encoding);
    }
  
    const valueToInsert = this.getTransformedLines(lines, transformer)
  
    const output = transformer.insert(fileContent, valueToInsert, options)
  
    writeFileAndCreateDirectoriesSync(filePath, output, 'utf8')
    return undefined;
  }
}

class FakeWriter extends Writer {
  
  write(filePath, encoding, lines, transformer, options) {

    const valueToInsert = this.getTransformedLines(lines, transformer)
  
    return transformer.insert("", valueToInsert, options)
  }

}

module.exports = { File: FileWriter, Fake: FakeWriter }
