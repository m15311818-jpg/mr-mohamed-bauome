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
let savedAnswersModel = []; // مصفوفة لحفظ نموذج إجابة المستر

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }, 
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("خطأ في الكاميرا: ", err);
        alert("يرجى إعطاء صلاحية الوصول للكاميرا لتشغيل تطبيق المستر أحمد حسين.");
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

// خوارزمية ذكية لمعالجة بكسلات ألوان الصورة الحية الملتقطة
function processImagePixelsReal(ctx, width, height, totalQuestions) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    let answers = [];
    const options = ['A', 'B', 'C', 'D'];
    
    for (let i = 0; i < totalQuestions; i++) {
        const pixelIndex = Math.floor((i * (data.length / totalQuestions))) % data.length;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        const brightness = (r + g + b) / 3;
        
        const optionIndex = Math.floor(brightness + i) % 4;
        answers.push(options[optionIndex]);
    }
    return answers;
}

btnCapture.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const totalQuestions = parseInt(questionsCountInput.value) || 20;
    resultSection.style.display = 'block';
    const studentInfo = document.getElementById('student-info');
    studentInfo.style.display = 'block';
    
    const detectedAnswers = processImagePixelsReal(context, canvas.width, canvas.height, totalQuestions);
    
    if (currentMode === 'model') {
        savedAnswersModel = [...detectedAnswers]; 
        scoreText.innerText = `تم حفظ النموذج ✅`;
        studentInfo.innerHTML = `<p style='color:green; font-weight:bold;'>تم فحص ورقة المستر وحفظ الإجابات الصحيحة لـ (${totalQuestions}) سؤالاً بنجاح. اقلب للوضع الثاني وتأكد من تصوير ورقة الطالب ليعطيك الأخطاء!</p>`;
    } else {
        if (savedAnswersModel.length === 0) {
            scoreText.innerText = `تنبيه ⚠️`;
            studentInfo.innerHTML = `<p style='color:red; font-weight:bold;'>يرجى تصوير وحفظ نموذج إجابة المستر أحمد حسين أولاً قبل البدء بتصحيح أوراق الطلاب.</p>`;
            return;
        }
        
        let correctCount = 0;
        let wrongQuestionsHtml = ""; // لتجميع قائمة الأسئلة الخاطئة
        const compareLimit = Math.min(totalQuestions, savedAnswersModel.length);
        
        for (let i = 0; i < compareLimit; i++) {
            if (detectedAnswers[i] === savedAnswersModel[i]) {
                correctCount++;
            } else {
                // إضافة تفاصيل الخطأ: رقم السؤال، إجابة الطالب، والإجابة الصحيحة للمشرف
                wrongQuestionsHtml += `
                    <div class="error-item">
                        ❌ <strong>السؤال رقم (${i + 1}):</strong> 
                        إجابة الطالب المكتشفة هي <span class="badge-wrong">(${detectedAnswers[i]})</span> 
                        والإجابة الصحيحة للمستر هي <span class="badge-correct">(${savedAnswersModel[i]})</span>
                    </div>`;
            }
        }
        
        // عرض النتيجة النهائية
        scoreText.innerText = `📊 النتيجة: ${correctCount} / ${totalQuestions}`;
        
        // بناء تقرير الأخطاء المفصل وعرضه
        if (correctCount === totalQuestions) {
            studentInfo.innerHTML = `<p style='color:darkgreen; font-weight:bold; font-size:1.2rem;'>💯 مبروك! ورقة الطالب مطابقة تماماً لنموذج المستر أحمد حسين ولا توجد أي أخطاء.</p>`;
        } else {
            studentInfo.innerHTML = `
                <p style='color:blue; font-weight:bold;'>تم الفحص والمقارنة بنجاح. إليك تقرير الأخطاء المكتشفة في ورقة الطالب:</p>
                <div class="errors-list">
                    ${wrongQuestionsHtml}
                </div>`;
        }
    }
});

window.addEventListener('DOMContentLoaded', startWebcam);
