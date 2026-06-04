// Hostel Photo Manager Module
const hostelPhotoManager = (function() {
  let photos = [];
  const MAX_PHOTOS = 5;

  function addPhotoFromUrl() {
    if (photos.length >= MAX_PHOTOS) {
      alert(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const url = prompt('Enter photo URL (supports Google Photos, Unsplash, etc.):');
    if (!url || !url.trim()) return;

    if (!isValidImageUrl(url)) {
      alert('Invalid image URL. Make sure it links directly to an image file.');
      return;
    }

    photos.push({ type: 'url', src: url.trim(), id: Date.now() });
    renderPhotos();
  }

  function addPhotoFromFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      alert(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      photos.push({
        type: 'base64',
        src: e.target.result,
        id: Date.now(),
        name: file.name
      });
      renderPhotos();
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(photoId) {
    photos = photos.filter(p => p.id !== photoId);
    renderPhotos();
  }

  function renderPhotos() {
    const photosList = document.getElementById('photosList');
    const photoCountDisplay = document.getElementById('photoCountDisplay');

    photosList.innerHTML = '';

    photos.forEach(photo => {
      const photoItem = document.createElement('div');
      photoItem.style.position = 'relative';
      photoItem.style.borderRadius = '5px';
      photoItem.style.overflow = 'hidden';
      photoItem.style.height = '100px';

      const img = document.createElement('img');
      img.src = photo.src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.cursor = 'pointer';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '2px';
      removeBtn.style.right = '2px';
      removeBtn.style.background = 'rgba(255, 0, 0, 0.8)';
      removeBtn.style.border = 'none';
      removeBtn.style.color = 'white';
      removeBtn.style.width = '24px';
      removeBtn.style.height = '24px';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontSize = '12px';
      removeBtn.style.padding = '0';
      removeBtn.innerHTML = '×';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removePhoto(photo.id);
      });

      photoItem.appendChild(img);
      photoItem.appendChild(removeBtn);
      photosList.appendChild(photoItem);
    });

    photoCountDisplay.textContent = `${photos.length}/${MAX_PHOTOS} photos added`;
  }

  function getPhotos() {
    return photos;
  }

  function setPhotos(photoArray) {
    photos = photoArray ? [...photoArray] : [];
    renderPhotos();
  }

  function clearPhotos() {
    photos = [];
    renderPhotos();
  }

  function isValidImageUrl(url) {
    try {
      new URL(url);
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const lowerUrl = url.toLowerCase();
      return imageExtensions.some(ext => lowerUrl.includes(ext)) || url.includes('lh3.google') || url.includes('unsplash');
    } catch {
      return false;
    }
  }

  return {
    addPhotoFromUrl,
    addPhotoFromFile,
    removePhoto,
    renderPhotos,
    getPhotos,
    setPhotos,
    clearPhotos,
    MAX_PHOTOS
  };
})();

// Setup event listeners for photo manager
document.addEventListener('DOMContentLoaded', () => {
  const addPhotoUrlBtn = document.getElementById('addPhotoUrlBtn');
  const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
  const photoFileInput = document.getElementById('photoFileInput');

  if (addPhotoUrlBtn) {
    addPhotoUrlBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hostelPhotoManager.addPhotoFromUrl();
    });
  }

  if (uploadPhotoBtn) {
    uploadPhotoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      photoFileInput.click();
    });
  }

  if (photoFileInput) {
    photoFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        hostelPhotoManager.addPhotoFromFile(e.target.files[0]);
        e.target.value = '';
      }
    });
  }
});
