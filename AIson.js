// Content Platform JavaScript
class ContentPlatform {
    constructor() {
        this.currentContentType = 'text';
        this.selectedFile = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.promptInput = document.getElementById('prompt-input');
        this.contentTypeButtons = document.querySelectorAll('.content-type-btn');
        this.uploadSection = document.getElementById('upload-section');
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileInfo = document.getElementById('file-info');
        this.filePreview = document.getElementById('file-preview');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.removeFileBtn = document.getElementById('remove-file');
        this.previewSection = document.getElementById('preview-section');
        this.previewContent = document.getElementById('preview-content');
        this.generateBtn = document.getElementById('generate-btn');
        this.clearBtn = document.getElementById('clear-btn');
    }

    attachEventListeners() {
        // Content type selection
        this.contentTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectContentType(e.target.closest('.content-type-btn').dataset.type);
            });
        });

        // File upload
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.style.background = '#f0f2ff';
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.style.background = '#f8f9ff';
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.style.background = '#f8f9ff';
            const file = e.dataTransfer.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });

        // Remove file
        this.removeFileBtn.addEventListener('click', () => {
            this.removeFile();
        });

        // Generate content
        this.generateBtn.addEventListener('click', () => {
            this.generateContent();
        });

        // Clear all
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        // Prompt input change
        this.promptInput.addEventListener('input', () => {
            this.updatePreview();
        });
    }

    selectContentType(type) {
        this.currentContentType = type;
        
        // Update button states
        this.contentTypeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });

        // Show/hide upload section
        if (type === 'image' || type === 'video') {
            this.uploadSection.style.display = 'block';
            this.updateFileInputAccept();
        } else {
            this.uploadSection.style.display = 'none';
            this.removeFile();
        }

        this.updatePreview();
    }

    updateFileInputAccept() {
        if (this.currentContentType === 'image') {
            this.fileInput.accept = 'image/*';
        } else if (this.currentContentType === 'video') {
            this.fileInput.accept = 'video/*';
        }
    }

    handleFileUpload(file) {
        if (!file) return;

        // Validate file type
        const isValidType = this.validateFileType(file);
        if (!isValidType) {
            alert(`Please select a valid ${this.currentContentType} file.`);
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        this.updatePreview();
    }

    validateFileType(file) {
        if (this.currentContentType === 'image') {
            return file.type.startsWith('image/');
        } else if (this.currentContentType === 'video') {
            return file.type.startsWith('video/');
        }
        return false;
    }

    displayFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.currentContentType === 'image') {
                this.filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            } else if (this.currentContentType === 'video') {
                this.filePreview.innerHTML = `<video src="${e.target.result}" controls></video>`;
            }
        };
        reader.readAsDataURL(file);

        this.uploadArea.style.display = 'none';
        this.fileInfo.style.display = 'flex';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.updatePreview();
    }

    updatePreview() {
        const prompt = this.promptInput.value.trim();
        
        if (!prompt) {
            this.previewSection.style.display = 'none';
            return;
        }

        this.previewSection.style.display = 'block';
        
        if (this.currentContentType === 'text') {
            this.previewContent.innerHTML = `<p>${this.escapeHtml(prompt)}</p>`;
        } else if (this.currentContentType === 'image' && this.selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewContent.innerHTML = `
                    <div>
                        <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
                        <p style="margin-top: 10px; color: #666;">${this.escapeHtml(prompt)}</p>
                    </div>
                `;
            };
            reader.readAsDataURL(this.selectedFile);
        } else if (this.currentContentType === 'video' && this.selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.previewContent.innerHTML = `
                    <div>
                        <video src="${e.target.result}" controls style="max-width: 100%; max-height: 300px; border-radius: 8px;"></video>
                        <p style="margin-top: 10px; color: #666;">${this.escapeHtml(prompt)}</p>
                    </div>
                `;
            };
            reader.readAsDataURL(this.selectedFile);
        } else {
            this.previewContent.innerHTML = `<p style="color: #666; font-style: italic;">Please upload a ${this.currentContentType} file to see preview</p>`;
        }
    }

    generateContent() {
        const prompt = this.promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt first!');
            return;
        }

        if ((this.currentContentType === 'image' || this.currentContentType === 'video') && !this.selectedFile) {
            alert(`Please upload a ${this.currentContentType} file first!`);
            return;
        }

        // Simulate content generation
        this.showLoadingState();
        
        setTimeout(() => {
            this.showGeneratedContent();
        }, 2000);
    }

    showLoadingState() {
        this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        this.generateBtn.disabled = true;
    }

    showGeneratedContent() {
        this.generateBtn.innerHTML = '<i class="fas fa-check"></i> Generated!';
        this.generateBtn.disabled = false;
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 10px; margin-top: 20px; border: 1px solid #c3e6cb;">
                <i class="fas fa-check-circle"></i> Content generated successfully! 
                Your ${this.currentContentType} content is ready.
            </div>
        `;
        
        this.previewSection.appendChild(successMessage);
        
        // Reset button after 3 seconds
        setTimeout(() => {
            this.generateBtn.innerHTML = '<i class="fas fa-play"></i> Generate Content';
        }, 3000);
    }

    clearAll() {
        this.promptInput.value = '';
        this.removeFile();
        this.previewSection.style.display = 'none';
        this.selectContentType('text');
        
        // Remove success messages
        const successMessages = document.querySelectorAll('.success-message');
        successMessages.forEach(msg => msg.remove());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the platform when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContentPlatform();
});
async function generateContent(prompt, type) {
    previewContent.innerHTML = `<p>Generating ${type}...</p>`;
    const apiKey = "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"; // // Replace with your actual OpenAI API key
    if (type === 'text') {
        try {
            const response = await fetch("https://api.openai.com/v1/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "text-davinci-003",
                    prompt: prompt,
                    max_tokens: 150
                })
            });

            const data = await response.json();
            const output = data.choices?.[0]?.text || "No response received.";
            previewContent.innerHTML = `<p>${output}</p>`;
        } catch (error) {
            previewContent.innerHTML = `<p>Error generating text: ${error.message}</p>`;
        }

    } else if (type === 'image') {
        try {
            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n: 1,
                    size: "512x512"
                })
            });

            const data = await response.json();
            const imageUrl = data.data?.[0]?.url;

            if (imageUrl) {
                previewContent.innerHTML = `<img src="${imageUrl}" alt="Generated Image" style="border-radius:10px; max-width:100%;"/>`;
            } else {
                previewContent.innerHTML = "<p>No image returned.</p>";
            }
        } catch (error) {
            previewContent.innerHTML = `<p>Error generating image: ${error.message}</p>`;
        }
    } else {
        previewContent.innerHTML = "<p>Unsupported content type selected.</p>";
    }
}
