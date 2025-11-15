from flask import Flask, render_template, request, jsonify, send_file
import requests
import os
import base64
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter
import json
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Free API Keys (Replace with your own after signing up)
CLOUDINARY_CLOUD_NAME = "demo"  # Using demo account
REMOVEBG_API_KEY = "your_removebg_key_here"  # Get from remove.bg

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/enhance', methods=['POST'])
def enhance_image():
    try:
        # Get image and enhancement type
        image_file = request.files['image']
        enhancement = request.form.get('enhancement', 'contrast')
        
        # Open image
        image = Image.open(image_file.stream)
        
        # Store original format
        original_format = image.format
        
        # Apply enhancements
        if enhancement == 'contrast':
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)
        elif enhancement == 'brightness':
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(1.3)
        elif enhancement == 'sharpness':
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(2.0)
        elif enhancement == 'color':
            enhancer = ImageEnhance.Color(image)
            image = enhancer.enhance(1.2)
        elif enhancement == 'blur':
            image = image.filter(ImageFilter.GaussianBlur(2))
        elif enhancement == 'sharpen':
            image = image.filter(ImageFilter.SHARPEN)
        elif enhancement == 'edges':
            image = image.filter(ImageFilter.FIND_EDGES)
        elif enhancement == 'emboss':
            image = image.filter(ImageFilter.EMBOSS)
        elif enhancement == 'smooth':
            image = image.filter(ImageFilter.SMOOTH)
        
        # Convert to RGB if necessary for JPEG
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to base64 for response
        buffered = BytesIO()
        
        # Use appropriate format
        if original_format == 'PNG':
            image.save(buffered, format="PNG")
            mime_type = "image/png"
        else:
            image.save(buffered, format="JPEG", quality=85)
            mime_type = "image/jpeg"
            
        buffered.seek(0)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'image': f"data:{mime_type};base64,{img_str}",
            'message': f'Applied {enhancement} enhancement'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    try:
        image_file = request.files['image']
        
        # Check if API key is set
        if REMOVEBG_API_KEY == "your_removebg_key_here":
            return jsonify({
                'success': False, 
                'error': 'Remove.bg API key not configured. Using fallback method.',
                'fallback': True
            })
        
        # Using Remove.bg API
        response = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files={'image_file': image_file},
            data={'size': 'auto'},
            headers={'X-Api-Key': REMOVEBG_API_KEY},
        )
        
        if response.status_code == 200:
            # Convert response to base64
            img_str = base64.b64encode(response.content).decode()
            return jsonify({
                'success': True,
                'image': f"data:image/png;base64,{img_str}",
                'message': 'Background removed using AI'
            })
        else:
            return jsonify({
                'success': False, 
                'error': f'API Error: {response.status_code}',
                'fallback': True
            })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'fallback': True})

@app.route('/simple-remove-bg', methods=['POST'])
def simple_remove_bg():
    """Fallback method using PIL for basic background removal"""
    try:
        image_file = request.files['image']
        image = Image.open(image_file.stream)
        
        # Convert to RGBA if not already
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        # Simple background removal (remove white/light backgrounds)
        datas = image.getdata()
        new_data = []
        
        for item in datas:
            # Remove white and light gray backgrounds
            if item[0] > 200 and item[1] > 200 and item[2] > 200:
                new_data.append((255, 255, 255, 0))  # Transparent
            # Remove black backgrounds (optional)
            elif item[0] < 50 and item[1] < 50 and item[2] < 50:
                new_data.append((0, 0, 0, 0))  # Transparent
            else:
                new_data.append(item)
        
        image.putdata(new_data)
        
        # Convert to base64
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'image': f"data:image/png;base64,{img_str}",
            'message': 'Background removed using simple algorithm'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/add-background', methods=['POST'])
def add_background():
    """Add a background color to transparent images"""
    try:
        image_file = request.files['image']
        bg_color = request.form.get('color', '#ffffff')  # Default white
        
        image = Image.open(image_file.stream)
        
        # Convert hex color to RGB
        bg_color = bg_color.lstrip('#')
        bg_rgb = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
        
        # Create new image with background
        if image.mode == 'RGBA':
            background = Image.new('RGB', image.size, bg_rgb)
            background.paste(image, (0, 0), image)
            result_image = background
        else:
            # If image doesn't have alpha channel, just return original
            result_image = image
        
        # Convert to base64
        buffered = BytesIO()
        result_image.save(buffered, format="JPEG", quality=90)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'image': f"data:image/jpeg;base64,{img_str}",
            'message': f'Added {bg_color} background'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/reset', methods=['POST'])
def reset_image():
    """Reset to original image"""
    try:
        image_file = request.files['image']
        
        # Convert to base64
        buffered = BytesIO()
        image = Image.open(image_file.stream)
        
        if image.format == 'PNG':
            image.save(buffered, format="PNG")
            mime_type = "image/png"
        else:
            image.save(buffered, format="JPEG", quality=90)
            mime_type = "image/jpeg"
            
        buffered.seek(0)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'image': f"data:{mime_type};base64,{img_str}",
            'message': 'Image reset to original'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/download', methods=['POST'])
def download_image():
    """Download processed image"""
    try:
        image_data = request.form.get('image_data')
        
        if not image_data or 'base64,' not in image_data:
            return jsonify({'success': False, 'error': 'No image data provided'})
        
        # Extract base64 data
        header, data = image_data.split('base64,')
        image_bytes = base64.b64decode(data)
        
        # Save to file
        filename = f"edited_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if 'image/png' in header:
            filename += '.png'
        else:
            filename += '.jpg'
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'message': 'Image saved successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Error handlers
@app.errorhandler(413)
def too_large(e):
    return jsonify({'success': False, 'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Image Editor App...")
    print("📧 Access at: http://localhost:5000")
    print("❤️  Health check: http://localhost:5000/health")
    app.run(host='0.0.0.0', port=5000, debug=True)