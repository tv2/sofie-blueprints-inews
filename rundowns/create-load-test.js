// this converts a snapshot into importable rundown data
// use with `node create-load-test.js rundown-name.json`
// this will create a file with repeated rundown named:
// load-test-rundown-name.json
// that can be uploaded with the upload.sh script

const NUMBER_OF_REPEATS = 30
if (process.argv.length < 3) {
    console.log(process.argv)
    console.log(`Usage: node create-load-test.js on-air.json`)
    process.exit(0)
}
const fs = require('fs')
const { run } = require('tslint/lib/runner')
// const path = require('path')
const origRundown = JSON.parse(fs.readFileSync(process.argv[2]))
let rundown = JSON.parse(JSON.stringify(origRundown))
rundown.segments= []
let rankCounter = 0
for (let i=1; i<NUMBER_OF_REPEATS; i++) {
    let tempRundown = JSON.parse(JSON.stringify(origRundown))
    let tempSegments = tempRundown.segments.map((segment, index) => {
        segment.externalId = String(i) + '-' + segment.externalId
        segment.payload.externalId = String(i) + '-' + segment.payload.externalId
        segment.rank = rankCounter
        rankCounter++
        return segment
    }) 
    tempSegments.forEach(segment => {
        rundown.segments.push(segment)
    });
}
// console.log(JSON.stringify(rundown, undefined, 4))
fs.writeFileSync('load-test-' + process.argv[2], JSON.stringify(rundown, undefined, 4))
console.log('done')