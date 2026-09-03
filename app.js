const video = document.getElementById('webcam');
const canvas = document.getElementById('capture-canvas');
const btnCapture = document.getElementById('btn-capture');
const statusText = document.getElementById('status-text');
const btnModel = document.getElementById('btn-model');
const btnScan = document.getElementById('btn-scan');
const resultSection = document.getElementById('result-section');
const scoreText = document.getElementById('score-text');
const questionsCountInput = document.getElementById('questions-count');

let currentMode = 'model'; 

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }, 
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("خطأ في تشغيل الكاميرا: ", err);
        alert("يرجى إعطاء صلاحية الوصول للكاميرا.");
    }
}

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

btnCapture.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const totalQuestions = parseInt(questionsCountInput.value) || 20;
    
    resultSection.style.display = 'block';
    const studentInfo = document.getElementById('student-info');
    studentInfo.style.display = 'block';
    
    if(currentMode === 'model') {
        scoreText.innerText = `تم حفظ النموذج ✅`;
        studentInfo.innerHTML = `<p style='color:green;'>تم قراءة نموذج الإجابة لـ (${totalQuestions}) سؤالاً بنجاح للمستر أحمد حسين.</p>`;
    } else {
        // رسالة مؤقتة تشرح للمستخدم الخطوة القادمة
        scoreText.innerText = `جاري المعالجة...`;
        studentInfo.innerHTML = `<p style='color:orange;'>الواجهة جاهزة. الآن سنقوم بكتابة كود البايثون (Backend) وربطه هنا لتظهر النتيجة الأصلية بناءً على ورقة الطالب المُلتقطة فعلياً.</p>`;
    }
});

window.addEventListener('DOMContentLoaded', startWebcam);
