const url = "https://api.cloudinary.com/v1_1/djglvd8dc/upload";
const preset = "wedding";  // Pastikan preset ini unsigned & folder kosong

function showPage(pageId) {
  const pages = ['uploadPage', 'photoPage', 'videoPage'];
  pages.forEach(id => document.getElementById(id).style.display = 'none');
  document.getElementById(pageId).style.display = 'block';
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
    const reader = new FileReader();
    reader.onload = () => {
      const fileUrl = reader.result;
      const row = document.createElement('tr');
      const cellPreview = document.createElement('td');
      const cellName = document.createElement('td');
      const cellDownload = document.createElement('td');
      cellName.textContent = file.name;

      let folder = "";

      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = fileUrl;
        img.width = 100;
        img.style.cursor = 'pointer';
        img.onclick = () => openModal(fileUrl, 'image');
        cellPreview.appendChild(img);
        document.getElementById('photo-table-body').appendChild(row);
        folder = 'Media/foto';  // Folder gambar
      } else if (file.type.startsWith('video/')) {
        const vid = document.createElement('video');
        vid.src = fileUrl;
        vid.width = 160;
        vid.controls = true;
        vid.style.cursor = 'pointer';
        vid.onclick = () => openModal(fileUrl, 'video');
        cellPreview.appendChild(vid);
        document.getElementById('video-table-body').appendChild(row);
        folder = 'Media/video';  // Folder video
      }

      const downloadLink = document.createElement('a');
      downloadLink.href = '#';
      downloadLink.textContent = 'Download';
      downloadLink.onclick = () => downloadFile(fileUrl);
      cellDownload.appendChild(downloadLink);

      row.appendChild(cellPreview);
      row.appendChild(cellName);
      row.appendChild(cellDownload);

      // Upload ke Cloudinary
      uploadToCloudinary(file, folder);

      done++;
      let progress = Math.round((done / total) * 100);
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${progress}%`;

      if (done === total) {
        showToast(`${total} file berhasil diproses!`);
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
      }
    };
    reader.readAsDataURL(file);
  });
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

function uploadToCloudinary(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', folder);  // Folder dinamis sesuai jenis file

  console.log(`Uploading ${file.type} ke folder: ${folder}`);

  fetch(url, {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.secure_url) {
      console.log('Upload sukses:', data.secure_url);
    } else {
      console.error('Upload gagal:', data);
    }
  })
  .catch(error => {
    console.error('Error upload:', error);
  });
}

function showToast(message) {
  document.getElementById('toast-message').textContent = message;
  toast.show();
}

function downloadFile(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = url.split('/').pop();
  link.click();
}


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
    particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.size *= 0.98;

        if (particle.size <= 0.2) {
            particles.splice(index, 1);
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
    });

    requestAnimationFrame(animateParticles);
}

canvas.addEventListener('mousemove', (e) => createParticle(e));
animateParticles();


// Menangani pemilihan file
document.getElementById('file-input').addEventListener('change', function(event) {
    const files = event.target.files;
    Array.from(files).forEach(file => {
        if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
            // Jika file dalam format HEIC, konversi ke JPEG
            heic2any({ blob: file, toType: 'image/jpeg' })
                .then(function(convertedBlob) {
                    // Buat URL objek dari gambar yang telah dikonversi
                    const url = URL.createObjectURL(convertedBlob);
                    
                    // Lakukan sesuatu dengan gambar yang sudah dikonversi, seperti preview atau upload
                    previewImage(url);
                })
                .catch(function(error) {
                    console.error('Gagal mengkonversi HEIC:', error);
                });
        } else {
            // Jika bukan HEIC, langsung preview gambar
            previewImage(URL.createObjectURL(file));
        }
    });
});

// Fungsi untuk preview gambar dalam modal
function previewImage(imageUrl) {
    const previewContainer = document.getElementById('modal-preview-container');
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.classList.add('img-fluid');
    
    // Hapus konten lama dan masukkan gambar baru
    previewContainer.innerHTML = '';
    previewContainer.appendChild(imgElement);
    
    // Tampilkan modal preview
    $('#previewModal').modal('show');
}

// Fungsi untuk menampilkan halaman yang relevan
function showPage(pageId) {
    const pages = ['uploadPage', 'photoPage', 'videoPage'];
    pages.forEach(page => {
        document.getElementById(page).style.display = (page === pageId) ? 'block' : 'none';
    });
}
