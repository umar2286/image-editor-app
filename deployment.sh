#!/bin/bash

# Image Editor App Deployment Script for Amazon Linux 2
echo "🚀 Starting Image Editor App Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install dependencies
echo "📥 Installing system dependencies..."
sudo yum install -y python3 python3-pip python3-devel git nginx gcc-c++ make

# Create project directory
echo "📁 Setting up project directory..."
mkdir -p /home/ec2-user/image-editor
cd /home/ec2-user/image-editor

# Setup Python virtual environment
echo "🐍 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo "📚 Installing Python packages..."
pip install --upgrade pip
pip install flask pillow requests cloudinary gunicorn

# Create necessary directories
mkdir -p uploads static templates

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R ec2-user:ec2-user /home/ec2-user/image-editor
chmod -R 755 /home/ec2-user/image-editor

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/conf.d/image-editor.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /static {
        alias /home/ec2-user/image-editor/static;
        expires 30d;
    }
    
    client_max_body_size 16M;
}
EOF

# Test nginx configuration
sudo nginx -t

# Create systemd service
echo "🔧 Creating systemd service..."
sudo tee /etc/systemd/system/image-editor.service > /dev/null <<EOF
[Unit]
Description=Image Editor Flask Application
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/image-editor
Environment="PATH=/home/ec2-user/image-editor/venv/bin"
ExecStart=/home/ec2-user/image-editor/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 3 --timeout 120 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Or for AWS Security Groups - remind user
echo "🔐 Please ensure your EC2 Security Group allows HTTP traffic on port 80"

# Start services
echo "🚀 Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable image-editor
sudo systemctl start image-editor
sudo systemctl enable nginx
sudo systemctl start nginx

# Check service status
echo "📊 Checking service status..."
sudo systemctl status image-editor --no-pager
sudo systemctl status nginx --no-pager

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "🎉 Deployment completed!"
echo "🌍 Your app should be available at: http://$PUBLIC_IP"
echo "❤️  Health check: http://$PUBLIC_IP/health"
echo "📝 Check logs: sudo journalctl -u image-editor -f"