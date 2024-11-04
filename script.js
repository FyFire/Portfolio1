const photoGrid = document.querySelector('.photo-grid');
const fullsizeContainer = document.getElementById('fullsize-container');
const fullsizeImage = document.getElementById('fullsize-image');

// Sample photo data (replace with your own images)
const photos = Array(100).fill().map((_, index) => ({
    src: `https://picsum.photos/300/300?random=${index}`,
    alt: `Sample photo ${index + 1}`
}));

function createPhotoElements() {
    photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.alt;
        photoGrid.appendChild(img);
    });
}

function handleMouseMove(event) {
    const images = photoGrid.querySelectorAll('img');
    const rect = photoGrid.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    images.forEach(img => {
        const imgRect = img.getBoundingClientRect();
        const imgCenterX = imgRect.left - rect.left + imgRect.width / 2;
        const imgCenterY = imgRect.top - rect.top + imgRect.height / 2;

        const distance = Math.sqrt(
            Math.pow(mouseX - imgCenterX, 2) + Math.pow(mouseY - imgCenterY, 2)
        );

        const maxDistance = 100;
        const scale = Math.max(0.5, Math.min(1.2, 1 - distance / maxDistance));
        const opacity = Math.max(0.8, Math.min(1, 1 - distance / maxDistance));

        img.style.transform = `scale(${scale})`;
        img.style.opacity = opacity;
    });
}

function showFullsizeImage(event) {
    if (event.target.tagName === 'IMG') {
        fullsizeImage.src = event.target.src;
        fullsizeContainer.style.display = 'flex';
    }
}

function hideFullsizeImage() {
    fullsizeContainer.style.display = 'none';
}

createPhotoElements();
photoGrid.addEventListener('mousemove', handleMouseMove);
photoGrid.addEventListener('mouseleave', () => {
    photoGrid.querySelectorAll('img').forEach(img => {
        img.style.transform = 'scale(1)';
        img.style.opacity = '1';
    });
});
photoGrid.addEventListener('click', showFullsizeImage);
fullsizeContainer.addEventListener('click', hideFullsizeImage);