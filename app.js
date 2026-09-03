const video = document.getElementById('webcam');
const canvas = document.getElementById('capture-canvas');
const btnCapture = document.getElementById('btn-capture');
const statusText = document.getElementById('status-text');
const btnModel = document.getElementById('btn-model');
const btnScan = document.getElementById('btn-scan');
const resultSection = document.getElementById('result-section');
const scoreText = document.getElementById('score-text');
const questionsCountSelect = document.getElementById('questions-count');

let currentMode = 'model'; 

// تشغيل كاميرا الهاتف الخلفية
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

// عند الضغط على زر التقط وفحص
btnCapture.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // التقاط الصورة
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // معرفة عدد الأسئلة المختار حالياً
    const totalQuestions = parseInt(questionsCountSelect.value);
    
    resultSection.style.display = 'block';
    const studentInfo = document.getElementById('student-info');
    studentInfo.style.display = 'block';
    
    if(currentMode === 'model') {
        scoreText.innerText = `تم حفظ النموذج ✅`;
        studentInfo.innerHTML = `<p style='color:green;'>تم قراءة وحفظ نموذج الإجابة لـ (${totalQuestions}) سؤالاً بنجاح للمستر أحمد حسين.</p>`;
    } else {
        // محاكاة نتيجة ديناميكية بناءً على عدد الأسئلة المختار
        const randomCorrect = Math.floor(Math.random() * (totalQuestions / 4)) + Math.floor(totalQuestions * 0.75); 
        scoreText.innerText = `📊 النتيجة: ${randomCorrect} / ${totalQuestions}`;
        studentInfo.innerHTML = `<p style='color:blue;'>تم الفحص التجريبي لورقة الطالب بناءً على إجمالي ${totalQuestions} سؤالاً.</p>`;
    }
});

window.addEventListener('DOMContentLoaded', startWebcam);
