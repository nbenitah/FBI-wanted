let contrastToggle = false;
const scalefactor = 1 / 20;

function moveBackground(event) {
  const shapes = document.querySelectorAll(".shape");
  const x = event.clientX * scalefactor;
  const y = event.clientY * scalefactor;
  for (let i = 0; i < shapes.length; ++i) {
    const isodd = i % 2 !== 0;
    const boolInt = isodd ? -1 : 1;
    shapes[i].style.transform = `translate(${x * boolInt}px,  ${y * boolInt}px)`;
  }
}
window.moveBackground = moveBackground;

function toggleContrast() {
  contrastToggle = !contrastToggle;
  if (contrastToggle) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}
window.toggleContrast = toggleContrast;

function contact(event) {
  event.preventDefault();
  const loading = document.querySelector('.modal__overlay--loading');
  const spinner = document.getElementById('modalSpinner');
  const success = document.querySelector('.modal__overlay--success');
  if (loading && spinner) {
    loading.style.display = 'flex';
    spinner.style.display = 'inline-block';
  }
    emailjs.sendForm('service_9oauyp9', 'template_2kuj4u2', event.target, '9YcY7UAimKn6cOH1-')
    .then(() => {
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
      if (event && event.target && typeof event.target.reset === 'function') {
        event.target.reset();
      }
    }, (error) => {
      if (loading && spinner) {
        loading.style.display = 'none';
        spinner.style.display = 'none';
      }
      alert('Failed to send email: ' + error.text);
    });
  }
window.contact = contact;

document.addEventListener('DOMContentLoaded', function () {
  const modal = document.querySelector('.modal');
  const openBtn = document.getElementById('openModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');

  if (openBtn && modal) {
  openBtn.addEventListener('click', function () {
    modal.classList.add('modal--active');
    setTimeout(() => {
      modal.classList.remove('modal--separated');
    }, 50); // 50ms delay lets the modal become visible before animating
  });
}

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', function () {
      modal.classList.add('modal--separated');
      setTimeout(() => {
        modal.classList.remove('modal--active');
      }, 500);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('modal--active')) {
      modal.classList.add('modal--separated');
      setTimeout(() => {
        modal.classList.remove('modal--active');
      }, 500);
    }
  });
});

// Demo API fetch function
async function firstsixincomplete(userId) {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");
  const result = await response.json();
  const incompletetasks = result.filter(element =>
    !element.completed).slice(0, 6);
  console.log(incompletetasks);
}
firstsixincomplete(6);