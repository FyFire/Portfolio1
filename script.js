// DOM Elements
const photoGrid = document.querySelector('.photo-grid');
const fullsizeContainer = document.getElementById('fullsize-container');
const fullsizeImage = document.getElementById('fullsize-image');
const API_KEY = '70374420f23348a182d8884032ebd906';
const ACCESS_TOKEN = 'p8e-WoXNH1o_7AiliumVSQzu3rijNtbNYtwU';

// Photo Data
const photos = Array(400).fill().map(() => ({
    src: 'https://sonicxshadowgenerations.com/img/hero/hero-sonic.png',
    alt: 'Sonic the Hedgehog'
}));

// Functions
function createPhotoElements() {
    photos.forEach(photo => {
        const imgElement = document.createElement('img');
        imgElement.src = photo.src;
        imgElement.alt = photo.alt;
        imgElement.classList.add('scaled-down');
        photoGrid.appendChild(imgElement);
    });
}

function handleMouseMove(event) {
    const gridRect = photoGrid.getBoundingClientRect();
    const mouseX = event.clientX - gridRect.left;
    const mouseY = event.clientY - gridRect.top;

    const images = photoGrid.querySelectorAll('img');
    images.forEach(img => {
        const imgRect = img.getBoundingClientRect();
        const imgX = imgRect.left - gridRect.left + imgRect.width / 2;
        const imgY = imgRect.top - gridRect.top + imgRect.height / 2;

        const distX = mouseX - imgX;
        const distY = mouseY - imgY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        const maxDistance = 150; // Maximum distance for effect
        const minOpacity = 0.8; // Minimum opacity for far images
        const maxOpacity = 1; // Maximum opacity for close images

        // Calculate scale
        const attenuationFactor = Math.max(0, 1 - (distance / maxDistance));
        const baseScale = 0.5;
        const maxScale = 2;
        const scaleFactor = baseScale + ((maxScale - baseScale) * attenuationFactor);

        // Calculate opacity
        const opacity = minOpacity + ((maxOpacity - minOpacity) * attenuationFactor);

        // Apply transformations
        img.style.transform = `scale(${scaleFactor})`;
        img.style.opacity = opacity;
    });
}

function handleMouseLeave() {
    const images = photoGrid.querySelectorAll('img');
    images.forEach(img => {
        img.style.transform = 'scale(0.5)';
        img.style.opacity = 0.8;
    });
}

let isTransitioning = false;

function showFullsizeImage(event) {
    if (event.target.tagName === 'IMG' && !isTransitioning) {
        isTransitioning = true;
        const clickedImg = event.target;
        const rect = clickedImg.getBoundingClientRect();

        fullsizeImage.src = clickedImg.src;
        fullsizeImage.style.width = `${rect.width}px`;
        fullsizeImage.style.height = `${rect.height}px`;
        fullsizeImage.style.position = 'fixed';
        fullsizeImage.style.top = `${rect.top}px`;
        fullsizeImage.style.left = `${rect.left}px`;
        fullsizeImage.style.transition = 'none';

        fullsizeContainer.style.display = 'flex';
        
        requestAnimationFrame(() => {
            fullsizeContainer.style.opacity = '1';
            fullsizeImage.style.transition = 'all 0.3s ease';
            fullsizeImage.style.width = '70%';
            fullsizeImage.style.height = '70%';
            fullsizeImage.style.top = '15%';
            fullsizeImage.style.left = '15%';
        });

        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }
}

function hideFullsizeImage() {
    if (!isTransitioning) {
        isTransitioning = true;
        const rect = fullsizeImage.getBoundingClientRect();

        fullsizeImage.style.width = `${rect.width}px`;
        fullsizeImage.style.height = `${rect.height}px`;
        fullsizeImage.style.top = `${rect.top}px`;
        fullsizeImage.style.left = `${rect.left}px`;

        requestAnimationFrame(() => {
            fullsizeContainer.style.opacity = '0';
            fullsizeImage.style.width = '30px';
            fullsizeImage.style.height = '30px';
            fullsizeImage.style.top = '50%';
            fullsizeImage.style.left = '50%';
            fullsizeImage.style.transform = 'translate(-50%, -50%)';
        });

        setTimeout(() => {
            fullsizeContainer.style.display = 'none';
            fullsizeImage.style.transition = 'none';
            fullsizeImage.style.width = '';
            fullsizeImage.style.height = '';
            fullsizeImage.style.top = '';
            fullsizeImage.style.left = '';
            fullsizeImage.style.transform = '';
            isTransitioning = false;
        }, 300);
    }
}

async function fetchLightroomPhotos() {
    try {
        // Get catalogs
        const response = await fetch('https://lr.adobe.io/v2/catalogs', {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'X-API-Key': API_KEY,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch catalogs');
        }

        const data = await response.json();
        const catalogId = data.resources[0].id;

        // Get assets
        const assetsResponse = await fetch(`https://lr.adobe.io/v2/catalogs/${catalogId}/assets?limit=400`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'X-API-Key': API_KEY,
            }
        });

        if (!assetsResponse.ok) {
            throw new Error('Failed to fetch assets');
        }

        const assetsData = await assetsResponse.json();
        photos = assetsData.resources.map(asset => ({
            src: asset.links.fullsize.href,
            alt: asset.payload.name || 'Lightroom Photo'
        }));

        // Clear existing photos and create new elements
        photoGrid.innerHTML = '';
        createPhotoElements();
    } catch (error) {
        console.error('Error fetching Lightroom photos:', error);
    }
}


// Event Listeners
createPhotoElements();
photoGrid.addEventListener('mousemove', handleMouseMove);
photoGrid.addEventListener('mouseleave', handleMouseLeave);
photoGrid.addEventListener('click', showFullsizeImage);
fullsizeContainer.addEventListener('click', hideFullsizeImage);
document.addEventListener('DOMContentLoaded', fetchLightroomPhotos);