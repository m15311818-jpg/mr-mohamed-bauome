from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64

app = Flask(__name__)
# تفعيل CORS لضمان أن رابط Vercel يستطيع الاتصال بسيرفر Zeabur بدون أي مشاكل أمنية
CORS(app)

@app.route('/')
def home():
    return "سيرفر المستر أحمد حسين لتصحيح الامتحانات يعمل بنجاح على منصة Zeabur! 🚀"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. استقبال البيانات من واجهة Vercel
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "لم يتم إرسال أي بيانات"})
            
        image_data = data.get('image')  # الصورة المشفرة القادمة من الكاميرا
        total_questions = int(data.get('questions', 20))  # عدد الأسئلة المطلوب تصحيحه
        mode = data.get('mode', 'scan')  # الوضع الحالي (model أو scan)
        
        if not image_data:
            return jsonify({"status": "error", "message": "لم يتم استقبال الصورة من الكاميرا"})

        # 2. تحويل الصورة من نص مشفر (Base64) إلى مصفوفة صور يفهمها OpenCV
        if ',' in image_data:
            encoded_data = image_data.split(',')[1]
        else:
            encoded_data = image_data
            
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"status": "error", "message": "فشل OpenCV في قراءة الصورة الحالية"})

        # 3. معالجة الصورة برمجياً بحسب بكسلات الإضاءة والتظليل الحقيقية
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        # عتبة التظليل: تحويل الصورة للأبيض والأسود النقي لتحديد الدوائر المظللة بالكامل
        _, thresh = cv2.threshold(blurred, 100, 255, cv2.THRESH_BINARY_INV)
        
        # استخراج الإجابات بناءً على المناطق الأكثر غماقة (تظليلاً) في مصفوفة الصورة
        detected_answers = []
        options = ['A', 'B', 'C', 'D']
        
        # تقسيم مصفوفة الصورة برمجياً لفحص الدوائر بناءً على عدد الأسئلة المختار
        height, width = thresh.shape
        row_height = height / max(total_questions, 1)
        
        for q in range(total_questions):
            # تحديد السطر الخاص بالسؤال الحالي
            start_y = int(q * row_height)
            end_y = int((q + 1) * row_height)
            question_row = thresh[start_y:end_y, 0:width]
            
            # تقسيم السطر إلى 4 أجزاء متساوية تمثل الاختيارات (A, B, C, D)
            col_width = width / 4
            darkness_scores = []
            
            for o in range(4):
                start_x = int(o * col_width)
                end_x = int((o + 1) * col_width)
                option_box = question_row[:, start_x:end_x]
                # حساب عدد البكسلات المظللة (البيضاء في المصفوفة المعكوسة)
                pixel_count = cv2.countNonZero(option_box)
                darkness_scores.append(pixel_count)
            
            # الخيار المقروء هو الخيار الذي يحتوي على أعلى نسبة تظليل (بكسلات داكنة)
            chosen_index = np.argmax(darkness_scores)
            detected_answers.append(options[chosen_index])

        # 4. إرجاع مصفوفة الإجابات الحقيقية المستخرجة من الورقة
        return jsonify({
            "status": "success",
            "mode": mode,
            "detected_answers": detected_answers,
            "total_questions": total_questions,
            "message": "تمت معالجة بكسلات الصورة الحقيقية بنجاح عبر OpenCV"
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": f"حدث خطأ في السيرفر: {str(e)}"})

# إعداد المنفذ المتوافق تماماً مع إعدادات Zeabur التلقائية
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
