// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            window.cvData = data;
            const userLang = navigator.language || navigator.userLanguage;
            let initialLang = 'en';
            if (userLang.startsWith('pt')) initialLang = 'pt';
            if (userLang.startsWith('it')) initialLang = 'it';
            renderContent(initialLang);

            // Adiciona listeners para os botões de ação
            document.getElementById('download-pdf').addEventListener('click', generateTextPDF);
            document.getElementById('print-btn').addEventListener('click', () => window.print());
        })
        .catch(error => console.error('Error loading CV data:', error));
});

function renderContent(lang) {
    const data = window.cvData;
    const content = data.content[lang];

    // Atualiza o botão ativo
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
    });

    // Renderiza o conteúdo na página HTML (lógica existente)
    document.getElementById('name').textContent = data.personalInfo.name;
    document.getElementById('title').textContent = content.title;

    const contact = data.personalInfo.contact;
    const contactHTML = `<p>${contact.location[lang]}</p><p><a href="tel:${contact.phone_br.replace(/\s|\(|\)/g, '')}">📞 ${contact.phone_br} (Mobile)</a> | <span>💬 ${contact.phone_it} (WhatsApp Only)</span></p><p><a href="mailto:${contact.email_br}">✉️ ${contact.email_br}</a> | <a href="https://${contact.linkedin}" target="_blank">LinkedIn</a> | <a href="https://${contact.github}" target="_blank">GitHub</a></p>`;
    document.getElementById('contact' ).innerHTML = contactHTML;

    document.getElementById('summary-title').textContent = content.sectionTitles.summary;
    document.getElementById('summary-content').textContent = content.summary;

    document.getElementById('experience-title').textContent = content.sectionTitles.experience;
    let experienceHTML = '';
    content.experience.forEach(item => {
        experienceHTML += `<div class="experience-item"><h3>${item.role}</h3><div class="company">${item.company} | ${item.location} | ${item.period}</div><ul>${item.description.map(d => `<li>${d}</li>`).join('')}</ul></div>`;
    });
    document.getElementById('experience-content').innerHTML = experienceHTML;

    document.getElementById('skills-title').textContent = content.sectionTitles.skills;
    let skillsHTML = '';
    content.skills.forEach(category => {
        skillsHTML += `<div class="skills-category"><h4>${category.category}</h4>${category.items.map(item => `<p><strong>${item.level}:</strong> ${item.list}</p>`).join('')}</div>`;
    });
    document.getElementById('skills-content').innerHTML = skillsHTML;

    document.getElementById('education-title').textContent = content.sectionTitles.education;
    let educationHTML = '';
    content.education.forEach(item => {
        educationHTML += `<div class="education-item"><h3>${item.degree}</h3><div class="institution">${item.institution} | ${item.period}</div></div>`;
    });
    document.getElementById('education-content').innerHTML = educationHTML;
}


/**
 * GERA UM PDF COM TEXTO REAL, SIMULANDO O LAYOUT DE IMPRESSÃO.
 */
function generateTextPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    // --- DADOS ---
    const data = window.cvData;
    const lang = document.querySelector('.lang-btn.active')?.textContent.toLowerCase() || 'en';
    const content = data.content[lang];
    const personalInfo = data.personalInfo;

    // --- VARIÁVEIS DE LAYOUT ---
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 0; // Posição vertical inicial

    // Função para verificar e adicionar nova página se necessário
    const checkPageBreak = (neededHeight) => {
        if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }
    };

    // --- 1. CABEÇALHO ---
    y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(personalInfo.name, margin, y);
    y += 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 90, 156); // Cor azul de destaque
    doc.text(content.title, margin, y);
    y += 20;

    doc.setTextColor(51, 51, 51); // Resetar cor para cinza escuro
    doc.setFontSize(9);
    doc.text(personalInfo.contact.location[lang], margin, y);
    y += 12;
    const contactLine = `${personalInfo.contact.email_br} | ${personalInfo.contact.linkedin} | ${personalInfo.contact.github}`;
    doc.text(contactLine, margin, y);
    y += 30;

    // --- FUNÇÃO AUXILIAR PARA SEÇÕES ---
    const addSection = (title, body) => {
        checkPageBreak(40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title, margin, y);
        doc.setLineWidth(1.0);
        doc.setDrawColor(220, 220, 220); // Linha cinza claro
        doc.line(margin, y + 5, pageW - margin, y + 5);
        y += 25;
        body(); // Executa a função que desenha o conteúdo da seção
    };

    // --- 2. RESUMO PROFISSIONAL ---
    addSection(content.sectionTitles.summary, () => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(content.summary, pageW - margin * 2);
        checkPageBreak(summaryLines.length * 12);
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 12 + 15;
    });

    // --- 3. EXPERIÊNCIA PROFISSIONAL ---
    addSection(content.sectionTitles.experience, () => {
        content.experience.forEach(item => {
            checkPageBreak(60); // Estima um espaço mínimo para cada item
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(item.role, margin, y);
            y += 14;

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100); // Cinza mais claro para detalhes
            doc.text(`${item.company} | ${item.location} | ${item.period}`, margin, y);
            y += 18;
            doc.setTextColor(51, 51, 51); // Resetar cor

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            item.description.forEach(desc => {
                const descLines = doc.splitTextToSize(desc, pageW - (margin + 20) * 2);
                checkPageBreak(descLines.length * 12 + 5);
                doc.text(`•`, margin + 5, y, { align: 'left' });
                doc.text(descLines, margin + 20, y);
                y += descLines.length * 12 + 5;
            });
            y += 15;
        });
    });

    // --- 4. COMPETÊNCIAS TÉCNICAS ---
    addSection(content.sectionTitles.skills, () => {
        content.skills.forEach(category => {
            checkPageBreak(40);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(category.category, margin, y);
            y += 15;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            category.items.forEach(item => {
                checkPageBreak(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${item.level}:`, margin + 10, y);
                doc.setFont('helvetica', 'normal');
                doc.text(item.list, margin + 10 + doc.getTextWidth(`${item.level}: `) + 5, y);
                y += 14;
            });
            y += 10;
        });
    });

    // --- 5. FORMAÇÃO ACADÊMICA ---
    addSection(content.sectionTitles.education, () => {
        content.education.forEach(item => {
            checkPageBreak(40);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(item.degree, margin, y);
            y += 14;

            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`${item.institution} | ${item.period}`, margin, y);
            y += 25;
            doc.setTextColor(51, 51, 51);
        });
    });

    // --- SALVAR O ARQUIVO ---
    doc.save(`CV_${personalInfo.name.replace(/ /g, '_')}_${lang}.pdf`);
}
