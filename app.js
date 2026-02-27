document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    // Fee inputs
    const sellerFee = document.getElementById('sellerEscrowFee');
    const sellerDiscount = document.getElementById('sellerDiscount');
    const buyerFee = document.getElementById('buyerEscrowFee');
    const buyerDiscount = document.getElementById('buyerDiscount');

    // Net displays
    const sellerNet = document.getElementById('sellerNet');
    const buyerNet = document.getElementById('buyerNet');
    const totalFees = document.getElementById('totalFees');
    const totalDiscountEl = document.getElementById('totalDiscount');
    const totalNetEl = document.getElementById('totalNet');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    function calculate() {
        const sf = parseFloat(sellerFee.value) || 0;
        const sd = parseFloat(sellerDiscount.value) || 0;
        const bf = parseFloat(buyerFee.value) || 0;
        const bd = parseFloat(buyerDiscount.value) || 0;

        const sellerNetVal = sf - sd;
        const buyerNetVal = bf - bd;
        const totalFeesVal = sf + bf;
        const totalDiscVal = sd + bd;
        const totalNetVal = sellerNetVal + buyerNetVal;

        sellerNet.textContent = formatCurrency(sellerNetVal);
        buyerNet.textContent = formatCurrency(buyerNetVal);
        totalFees.textContent = formatCurrency(totalFeesVal);
        totalDiscountEl.textContent = '-' + formatCurrency(totalDiscVal);
        totalNetEl.textContent = formatCurrency(totalNetVal);
    }

    // Listen to all fee inputs
    [sellerFee, sellerDiscount, buyerFee, buyerDiscount].forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();

    // Reset handler
    document.getElementById('escrowForm').addEventListener('reset', () => {
        setTimeout(() => {
            sellerFee.value = 4000;
            sellerDiscount.value = 3000;
            buyerFee.value = 4000;
            buyerDiscount.value = 3000;
            document.getElementById('date').value = today;
            calculate();
        }, 10);
    });

    // PDF Generation
    document.getElementById('generatePdf').addEventListener('click', generatePDF);

    function generatePDF() {
        const { jsPDF } = window.jspdf;

        // Gather form data
        const data = {
            address: document.getElementById('address').value,
            date: document.getElementById('date').value,
            closingDate: document.getElementById('closingDate').value,
            buyers: document.getElementById('buyers').value,
            sellers: document.getElementById('sellers').value,
            agentName: document.getElementById('agentName').value,
            agentCompany: document.getElementById('agentCompany').value,
            agentEmail: document.getElementById('agentEmail').value,
            agentPhone: document.getElementById('agentPhone').value,
            agentDRE: document.getElementById('agentDRE').value,
            sellerFee: parseFloat(sellerFee.value) || 0,
            sellerDiscount: parseFloat(sellerDiscount.value) || 0,
            buyerFee: parseFloat(buyerFee.value) || 0,
            buyerDiscount: parseFloat(buyerDiscount.value) || 0,
        };

        // Validate required fields
        if (!data.address || !data.date || !data.closingDate || !data.buyers || !data.sellers) {
            alert('Please fill in all required fields (Address, Date, Closing Date, Buyers, Sellers).');
            return;
        }

        data.sellerNet = data.sellerFee - data.sellerDiscount;
        data.buyerNet = data.buyerFee - data.buyerDiscount;
        data.totalFees = data.sellerFee + data.buyerFee;
        data.totalDiscount = data.sellerDiscount + data.buyerDiscount;
        data.totalNet = data.sellerNet + data.buyerNet;

        const doc = new jsPDF({ unit: 'pt', format: 'letter' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 60;
        const contentWidth = pageWidth - margin * 2;

        // Colors
        const gold = [175, 156, 110];
        const charcoal = [44, 44, 44];
        const textGray = [100, 100, 100];
        const white = [255, 255, 255];
        const lightBg = [248, 247, 244];
        const green = [46, 125, 50];

        // --- Logo (embedded base64) ---
        const logoImg = (typeof LOGO_BASE64 !== 'undefined') ? LOGO_BASE64 : null;

        let y = 40;

        // === HEADER BAR ===
        doc.setFillColor(...charcoal);
        doc.rect(0, 0, pageWidth, 110, 'F');

        // Gold accent line
        doc.setFillColor(...gold);
        doc.rect(0, 110, pageWidth, 4, 'F');

        // Logo
        if (logoImg) {
            doc.addImage(logoImg, 'PNG', margin, 15, 110, 72);
        }

        // Company info - right side
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...white);
        const headerRight = pageWidth - margin;
        doc.text('2690 Via De La Valle, Suite D260', headerRight, 35, { align: 'right' });
        doc.text('Del Mar, CA 92014', headerRight, 48, { align: 'right' });
        doc.text('Phone: (858) 324-1700', headerRight, 65, { align: 'right' });
        doc.text('Fax: (858) 324-1707', headerRight, 78, { align: 'right' });
        doc.setFontSize(8);
        doc.setTextColor(...gold);
        doc.text('DFPI License #96DBO-45861', headerRight, 95, { align: 'right' });

        y = 140;

        // === TITLE ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...charcoal);
        doc.text('Escrow Fee Proposal', margin, y);

        y += 8;
        doc.setFillColor(...gold);
        doc.rect(margin, y, 80, 3, 'F');

        y += 28;

        // === PROPOSAL INTRO ===
        if (data.agentName) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(...textGray);
            let intro = `Dear ${data.agentName}`;
            if (data.agentDRE) intro += ` (DRE #${data.agentDRE})`;
            if (data.agentCompany) intro += ` of ${data.agentCompany}`;
            intro += ',';
            doc.text(intro, margin, y);
            y += 20;
            doc.text('Thank you for the opportunity to provide escrow services. Please find our', margin, y);
            y += 16;
            doc.text('estimated escrow fee proposal for the following transaction:', margin, y);
            y += 28;
        }

        // === PROPERTY & TRANSACTION DETAILS ===
        // Section header
        doc.setFillColor(...charcoal);
        doc.rect(margin, y, contentWidth, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...white);
        doc.text('TRANSACTION DETAILS', margin + 14, y + 18);
        y += 28;

        // Details rows
        const details = [
            ['Property Address', data.address],
            ['Date', formatDate(data.date)],
            ['Estimated Closing Date', formatDate(data.closingDate)],
            ['Buyer(s)', data.buyers],
            ['Seller(s)', data.sellers],
        ];

        details.forEach((row, i) => {
            const rowBg = i % 2 === 0 ? lightBg : white;
            doc.setFillColor(...rowBg);
            doc.rect(margin, y, contentWidth, 24, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...textGray);
            doc.text(row[0].toUpperCase(), margin + 14, y + 16);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...charcoal);
            doc.text(row[1], margin + 180, y + 16);

            y += 24;
        });

        // Bottom border
        doc.setFillColor(...gold);
        doc.rect(margin, y, contentWidth, 2, 'F');
        y += 24;

        // === ESCROW FEE SCHEDULE ===
        doc.setFillColor(...charcoal);
        doc.rect(margin, y, contentWidth, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...white);
        doc.text('ESCROW FEE SCHEDULE', margin + 14, y + 18);
        y += 28;

        // Column headers
        doc.setFillColor(...gold);
        doc.rect(margin, y, contentWidth, 26, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...white);
        doc.text('DESCRIPTION', margin + 14, y + 17);
        doc.text('AMOUNT', pageWidth - margin - 14, y + 17, { align: 'right' });
        y += 26;

        // Seller section
        doc.setFillColor(...lightBg);
        doc.rect(margin, y, contentWidth, 26, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...charcoal);
        doc.text('Seller Escrow Fee', margin + 14, y + 17);
        doc.setFont('helvetica', 'normal');
        doc.text(formatCurrency(data.sellerFee), pageWidth - margin - 14, y + 17, { align: 'right' });
        y += 26;

        doc.setFillColor(...white);
        doc.rect(margin, y, contentWidth, 26, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...green);
        doc.text('    Courtesy Escrow Discount', margin + 14, y + 17);
        doc.text('(' + formatCurrency(data.sellerDiscount) + ')', pageWidth - margin - 14, y + 17, { align: 'right' });
        y += 26;

        doc.setFillColor(235, 245, 235);
        doc.rect(margin, y, contentWidth, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...charcoal);
        doc.text('    Net Cost to Seller', margin + 14, y + 18);
        doc.text(formatCurrency(data.sellerNet), pageWidth - margin - 14, y + 18, { align: 'right' });
        y += 28;

        // Divider
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;

        // Buyer section
        doc.setFillColor(...lightBg);
        doc.rect(margin, y, contentWidth, 26, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...charcoal);
        doc.text('Buyer Escrow Fee', margin + 14, y + 17);
        doc.setFont('helvetica', 'normal');
        doc.text(formatCurrency(data.buyerFee), pageWidth - margin - 14, y + 17, { align: 'right' });
        y += 26;

        doc.setFillColor(...white);
        doc.rect(margin, y, contentWidth, 26, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...green);
        doc.text('    Courtesy Escrow Discount', margin + 14, y + 17);
        doc.text('(' + formatCurrency(data.buyerDiscount) + ')', pageWidth - margin - 14, y + 17, { align: 'right' });
        y += 26;

        doc.setFillColor(235, 245, 235);
        doc.rect(margin, y, contentWidth, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...charcoal);
        doc.text('    Net Cost to Buyer', margin + 14, y + 18);
        doc.text(formatCurrency(data.buyerNet), pageWidth - margin - 14, y + 18, { align: 'right' });
        y += 28;

        // Gold border
        doc.setFillColor(...gold);
        doc.rect(margin, y, contentWidth, 2, 'F');
        y += 6;

        // Total bar
        doc.setFillColor(...charcoal);
        doc.rect(margin, y, contentWidth, 36, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...white);
        doc.text('TOTAL NET ESCROW CHARGES', margin + 14, y + 23);
        doc.setTextColor(...gold);
        doc.setFontSize(14);
        doc.text(formatCurrency(data.totalNet), pageWidth - margin - 14, y + 23, { align: 'right' });
        y += 36;

        // Savings callout
        if (data.totalDiscount > 0) {
            y += 12;
            doc.setFillColor(235, 245, 235);
            doc.roundedRect(margin, y, contentWidth, 34, 4, 4, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...green);
            const savingsText = `Total Courtesy Discount Savings: ${formatCurrency(data.totalDiscount)}`;
            doc.text(savingsText, pageWidth / 2, y + 22, { align: 'center' });
            y += 34;
        }

        // === FOOTER SECTION ===
        y += 24;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textGray);

        const disclaimers = [
            'This is an estimate only. Actual fees may vary based on the specifics of the transaction.',
            'Oakwood Escrow Inc. is a licensed, independent escrow company. We are not affiliated with any',
            'broker, lender, or agent. We serve as a neutral third party in all transactions.',
        ];
        disclaimers.forEach(line => {
            doc.text(line, margin, y);
            y += 14;
        });

        // Contact section if agent provided
        if (data.agentName) {
            y += 10;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...charcoal);
            doc.text('We look forward to working with you. Please don\'t hesitate to contact us with any questions.', margin, y);
        }

        // Bottom bar
        doc.setFillColor(...charcoal);
        doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
        doc.setFillColor(...gold);
        doc.rect(0, pageHeight - 40, pageWidth, 3, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...gold);
        doc.text('PROTECTION  \u2022  TRUST  \u2022  NEUTRALITY', pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.setTextColor(180, 180, 180);
        doc.text('www.oakwoodescrow.com', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Save
        const filename = `Oakwood_Escrow_Proposal_${data.address.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`;
        doc.save(filename);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

});
