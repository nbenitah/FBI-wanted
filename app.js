// Contact form handler for onsubmit
function contact(event) {
    event.preventDefault();
    // Show loading overlay
    const loading = document.querySelector('.modal__overlay--loading');
    const spinner = document.getElementById('modalSpinner');
    const success = document.querySelector('.modal__overlay--success');
    if (loading && spinner) {
        loading.style.display = 'flex';
        spinner.style.display = 'inline-block';
    }
    setTimeout(() => {
        if (loading && spinner) {
            loading.style.display = 'none';
            spinner.style.display = 'none';
        }
        if (success) {
            success.style.display = 'flex';
            setTimeout(() => {
                success.style.display = 'none';
            }, 3000);
        }
    }, 750);
}
window.contact = contact;
// Modal logic
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.querySelector('.modal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    // Open modal
    if (openBtn && modal) {
        openBtn.addEventListener('click', function() {
            modal.classList.add('modal--active');
        });
    }
    // Close modal with rotation and green overlay
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            console.log('Close button clicked');
            modal.classList.remove('modal--active');
        });
    }
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('modal--active');
            }
        });
    }
    // Close modal on Esc key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('modal--active')) {
            modal.classList.remove('modal--active');
        }
    });
});

async function firstsixincomplete(userId) {
    const response = await fetch ("https://jsonplaceholder.typicode.com/todos");
    const result = await response.json();
    const incompletetasks = result.filter( element=> 
        !element.completed).slice(0, 6);

    console.log(incompletetasks); 
}

firstsixincomplete(6);
