A powerful Flask-based web application for image editing, background removal, and enhancement using AI-powered tools and free APIs.

https://img.shields.io/badge/Python-3.8+-blue.svg
https://img.shields.io/badge/Flask-2.3.3-green.svg
https://img.shields.io/badge/Pillow-10.0.0-orange.svg
https://img.shields.io/badge/AWS-EC2-yellow.svg
https://img.shields.io/badge/License-MIT-lightgrey.svg

✨ Features
🛠️ Image Enhancements
Contrast Adjustment - Improve image contrast

Brightness Control - Adjust image brightness levels

Sharpness Enhancement - Make images clearer and sharper

Color Boost - Enhance color saturation

Blur Effects - Apply Gaussian blur

Edge Detection - Find and highlight edges

Emboss Filter - Create 3D embossed effects

Smooth Filter - Soften image details

🔍 Background Tools
AI Background Removal - Using Remove.bg API

Simple Background Removal - Fallback algorithm using PIL

Background Color Addition - Add solid color backgrounds

Transparency Support - PNG format with alpha channel

🎯 Advanced Features
Real-time Preview - See changes instantly

Drag & Drop Upload - Easy image uploading

Multiple Format Support - JPEG, PNG, and more

Responsive Design - Works on desktop and mobile

Download Processed Images - Save your edits

🚀 Live Demo
Access the live application: http://YOUR_EC2_IP

Replace YOUR_EC2_IP with your actual EC2 instance public IP

📋 Prerequisites
Python 3.8+

pip (Python package manager)

Git

AWS EC2 Instance (for deployment)

🛠️ Installation
Local Development

1.Clone the repository
git clone https://github.com/umar2286/image-editor-app.git
cd image-editor-app
Create virtual environment

2.Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install dependencies

3.Install dependencies
pip install -r requirements.txt
Run the application

4.Run the application
python app.py

5.Access the app
Open your browser and navigate to: http://localhost:5000

Production Deployment on AWS EC2

1.Connect to your EC2 instance
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

2.Clone and deploy
git clone https://github.com/umar2286/image-editor-app.git
cd image-editor-app
chmod +x deployment.sh
./deployment.sh

3.Access your deployed app
Visit: http://YOUR_EC2_IP

📁 Project Structure
image-editor-app/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── deployment.sh         # EC2 deployment script
├── .gitignore           # Git ignore rules
├── templates/
│   └── index.html       # Main web interface
├── static/
│   ├── style.css        # CSS stylesheets
│   └── script.js        # Frontend JavaScript
└── uploads/
    └── .gitkeep         # Keep uploads directory

🔧 Configuration
Environment Variables (Optional)

Create a .env file for API keys: 
REMOVEBG_API_KEY=your_removebg_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

Free API Setup

1.Remove.bg API (Background Removal)
Visit: remove.bg/api
Sign up for free account (1 image/month)
Get API key and replace in app.py

2.Cloudinary (Advanced Filters)
Visit: cloudinary.com
Free tier with 25 credits/month
Get cloud name, API key, and secret

🎮 Usage Guide
Basic Image Editing

1.Upload Image
Click "Choose File" or drag & drop image
Supported formats: JPG, JPEG, PNG, GIF
Maximum file size: 16MB

2.Apply Enhancements
Click any enhancement button (Contrast, Brightness, etc.)
See real-time changes in the preview panel
Multiple enhancements can be applied sequentially

3.Background Removal
Click "Remove Background (AI)" for AI-powered removal
Use "Simple BG Remove" for basic algorithm
Download transparent PNG result

4.Add Background
Choose from preset colors or custom color
Apply to images with transparent backgrounds

5.Download Result
Click "Download Image" to save processed image
Maintains original quality and format

Keyboard Shortcuts
Ctrl + Z - Reset to original image
Ctrl + S - Download processed image

🔌 API Endpoints
Endpoint	Method	Description
/	GET	Main application interface
/health	GET	Health check endpoint
/enhance	POST	Apply image enhancements
/remove-bg	POST	Remove background using AI
/simple-remove-bg	POST	Simple background removal
/add-background	POST	Add solid color background
/reset	POST	Reset to original image
/download	POST	Download processed image

🛡️ Error Handling
File Size Limits: Maximum 16MB file size
Format Validation: Only image files accepted
API Fallbacks: Automatic fallback to local processing
Network Issues: Graceful error messages
Memory Management: Efficient image processing

🌐 Deployment
AWS EC2 Deployment Steps

1.Launch EC2 Instance
Amazon Linux 2 AMI
t2.micro (free tier eligible)
Security group with HTTP (80) and SSH (22) access

2.Automatic Deployment
./deployment.sh

3.Manual Deployment
# Install dependencies
sudo yum update -y
sudo yum install -y python3 python3-pip nginx

# Setup application
cd image-editor-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure services
sudo systemctl enable nginx
sudo systemctl start nginx

🐛 Troubleshooting
Common Issues

1.Permission Denied (SSH)
chmod 400 your-key.pem
ssh -i "your-key.pem" ec2-user@YOUR_EC2_IP

2.Port Already in Use
sudo lsof -i :5000
sudo kill -9 <PID>

3.Module Not Found
pip install -r requirements.txt

4.Nginx Configuration Error
sudo nginx -t
sudo systemctl restart nginx

Logs Location
Application Logs: sudo journalctl -u image-editor -f
Nginx Logs: sudo tail -f /var/log/nginx/error.log
System Logs: sudo tail -f /var/log/messages

🔄 Updating the Application

Local Development
git pull origin main
pip install -r requirements.txt
python app.py

Production Update
# On EC2 instance
cd ~/image-editor-app
git pull origin main
sudo systemctl restart image-editor

🤝 Contributing
We welcome contributions! Please follow these steps:

1.Fork the repository
2.Create a feature branch: git checkout -b feature/amazing-feature
3.Commit your changes: git commit -m 'Add amazing feature'
4.Push to the branch: git push origin feature/amazing-feature
5.Open a Pull Request

Development Setup
# Install development dependencies
pip install -r requirements.txt

# Run tests (when available)
python -m pytest

# Code formatting
autopep8 --in-place --aggressive --aggressive *.py

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Flask - Web framework
Pillow (PIL) - Image processing
Remove.bg - Background removal API
Cloudinary - Image transformation API
AWS EC2 - Cloud hosting
Bootstrap - UI components inspiration

📞 Support
If you encounter any issues or have questions:
Check existing issues: GitHub Issues
Create new issue: Provide detailed description and steps to reproduce
Email: umarraza.286@gmail.com

🚀 Future Enhancements
User authentication system
Image batch processing
Advanced filters and effects
Social sharing integration
Mobile app version
Admin dashboard
Payment integration for premium features

Made with ❤️ by Umar Raza
If you find this project helpful, please give it a ⭐ on GitHub!
