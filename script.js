// QR kodini saqlash uchun global o'zgaruvchi
let qrcode = null;

// UI elementlarini tanlash
const generateBtn = document.getElementById('generate-btn');
const qrcodeDiv = document.getElementById('qrcode');
const resultDiv = document.querySelector('.qr-result');
const sizeSlider = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
generateBtn.addEventListener('click', handleGenerateClick);
sizeSlider.addEventListener('input', updateSizeValue);
document.getElementById('download-png').addEventListener('click', downloadPNG);
document.getElementById('download-svg').addEventListener('click', downloadSVG);
document.getElementById('print-btn').addEventListener('click', printQRCode);

// Type buttonlarini sozlash
document.querySelectorAll('.type-btn').forEach(button => {
    button.addEventListener('click', () => switchInputType(button));
});

// Asosiy funksiyalar
function initializeApp() {
    // Boshlang'ich holatni o'rnatish
    document.querySelector('.type-btn[data-type="text"]').click();
    
    // Ranglarni tanlash uchun color picker'larni sozlash
    const colorPickers = document.querySelectorAll('input[type="color"]');
    colorPickers.forEach(picker => {
        picker.addEventListener('change', () => {
            if (qrcode) generateQRCode();
        });
    });
    
    // O'lcham o'zgarishi uchun slider'ni sozlash
    sizeSlider.addEventListener('change', () => {
        if (qrcode) generateQRCode();
    });
}

function switchInputType(button) {
    // Active klassni yangilash
    document.querySelector('.type-btn.active').classList.remove('active');
    button.classList.add('active');
    
    // Input guruhlarini yashirish/ko'rsatish
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.add('hidden');
    });
    
    const inputGroup = document.getElementById(`${button.dataset.type}-input`);
    inputGroup.classList.remove('hidden');
}

function updateSizeValue(e) {
    sizeValue.textContent = `${e.target.value} x ${e.target.value}`;
}

function handleGenerateClick() {
    const activeType = document.querySelector('.type-btn.active').dataset.type;
    let inputData = getInputData(activeType);
    
    if (!inputData) {
        showError('Iltimos, ma\'lumot kiriting!');
        return;
    }
    
    if (!validateInput(activeType, inputData)) {
        showError('Noto\'g\'ri format! Iltimos, tekshirib qaytadan kiriting.');
        return;
    }
    
    generateQRCode();
    scrollToResult();
}

function getInputData(type) {
    switch(type) {
        case 'text':
            return document.querySelector('#text-input textarea').value;
        case 'url':
            let url = document.querySelector('#url-input input').value;
            return url ? (url.startsWith('http') ? url : 'https://' + url) : '';
        case 'email':
            const email = document.querySelector('#email-input input[type="email"]').value;
            const subject = document.querySelector('#email-input input[type="text"]').value;
            const body = document.querySelector('#email-input textarea').value;
            return email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : '';
        case 'tel':
            const tel = document.querySelector('#tel-input input').value;
            return tel ? 'tel:' + tel : '';
        case 'sms':
            const phone = document.querySelector('#sms-input input').value;
            const message = document.querySelector('#sms-input textarea').value;
            return phone ? `sms:${phone}?body=${encodeURIComponent(message)}` : '';
        case 'wifi':
            const ssid = document.querySelector('#wifi-input input[type="text"]').value;
            const encryption = document.querySelector('#wifi-input select').value;
            const password = document.querySelector('#wifi-input input[type="password"]').value;
            const hidden = document.querySelector('#wifi-input input[type="checkbox"]').checked;
            return ssid ? `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};` : '';
        default:
            return '';
    }
}

function generateQRCode() {
    const activeType = document.querySelector('.type-btn.active').dataset.type;
    const data = getInputData(activeType);
    const size = parseInt(sizeSlider.value);
    const color = document.getElementById('color').value;
    const bgcolor = document.getElementById('bgcolor').value;
    const errorCorrection = document.getElementById('errorCorrection').value;
    
    if (!data) {
        showError('Iltimos, ma\'lumot kiriting!');
        return;
    }
    
    // Eski QR kodni tozalash
    qrcodeDiv.innerHTML = '';
    
    // Yangi QR kod yaratish
    qrcode = new QRCode(qrcodeDiv, {
        text: data,
        width: size,
        height: size,
        colorDark: color,
        colorLight: bgcolor,
        correctLevel: QRCode.CorrectLevel[errorCorrection]
    });
    
    // Natijani ko'rsatish
    resultDiv.classList.remove('hidden');
}

function downloadPNG() {
    if (!qrcode) return;
    
    const image = qrcodeDiv.querySelector('img');
    if (!image) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = image.src;
    link.click();
}

function downloadSVG() {
    if (!qrcode) return;
    
    const svg = qrcodeDiv.querySelector('svg');
    if (!svg) {
        showError('SVG formati mavjud emas');
        return;
    }
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = svgUrl;
    link.click();
    
    URL.revokeObjectURL(svgUrl);
}

function printQRCode() {
    if (!qrcode) return;
    
    const image = qrcodeDiv.querySelector('img');
    if (!image) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>QR Code</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <img src="${image.src}" alt="QR Code" />
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function validateInput(type, data) {
    if (!data) return false;
    
    switch(type) {
        case 'url':
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
            return urlRegex.test(data.replace('https://', ''));
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(data.split('mailto:')[1]?.split('?')[0] || '');
        case 'tel':
            const telRegex = /^\+?[\d\s-]{8,}$/;
            return telRegex.test(data.replace('tel:', ''));
        default:
            return true;
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, resultDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function scrollToResult() {
    resultDiv.scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function clearInputs() {
    document.querySelectorAll('input, textarea').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('select').forEach(select => {
        select.selectedIndex = 0;
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}