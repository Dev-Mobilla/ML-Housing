const Html_Pdf = require('html-pdf');


function _createPdfStream(html) {
    return new Promise(function (resolve, reject) {
        let options = {
            format: 'letter',
            footer: {
                "height": "28mm",
            }
        };
        Html_Pdf.create(html, options).toStream(function (err, stream) {
            if (err) {
                return reject(err);
            }
            return resolve(stream);
        })

    })
}

function _streamToBuffer(stream, cb) {
    const chunks = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });
    stream.on('end', () => {
        return cb(null, Buffer.concat(chunks));
    });
    stream.on('error', (e) => {
        return cb(e);
    })
}

module.exports = {

    _createPdfStream, 
    _streamToBuffer,

};