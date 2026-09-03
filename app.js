const video = document.getElementById('webcam');
const canvas = document.getElementById('capture-canvas');
const btnCapture = document.getElementById('btn-capture');
const statusText = document.getElementById('status-text');
const btnModel = document.getElementById('btn-model');
const btnScan = document.getElementById('btn-scan');
const resultSection = document.getElementById('result-section');
const scoreText = document.getElementById('score-text');

let currentMode = 'model'; // الوضع الافتراضي: نموذج الإجابة

// 1. تشغيل كاميرا الهاتف أو الكمبيوتر تلقائياً
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }, // يفضل الكاميرا الخلفية للهواتف
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("خطأ في تشغيل الكاميرا: ", err);
        alert("يرجى إعطاء صلاحية الوصول للكاميرا لتشغيل تطبيق المستر أحمد حسين.");
    }
}

// التبديل بين الأوضاع
btnModel.addEventListener('click', () => {
    currentMode = 'model';
    btnModel.classList.add('active');
    btnScan.classList.remove('active');
    statusText.innerText = "الوضع الحالي: إدخل نموذج الإجابة الأساسي";
    resultSection.style.display = 'none';
});

btnScan.addEventListener('click', () => {
    currentMode = 'scan';
    btnScan.classList.add('active');
    btnModel.classList.remove('active');
    statusText.innerText = "الوضع الحالي: تصحيح أوراق الطلاب مقارنة بالنموذج";
    resultSection.style.display = 'none';
});

// 2. التقاط الصورة عند الضغط على الزر
btnCapture.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // رسم اللقطة الحالية من الفيديو داخل الـ Canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // تحويل الصورة إلى صيغة Base64 لإرسالها لاحقاً للـ Backend (بايثون)
    const imageDataUrl = canvas.toDataUrl('image/jpeg');

    // محاكاة مؤقتة للنتيجة حتى نربط الـ Backend
    resultSection.style.display = 'block';
    if(currentMode === 'model') {
        scoreText.innerText = "تم حفظ النموذج ✅";
        document.getElementById('student-info').style.display = 'block';
    } else {
        // هنا سيتم وضع نتيجة التصحيح القادمة من OpenCV
        scoreText.innerText = "جاري التصحيح... ⏳"; 
    }
});

// تشغيل الكاميرا بمجرد تحميل الصفحة
window.addEventListener('DOMContentLoaded', startWebcam);
