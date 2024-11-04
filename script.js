// DOM Elements
const photoGrid = document.querySelector('.photo-grid');
const fullsizeContainer = document.getElementById('fullsize-container');
const fullsizeImage = document.getElementById('fullsize-image');

// Photo Data
const photos = Array(400).fill().map(() => ({
    src: 'https://sonicxshadowgenerations.com/img/hero/hero-sonic.png',
    alt: 'Sonic the Hedgehog'
}));

class GoogleDrivePhotoManager {
    constructor() {
        this.API_KEY = 'AIzaSyD-dKVQFdBgiZJdNQhXyeVCUr2pRtLND7Y'; // Replace with your actual API key
        this.FOLDER_ID = '1OiGiw1TE3auGLwQE9-WgtaO7HzWaJTMu'; // Replace with your Google Drive folder ID
        this.photoGrid = document.querySelector('.photo-grid');
        this.fullsizeContainer = document.getElementById('fullsize-container');
        this.fullsizeImage = document.getElementById('fullsize-image');
    }

    async initialize() {
        try {
            await this.loadGoogleAPI();
            await this.loadPhotosFromDrive();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error initializing:', error);
        }
    }

    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: this.API_KEY,
                        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async loadPhotosFromDrive() {
        this.showLoading();
        try {
            const response = await gapi.client.drive.files.list({
                q: `'${this.FOLDER_ID}' in parents and mimeType contains 'image/'`,
                fields: 'files(id, name, thumbnailLink)',
                orderBy: 'name'
            });

            const files = response.result.files;
            this.displayPhotos(files);
        } catch (error) {
            console.error('Error loading photos:', error);
            this.photoGrid.innerHTML = 'Error loading photos. Please try again later.';
        } finally {
            this.hideLoading();
        }
    }

    displayPhotos(files) {
        files.forEach(file => {
            const imgElement = document.createElement('img');
            imgElement.src = file.thumbnailLink || this.getThumbnailUrl(file.id);
            imgElement.dataset.fullsize = this.getFullsizeUrl(file.id);
            imgElement.alt = file.name;
            imgElement.classList.add('scaled-down');
            this.photoGrid.appendChild(imgElement);
        });
    }

    getThumbnailUrl(fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w100`;
    }

    getFullsizeUrl(fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    showLoading() {
        this.photoGrid.classList.add('loading');
    }

    hideLoading() {
        this.photoGrid.classList.remove('loading');
    }

    setupEventListeners() {
        this.photoGrid.addEventListener('click', this.showFullsizeImage.bind(this));
        this.fullsizeContainer.addEventListener('click', this.hideFullsizeImage.bind(this));
    }

    showFullsizeImage(event) {
        if (event.target.tagName === 'IMG') {
            const clickedImg = event.target;
            this.fullsizeImage.src = clickedImg.dataset.fullsize;
            this.fullsizeContainer.style.display = 'flex';
        }
    }

    hideFullsizeImage() {
        this.fullsizeContainer.style.display = 'none';
    }
}

// Initialize the photo manager
const photoManager = new GoogleDrivePhotoManager();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    photoManager.initialize();
});

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


// Event Listeners
createPhotoElements();
photoGrid.addEventListener('mousemove', handleMouseMove);
photoGrid.addEventListener('mouseleave', handleMouseLeave);
photoGrid.addEventListener('click', showFullsizeImage);
fullsizeContainer.addEventListener('click', hideFullsizeImage);
