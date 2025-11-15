// Global variables
let originalImageData = null;
let currentProcessedImage = null;
let originalFile = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDragAndDrop();
    checkHealth();
});

// Check server health
async function checkHealth() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('Server status:', data.status);
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

// Drag and drop functionality
function initializeDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

// Handle file selection
function handleFileSelect(file) {
    if (!file.type.match('image.*')) {
        showStatus('Please select a valid image file (JPEG, PNG, etc.)', 'error');
        return;
    }
    
    if (file.size > 16 * 1024 * 1024) {
        showStatus('File too large. Maximum size is 16MB.', 'error');
        return;
    }
    
    originalFile = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImageData = e.target.result;
        currentProcessedImage = e.target.result;
        
        // Update UI
        document.getElementById('originalImage').src = originalImageData;
        document.getElementById('originalImage').style.display = 'block';
        document.getElementById('processedImage').style.display = 'none';
        document.getElementById('imagePlaceholder').style.display = 'flex';
        
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('previewSection').style.display = 'block';
        document.getElementById('toolsSection').style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
        
        showStatus('Image uploaded successfully! You can now apply edits.', 'success');
    };
    reader.readAsDataURL(file);
}

// Reset upload
function resetUpload() {
    originalImageData = null;
    currentProcessedImage = null;
    originalFile = null;
    
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    document.getElementById('toolsSection').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('imageInput').value = '';
    
    showStatus('Upload reset. You can select a new image.', 'warning');
}

// Show status messages
function showStatus(message, type = 'success') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Show loading
function showLoading(message = 'Processing your image...') {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loading').style.display = 'flex';
}

// Hide loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Apply image enhancement
async function applyEnhancement(enhancement) {
    if (!originalFile) {
        showStatus('Please upload an image first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', originalFile);
    formData.append('enhancement', enhancement);
    
    try {
        showLoading(`Applying ${enhancement} enhancement...`);
        
        const response = await fetch('/enhance', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (result.success) {
            displayProcessedImage(result.image);
            showStatus(result.message, 'success');
        } else {
            showStatus('Error: ' + result.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Remove background using AI
async function removeBackground() {
    if (!originalFile) {
        showStatus('Please upload an image first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', originalFile);
    
    try {
        showLoading('Removing background using AI... This may take a moment.');
        
        const response = await fetch('/remove-bg', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (result.success) {
            displayProcessedImage(result.image);
            showStatus(result.message, 'success');
        } else {
            if (result.fallback) {
                showStatus(result.error + ' Trying fallback method...', 'warning');
                // Automatically try fallback method
                setTimeout(() => simpleRemoveBackground(), 1000);
            } else {
                showStatus('Error: ' + result.error, 'error');
            }
        }
    } catch (error) {
        hideLoading();
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Simple background removal (fallback)
async function simpleRemoveBackground() {
    if (!originalFile) {
        showStatus('Please upload an image first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', originalFile);
    
    try {
        showLoading('Applying simple background removal...');
        
        const response = await fetch('/simple-remove-bg', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (result.success) {
            displayProcessedImage(result.image);
            showStatus(result.message, 'success');
        } else {
            showStatus('Error: ' + result.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Show background color picker
function showBackgroundColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.style.display = colorPicker.style.display === 'none' ? 'block' : 'none';
}

// Add background color
async function addBackground(color) {
    if (!originalFile) {
        showStatus('Please upload an image first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', originalFile);
    formData.append('color', color);
    
    try {
        showLoading(`Adding ${color} background...`);
        
        const response = await fetch('/add-background', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (result.success) {
            displayProcessedImage(result.image);
            showStatus(result.message, 'success');
            document.getElementById('colorPicker').style.display = 'none';
        } else {
            showStatus('Error: ' + result.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Reset to original image
async function resetToOriginal() {
    if (!originalFile) {
        showStatus('Please upload an image first', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('image', originalFile);
    
    try {
        showLoading('Resetting to original image...');
        
        const response = await fetch('/reset', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (result.success) {
            displayProcessedImage(result.image);
            showStatus(result.message, 'success');
        } else {
            showStatus('Error: ' + result.error, 'error');
        }
    } catch (error) {
        hideLoading();
        showStatus('Network error: ' + error.message, 'error');
    }
}

// Display processed image
function displayProcessedImage(imageData) {
    currentProcessedImage = imageData;
    const processedImg = document.getElementById('processedImage');
    const placeholder = document.getElementById('imagePlaceholder');
    
    processedImg.src = imageData;
    processedImg.style.display = 'block';
    placeholder.style.display = 'none';
}

// Download image
async function downloadImage() {
    if (!currentProcessedImage) {
        showStatus('No processed image to download', 'error');
        return;
    }
    
    try {
        showLoading('Preparing download...');
        
        const formData = new FormData();
        formData.append('image_data', currentProcessedImage);
        
        const response = await fetch('/download', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        hideLoading();
        
        if (result.success) {
            // Create download link
            const link = document.createElement('a');
            link.href = currentProcessedImage;
            link.download = result.filename || 'edited-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showStatus('Image downloaded successfully!', 'success');
        } else {
            // Fallback to client-side download
            const link = document.createElement('a');
            link.href = currentProcessedImage;
            link.download = 'edited-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showStatus('Image downloaded using fallback method!', 'success');
        }
    } catch (error) {
        hideLoading();
        // Fallback to client-side download
        const link = document.createElement('a');
        link.href = currentProcessedImage;
        link.download = 'edited-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showStatus('Image downloaded using fallback method!', 'success');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'z':
                e.preventDefault();
                resetToOriginal();
                break;
            case 's':
                e.preventDefault();
                downloadImage();
                break;
        }
    }
});