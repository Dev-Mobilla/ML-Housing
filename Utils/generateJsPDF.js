// const { jsPDF } = require('jspdf');
const htmlPdfNode = require('html-pdf-node');

module.exports = {
    async htmlToPdf(html) {

        try {

            let options = { format: 'A4' };
            // Example of options with args //
            // let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };

            let file = { content: html };
            
            // let pdf = await html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            //     console.log("PDF Buffer:-", pdfBuffer);
            // });
            let pdf = htmlPdfNode.generatePdf(file, options);

            return pdf

        } catch (error) {
            console.log(error);
            return error
        }


    }
}