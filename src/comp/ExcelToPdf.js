import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

const ExcelToPdf = () => {
    const [excelData, setExcelData] = useState([]);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, {
                raw: false,
            });
            setExcelData(rows);
        };
        reader.readAsArrayBuffer(file);
    };

    const generatePdfForRow = (row, nameCount) => {
        let yOffset = 10;
        const margin = 10;
        const lineHeight = 10;
        const pdf = new jsPDF();

        // Loop through each key-value pair
        Object.entries(row).forEach(([key, value], i) => {
            pdf.setFontSize(10);
            pdf.text(`${key}:`, margin, yOffset);
            yOffset += lineHeight;

            pdf.setFontSize(12);
            pdf.text(`${value}`, margin, yOffset);
            yOffset += lineHeight + 5;
        });

        // Handle naming convention
        let fileName = row['First Name'];
        if (nameCount[fileName]) {
            nameCount[fileName] += 1;
            fileName = `${fileName}_${nameCount[fileName]}`;
        } else {
            nameCount[fileName] = 1;
        }
        fileName += '_Questionnaire';

        return { pdfData: pdf.output('arraybuffer'), fileName };
    };

    const generateZip = async () => {
        const zip = new JSZip();
        const nameCount = {};

        for (let i = 0; i < excelData.length; i++) {
            const row = excelData[i];

            const { pdfData, fileName } = await generatePdfForRow(row, nameCount);
            zip.file(`${fileName}.pdf`, pdfData);
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'pdfs.zip';
            link.click();
        });
    };

    return (
        <div>
            <h2 style={{ marginTop: 0 }}>Excel to PDF Generator</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <button onClick={generateZip} disabled={!excelData.length}>
                Export ZIP
            </button>
        </div>
    );
};

export default ExcelToPdf;