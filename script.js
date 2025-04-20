const url = "https://api.cloudinary.com/v1_1/djglvd8dc/upload";
const preset = "wedding";

function showPage(pageId) {
  const pages = ['uploadPage', 'photoPage', 'videoPage'];
  pages.forEach(page => {
    document.getElementById(page).style.display = (page === pageId) ? 'block' : 'none';
  });
}

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const selectButton = document.getElementById('select-button');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const toast = new bootstrap.Toast(document.getElementById('uploadToast'));

// Event listener untuk select button
selectButton.addEventListener('click', () => fileInput.click());

// Event listener untuk drag-and-drop di drop area
dropArea.addEventListener('click', () => fileInput.click());
dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.classList.add('bg-light');
});
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('bg-light'));
dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.classList.remove('bg-light');
  handleFiles(e.dataTransfer.files);
});

// Touch event untuk iPhone atau perangkat mobile
dropArea.addEventListener('touchstart', (e) => {
  e.preventDefault();
  fileInput.click();
});
dropArea.addEventListener('touchend', (e) => {
  e.preventDefault();
  fileInput.click();
});

// Listener untuk input file
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  if (files.length === 0) return;

  progressContainer.style.display = 'block';
  let total = files.length;
  let done = 0;

  Array.from(files).forEach(file => {
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      heic2any({ blob: file, toType: 'image/jpeg' })
        .then(convertedBlob => {
          processFile(convertedBlob, 'image/jpeg', file.name + '.jpg', () => {
            done++;
            updateProgress(done, total);
          });
        })
        .catch(error => {
          showToast(`❌ Gagal konversi ${file.name}`);
          console.error('Gagal konversi HEIC:', error);
          done++;
          updateProgress(done, total);
        });
    } else {
      processFile(file, file.type, file.name, () => {
        done++;
        updateProgress(done, total);
      });
    }
  });
}

function processFile(file, fileType, fileName, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const fileUrl = reader.result;
    const row = document.createElement('tr');
    const cellPreview = document.createElement('td');
    const cellName = document.createElement('td');
    const cellDownload = document.createElement('td');
    cellName.textContent = fileName;

    let folder = "";

    if (fileType.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = fileUrl;
      img.width = 100;
      img.style.cursor = 'pointer';
      img.onclick = () => openModal(fileUrl, 'image');
      cellPreview.appendChild(img);
      document.getElementById('photo-table-body').appendChild(row);
      folder = 'Media/foto';
    } else if (fileType.startsWith('video/')) {
      const vid = document.createElement('video');
      vid.src = fileUrl;
      vid.width = 160;
      vid.controls = true;
      vid.style.cursor = 'pointer';
      vid.onclick = () => openModal(fileUrl, 'video');
      cellPreview.appendChild(vid);
      document.getElementById('video-table-body').appendChild(row);
      folder = 'Media/video';
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = '#';
    downloadLink.textContent = 'Download';
    downloadLink.onclick = () => downloadFile(fileUrl);
    cellDownload.appendChild(downloadLink);

    row.appendChild(cellPreview);
    row.appendChild(cellName);
    row.appendChild(cellDownload);

    uploadToCloudinary(file, folder, fileName);
    callback();
  };
  reader.readAsDataURL(file);
}

function uploadToCloudinary(file, folder, fileName) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', folder);

  fetch(url, { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
      if (data.secure_url) {
        console.log(`✅ Upload sukses: ${fileName}`);
      } else {
        showToast(`❌ Upload gagal: ${fileName}`);
        console.error('Upload error:', data);
      }
    })
    .catch(error => {
      showToast(`❌ Upload error: ${fileName}`);
      console.error('Fetch error:', error);
    });
}

function updateProgress(done, total) {
  let progress = Math.round((done / total) * 100);
  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${progress}%`;

  if (done === total) {
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    showToast(`${total} file selesai diproses.`);
  }
}

function openModal(fileUrl, fileType) {
  const modalPreviewContainer = document.getElementById('modal-preview-container');
  if (fileType === 'image') {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.classList.add('img-fluid');
    modalPreviewContainer.innerHTML = '';
    modalPreviewContainer.appendChild(img);
  } else if (fileType === 'video') {
    const vid = document.createElement('video');
    vid.src = fileUrl;
    vid.classList.add('img-fluid');
    vid.controls = true;
    modalPreviewContainer.innerHTML = '';
    modalPreviewContainer.appendChild(vid);
  }
  const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
  previewModal.show();
}

function downloadFile(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = url.split('/').pop();
  link.click();
}

function showToast(message) {
  document.getElementById('toast-message').textContent = message;
  toast.show();
}
