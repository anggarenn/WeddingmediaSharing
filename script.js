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

selectButton.addEventListener('click', () => fileInput.click());
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

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  progressContainer.style.display = 'block';
  let total = files.length;
  let done = 0;

  Array.from(files).forEach(file => {
    if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
      heic2any({ blob: file, toType: 'image/jpeg' })
        .then(convertedBlob => {
          processFile(convertedBlob, 'image/jpeg', total, () => {
            done++;
            updateProgress(done, total);
          });
        })
        .catch(error => {
          console.error('Gagal konversi HEIC:', error);
          done++;
          updateProgress(done, total);
        });
    } else {
      processFile(file, file.type, total, () => {
        done++;
        updateProgress(done, total);
      });
    }
  });
}

function processFile(file, fileType, total, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    const fileUrl = reader.result;
    const row = document.createElement('tr');
    const cellPreview = document.createElement('td');
    const cellName = document.createElement('td');
    const cellDownload = document.createElement('td');
    cellName.textContent = file.name;

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
    downloadLink.href = fileUrl;
    downloadLink.download = file.name;
    downloadLink.textContent = 'Download';
    cellDownload.appendChild(downloadLink);

    row.appendChild(cellPreview);
    row.appendChild(cellName);
    row.appendChild(cellDownload);

    uploadToCloudinary(file, folder);
    callback();
  };
  reader.readAsDataURL(file);
}

function openModal(fileUrl, fileType) {
  const container = document.getElementById('modal-preview-container');
  container.innerHTML = '';

  if (fileType === 'image') {
    const img = document.createElement('img');
    img.src = fileUrl;
    img.classList.add('img-fluid');
    container.appendChild(img);
  } else if (fileType === 'video') {
    const vid = document.createElement('video');
    vid.src = fileUrl;
    vid.controls = true;
    vid.classList.add('img-fluid');
    container.appendChild(vid);
  }

  const modal = new bootstrap.Modal(document.getElementById('previewModal'));
  modal.show();
}

function uploadToCloudinary(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', folder);

  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.secure_url) {
      console.log('Upload sukses:', data.secure_url);
    } else {
      console.error('Upload gagal:', data);
    }
  })
  .catch(err => console.error('Error upload:', err));
}

function updateProgress(done, total) {
  let progress = Math.round((done / total) * 100);
  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${progress}%`;

  if (done === total) {
    showToast(`${total} file berhasil diproses!`);
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
  }
}

function showToast(message) {
  document.getElementById('toast-message').textContent = message;
  toast.show();
}

// Particle Canvas Effect
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let colors = ['#f3c9c9', '#fff', '#ff5a5a'];

function createParticle(e) {
  let x = e.x;
  let y = e.y;
  let color = colors[Math.floor(Math.random() * colors.length)];
  let size = Math.random() * 5 + 1;
  let speedX = Math.random() * 2 - 1;
  let speedY = Math.random() * 2 - 1;

  particles.push({ x, y, color, size, speedX, speedY });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.size *= 0.98;

    if (p.size <= 0.2) particles.splice(i, 1);

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  requestAnimationFrame(animateParticles);
}

canvas.addEventListener('mousemove', e => createParticle(e));
animateParticles();
