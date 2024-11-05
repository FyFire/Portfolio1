class PhotoManager {
    constructor() {
        this.photoGrid = document.querySelector('.photo-grid');
        this.fullsizeContainer = document.getElementById('fullsize-container');
        this.fullsizeImage = document.getElementById('fullsize-image');
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.photoGrid.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.photoGrid.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.photoGrid.addEventListener('click', this.showFullsizeImage.bind(this));
        this.fullsizeContainer.addEventListener('click', this.hideFullsizeImage.bind(this));
        this.fullsizeImage.addEventListener('click', (e) => e.stopPropagation());
    }

    handleMouseMove(event) {
        const gridRect = this.photoGrid.getBoundingClientRect();
        const mouseX = event.clientX - gridRect.left;
        const mouseY = event.clientY - gridRect.top;

        this.photoGrid.querySelectorAll('img').forEach(img => {
            const imgRect = img.getBoundingClientRect();
            const imgX = imgRect.left - gridRect.left + imgRect.width / 2;
            const imgY = imgRect.top - gridRect.top + imgRect.height / 2;

            const distance = Math.hypot(mouseX - imgX, mouseY - imgY);

            const maxDistance = 150;
            const attenuationFactor = Math.max(0, 1 - (distance / maxDistance));
            const scaleFactor = 0.5 + (1.5 * attenuationFactor);
            const opacity = 0.8 + (0.2 * attenuationFactor);

            img.style.transform = `scale(${scaleFactor})`;
            img.style.opacity = opacity;
        });
    }

    handleMouseLeave() {
        this.photoGrid.querySelectorAll('img').forEach(img => {
            img.style.transform = 'scale(0.5)';
            img.style.opacity = '0.8';
        });
    }

    showFullsizeImage(event) {
        if (event.target.tagName === 'IMG') {
            const clickedImg = event.target;
            this.fullsizeImage.src = clickedImg.dataset.fullsize || clickedImg.src;
            this.fullsizeContainer.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            this.fullsizeImage.onerror = () => {
                console.error('Failed to load full-size image');
                alert('Failed to load full-size image. Please try again.');
                this.hideFullsizeImage();
            };
        }
    }

    hideFullsizeImage() {
        this.fullsizeContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.fullsizeImage.src = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PhotoManager().initialize();
});