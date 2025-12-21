import React from 'react';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../context/LanguageContext';

const FeeReceipt = ({ student }) => {
    const { t, language } = useLanguage();

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("HostelWise Institute", 105, 20, null, null, "center");

        doc.setFontSize(16);
        doc.text("Fee Receipt", 105, 30, null, null, "center");

        // Line
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Student Details
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);

        doc.text(`Student Name: ${student.firstName} ${student.lastName}`, 20, 50);
        doc.text(`Student ID: ${student.studentId}`, 20, 60);
        doc.text(`Hostel Block: ${student.hostelId}`, 20, 70);
        doc.text(`Room Number: ${student.roomNumber}`, 20, 80);
        doc.text(`Email: ${student.email}`, 20, 90);

        // Payment Details (Mock)
        doc.text(`Receipt No: RCT-${Math.floor(Math.random() * 10000)}`, 140, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 60);

        // Table Header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 105, 170, 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.text("Description", 25, 111);
        doc.text("Amount", 160, 111);

        // Table Content
        doc.setFont("helvetica", "normal");
        const currency = 'INR ';

        doc.text("Hostel Fee (Standard)", 25, 125);
        doc.text(`${currency}${student.pendingFee || 0}`, 160, 125);

        doc.text("Mess Charges", 25, 135);
        doc.text(`${currency}${student.messBill || 0}`, 160, 135);

        doc.text("Gym Membership", 25, 145);
        doc.text(`${currency}${student.gymBill || 0}`, 160, 145);

        // Total
        doc.line(20, 155, 190, 155);
        doc.setFont("helvetica", "bold");
        doc.text("Total Payable", 120, 165);
        doc.text(`${currency}${(student.pendingFee || 0) + (student.messBill || 0) + (student.gymBill || 0)}`, 160, 165);

        // Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("This is a computer generated receipt.", 105, 280, null, null, "center");

        doc.save(`Receipt_${student.studentId}.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
            <i className="fas fa-download"></i>
            {t('downloadReceipt')}
        </button>
    );
};

export default FeeReceipt;
