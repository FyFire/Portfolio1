// DOM Elements
const photoGrid = document.querySelector('.photo-grid');
const fullsizeContainer = document.getElementById('fullsize-container');
const fullsizeImage = document.getElementById('fullsize-image');

class GoogleDrivePhotoManager {
    constructor() {
        this.API_KEY = 'AIzaSyD-dKVQFdBgiZJdNQhXyeVCUr2pRtLND7Y';
        this.FOLDER_ID = '1OiGiw1TE3auGLwQE9-WgtaO7HzWaJTMu';
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
        }
    }

    displayPhotos(files) {
        files.forEach(file => {
            const imgElement = document.createElement('img');
            imgElement.src = this.getThumbnailUrl(file.id);
            imgElement.dataset.fullsize = this.getFullsizeUrl(file.id);
            imgElement.alt = file.name;
            imgElement.classList.add('scaled-down');
            this.photoGrid.appendChild(imgElement);
        });
    }

    getThumbnailUrl(fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w200`;
    }
    
    getFullsizeUrl(fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    setupEventListeners() {
        this.photoGrid.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.photoGrid.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.photoGrid.addEventListener('click', this.showFullsizeImage.bind(this));
        this.fullsizeContainer.addEventListener('click', this.hideFullsizeImage.bind(this));
        
        // Prevent image click from triggering container click
        this.fullsizeImage.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    handleMouseMove(event) {
        const gridRect = this.photoGrid.getBoundingClientRect();
        const mouseX = event.clientX - gridRect.left;
        const mouseY = event.clientY - gridRect.top;

        const images = this.photoGrid.querySelectorAll('img');
        images.forEach(img => {
            const imgRect = img.getBoundingClientRect();
            const imgX = imgRect.left - gridRect.left + imgRect.width / 2;
            const imgY = imgRect.top - gridRect.top + imgRect.height / 2;

            const distX = mouseX - imgX;
            const distY = mouseY - imgY;
            const distance = Math.sqrt(distX * distX + distY * distY);

            const maxDistance = 150;
            const minOpacity = 0.8;
            const maxOpacity = 1;

            const attenuationFactor = Math.max(0, 1 - (distance / maxDistance));
            const baseScale = 0.5;
            const maxScale = 2;
            const scaleFactor = baseScale + ((maxScale - baseScale) * attenuationFactor);
            const opacity = minOpacity + ((maxOpacity - minOpacity) * attenuationFactor);

            img.style.transform = `scale(${scaleFactor})`;
            img.style.opacity = opacity;
        });
    }

    handleMouseLeave() {
        const images = this.photoGrid.querySelectorAll('img');
        images.forEach(img => {
            img.style.transform = 'scale(0.5)';
            img.style.opacity = 0.8;
        });
    }

    showFullsizeImage(event) {
        if (event.target.tagName === 'IMG') {
            const clickedImg = event.target;
            
            // Set the source and display the container
            this.fullsizeImage.src = clickedImg.dataset.fullsize;
            this.fullsizeContainer.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Add loading state
            this.fullsizeImage.style.opacity = '0';
            this.fullsizeContainer.classList.add('loading');
            
            this.fullsizeImage.onload = () => {
                this.fullsizeContainer.classList.remove('loading');
                this.fullsizeImage.style.opacity = '1';
            };
    
            this.fullsizeImage.onerror = (e) => {
                console.error('Error loading image:', e);
                this.fullsizeContainer.classList.remove('loading');
                alert('Failed to load full-size image. Please try again.');
                this.hideFullsizeImage();
            };
        }
    }

    hideFullsizeImage(event) {
        if (event && event.target === this.fullsizeContainer) {
            this.fullsizeContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Initialize the photo manager
const photoManager = new GoogleDrivePhotoManager();

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    photoManager.initialize();
});