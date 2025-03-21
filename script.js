let originalImage = null;
let aspectRatio = 1;

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            originalImage = img;
            aspectRatio = img.width / img.height;
            document.getElementById('width').value = img.width;
            document.getElementById('height').value = img.height;
            document.getElementById('resizeBtn').disabled = false;
            document.getElementById('preview').innerHTML = '<p>Original image loaded. Set options and click "Resize Image".</p>';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function toggleMode() {
    const mode = document.querySelector('input[name="resizeMode"]:checked').value;
    document.getElementById('pixelOptions').style.display = mode === 'pixel' ? 'block' : 'none';
    document.getElementById('sizeOptions').style.display = mode === 'size' ? 'block' : 'none';
}

async function resizeImage() {
    if (!originalImage) return;

    const format = document.getElementById('format').value;
    const mode = document.querySelector('input[name="resizeMode"]:checked').value;
    const previewDiv = document.getElementById('preview');
    previewDiv.innerHTML = 'Resizing...';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let resizedImageData;

    if (mode === 'pixel') {
        let width = parseInt(document.getElementById('width').value);
        let height = parseInt(document.getElementById('height').value);
        const lockAspect = document.getElementById('lockAspect').checked;

        if (lockAspect) {
            height = Math.round(width / aspectRatio);
            document.getElementById('height').value = height;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(originalImage, 0, 0, width, height);
        resizedImageData = canvas.toDataURL(format);
    } else if (mode === 'size') {
        const targetSizeKB = parseInt(document.getElementById('targetSize').value) * 1024; // Convert KB to bytes
        let quality = 0.9; // Start with high quality
        let width = originalImage.width;
        let height = originalImage.height;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(originalImage, 0, 0, width, height);

        do {
            resizedImageData = canvas.toDataURL(format, quality);
            const sizeInBytes = Math.round((resizedImageData.length - 'data:image/jpeg;base64,'.length) * 3 / 4); // Approximate size
            if (sizeInBytes > targetSizeKB && quality > 0.1) {
                quality -= 0.1; // Reduce quality incrementally
            } else {
                break;
            }
        } while (true);
    }

    // Display preview and file size
    const resizedImage = new Image();
    resizedImage.src = resizedImageData;
    previewDiv.innerHTML = '';
    previewDiv.appendChild(resizedImage);

    const sizeInBytes = Math.round((resizedImageData.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    document.getElementById('fileSizeInfo').style.display = 'block';
    document.getElementById('fileSizeInfo').textContent = `File Size: ${sizeInKB} KB`;

    // Enable download
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadBtn').dataset.url = resizedImageData;
}

function downloadImage() {
    const url = document.getElementById('downloadBtn').dataset.url;
    const format = document.getElementById('format').value.split('/')[1];
    const link = document.createElement('a');
    link.href = url;
    link.download = `resized_image.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Aspect ratio locking for pixel mode
document.getElementById('width').addEventListener('input', function() {
    if (document.getElementById('lockAspect').checked && originalImage) {
        const width = parseInt(this.value);
        document.getElementById('height').value = Math.round(width / aspectRatio);
    }
});

document.getElementById('height').addEventListener('input', function() {
    if (document.getElementById('lockAspect').checked && originalImage) {
        const height = parseInt(this.value);
        document.getElementById('width').value = Math.round(height * aspectRatio);
    }
});
