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
        })
        .catch(error => console.error('Error loading CV data:', error));
});

function renderContent(lang) {
    const data = window.cvData;
    const content = data.content[lang];

    // Update active button
    document.querySelectorAll('.lang-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
    });

    // Header
    document.getElementById('name').textContent = data.personalInfo.name;
    document.getElementById('title').textContent = content.title;

    // Contact
    const contact = data.personalInfo.contact;
    const contactHTML = `
        <p>${contact.location[lang]}</p>
        <p>
            <a href="tel:${contact.phone_br.replace(/\s|\(|\)/g, '')}">📞 ${contact.phone_br} (Mobile)</a> |
            <span>💬 ${contact.phone_it} (WhatsApp Only)</span>
        </p>
        <p>
            <a href="mailto:${contact.email_br}">✉️ ${contact.email_br}</a> |
            <a href="https://${contact.linkedin}" target="_blank">LinkedIn</a> |
            <a href="https://${contact.github}" target="_blank">GitHub</a>
        </p>
    `;
    document.getElementById('contact' ).innerHTML = contactHTML;

    // Summary
    document.getElementById('summary-title').textContent = content.sectionTitles.summary;
    document.getElementById('summary-content').textContent = content.summary;

    // Experience
    document.getElementById('experience-title').textContent = content.sectionTitles.experience;
    let experienceHTML = '';
    content.experience.forEach(item => {
        experienceHTML += `
            <div class="experience-item">
                <h3>${item.role}</h3>
                <div class="company">${item.company} | ${item.location} | ${item.period}</div>
                <ul>
                    ${item.description.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    document.getElementById('experience-content').innerHTML = experienceHTML;

    // Skills
    document.getElementById('skills-title').textContent = content.sectionTitles.skills;
    let skillsHTML = '';
    content.skills.forEach(category => {
        skillsHTML += `
            <div class="skills-category">
                <h4>${category.category}</h4>
                ${category.items.map(item => `<p><strong>${item.level}:</strong> ${item.list}</p>`).join('')}
            </div>
        `;
    });
    document.getElementById('skills-content').innerHTML = skillsHTML;

    // Education
    document.getElementById('education-title').textContent = content.sectionTitles.education;
    let educationHTML = '';
    content.education.forEach(item => {
        educationHTML += `
            <div class="education-item">
                <h3>${item.degree}</h3>
                <div class="institution">${item.institution} | ${item.period}</div>
            </div>
        `;
    });
    document.getElementById('education-content').innerHTML = educationHTML;
}
