import PDFDocument from 'pdfkit';

/**
 * Generate a payment receipt PDF
 * @param {Object} data - Receipt data { name, studentId, amount, date, receiptId, type }
 * @returns {Promise<Buffer>}
 */
export const generateReceiptPDF = (data) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        // Header
        doc.fillColor('#444444')
            .fontSize(20)
            .text('HostelMate Payment Receipt', 110, 57)
            .fontSize(10)
            .text('HostelMate Inc.', 200, 65, { align: 'right' })
            .text('123 Education St.', 200, 80, { align: 'right' })
            .text('University City, STATE, 12345', 200, 95, { align: 'right' })
            .moveDown();

        // Line
        doc.moveTo(50, 115)
            .lineTo(550, 115)
            .stroke();

        // Body
        doc.fontSize(12)
            .text(`Receipt ID: ${data.receiptId}`, 50, 130)
            .text(`Date: ${new Date(data.date).toLocaleDateString()}`, 50, 150)
            .moveDown();

        doc.fontSize(14)
            .text('Bill To:', 50, 180, { underline: true });

        doc.fontSize(12)
            .text(`Name: ${data.name}`, 50, 200)
            .text(`${data.type === 'STUDENT' ? 'Student ID: ' + data.studentId : 'Guest'}`, 50, 220)
            .moveDown();

        // Table Header
        doc.fillColor('#F3F4F6')
            .rect(50, 250, 500, 20)
            .fill();

        doc.fillColor('#333333')
            .fontSize(10)
            .text('DESCRIPTION', 60, 255)
            .text('AMOUNT', 500, 255);

        // Table Content
        doc.fontSize(12)
            .text('Hostel Fee - Cash Payment', 60, 280)
            .text(`Rs. ${data.amount}`, 500, 280);

        doc.moveTo(50, 310)
            .lineTo(550, 310)
            .stroke();

        doc.fontSize(14)
            .text('Total Paid:', 380, 330)
            .text(`Rs. ${data.amount}`, 500, 330, { font: 'Helvetica-Bold' });

        // Footer
        doc.fontSize(10)
            .fillColor('#888888')
            .text('This is a computer-generated receipt and does not require a physical signature.', 50, 700, { align: 'center', width: 500 });

        doc.end();
    });
};
