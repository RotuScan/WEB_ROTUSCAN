
// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Loading Screen
window.addEventListener('load', function () {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1000);
});

// Scroll Progress Bar
window.addEventListener('scroll', function () {
    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = scrollPercent + '%';
});


// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});




// === Banco de quizz   es ===
const quizzes = {
  gluten: [
    { q: "Você sente desconforto abdominal após consumir pães ou massas?", o: ["Sempre", "Às vezes", "Nunca"], v: [2, 1, 0] },
    { q: "Você experimenta fadiga após refeições com glúten?", o: ["Frequentemente", "Ocasionalmente", "Nunca"], v: [2, 1, 0] },
    { q: "Você tem problemas de pele (eczema, dermatite)?", o: ["Sim", "Às vezes", "Não"], v: [2, 1, 0] },
    { q: "Você sente dores de cabeça após comer glúten?", o: ["Sim", "Ocasionalmente", "Não"], v: [2, 1, 0] },
    { q: "Há histórico familiar de intolerância ao glúten?", o: ["Sim", "Não sei", "Não"], v: [2, 1, 0] }
  ],
  lactose: [
    { q: "Você sente gases, cólicas ou inchaço após consumir leite ou derivados?", o: ["Sempre", "Às vezes", "Nunca"], v: [2, 1, 0] },
    { q: "Você evita laticínios por desconforto?", o: ["Sim", "Às vezes", "Não"], v: [2, 1, 0] },
    { q: "Você tem diarreia após produtos lácteos?", o: ["Sim", "Raramente", "Nunca"], v: [2, 1, 0] },
    { q: "Você tolera iogurtes ou queijos sem sintomas?", o: ["Não", "Parcialmente", "Sim"], v: [2, 1, 0] },
    { q: "Há histórico familiar de intolerância à lactose?", o: ["Sim", "Não sei", "Não"], v: [2, 1, 0] }
  ],
  amendoim: [
    { q: "Você sente coceira, formigamento ou inchaço após comer amendoim?", o: ["Sim, sempre", "Às vezes", "Nunca"], v: [2, 1, 0] },
    { q: "Você já teve falta de ar ou chiado após consumir amendoim?", o: ["Sim", "Pouco", "Não"], v: [2, 1, 0] },
    { q: "Você teve urticária (manchas vermelhas) após comer amendoim?", o: ["Sim", "Às vezes", "Não"], v: [2, 1, 0] },
    { q: "Você evita produtos que contêm traços de amendoim?", o: ["Sim, sempre", "Às vezes", "Nunca"], v: [2, 1, 0] },
    { q: "Há histórico familiar de alergia a amendoim?", o: ["Sim", "Não sei", "Não"], v: [2, 1, 0] }
  ]
};

// === Variáveis globais ===
let selectedQuiz = 'gluten';
let qIndex = 0, score = 0;

// === Elementos ===
const qText = document.getElementById('questionText'),
      qOptions = document.getElementById('quizOptions'),
      btnNext = document.getElementById('nextQuestion'),
      btnResult = document.getElementById('showResult'),
      quizResult = document.getElementById('quizResult'),
      quizContent = document.getElementById('quizContent'),
      quizSelector = document.getElementById('quizSelector');

// === Funções do quiz ===
function loadQuestion() {
  const quiz = quizzes[selectedQuiz];
  if (qIndex >= quiz.length) return;

  const { q, o, v } = quiz[qIndex];
  qText.textContent = q;
  qOptions.innerHTML = o.map((opt, i) =>
    `<div class="quiz-option" data-value="${v[i]}">${opt}</div>`).join('');

  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.onclick = () => {
      document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      btnNext.style.display = qIndex < quiz.length - 1 ? 'inline-block' : 'none';
      btnResult.style.display = qIndex === quiz.length - 1 ? 'inline-block' : 'none';
    };
  });
}

function nextQuestion() {
  const selected = document.querySelector('.quiz-option.selected');
  if (!selected) return;
  score += +selected.dataset.value;
  qIndex++;
  loadQuestion();
}

function showResult() {
  const selected = document.querySelector('.quiz-option.selected');
  if (selected) score += +selected.dataset.value;

  quizContent.style.display = 'none';
  let cls = '', msg = '';

  if (score >= 7) {
    cls = 'bg-danger'; 
    msg = "<h3><i class='fas fa-exclamation-triangle me-2'></i>Alta Probabilidade</h3><p>Procure um profissional de saúde para exames e diagnóstico.</p>";
  } else if (score >= 4) {
    cls = 'bg-warning'; 
    msg = "<h3><i class='fas fa-question-circle me-2'></i>Probabilidade Moderada</h3><p>Observe seus sintomas e procure orientação médica se necessário.</p>";
  } else {
    cls = 'bg-success'; 
    msg = "<h3><i class='fas fa-check-circle me-2'></i>Baixa Probabilidade</h3><p>É improvável que você tenha essa intolerância, mas continue atento ao seu bem-estar.</p>";
  }

  quizResult.className = `quiz-result show ${cls}`;
  quizResult.innerHTML = msg + `
    <div class="text-center mt-3">
      <button class="btn btn-secondary" onclick="resetQuiz()">Refazer Quiz</button>
    </div>`;
}

function resetQuiz() {
  score = 0; qIndex = 0;
  quizContent.style.display = 'block';
  quizResult.innerHTML = ''; quizResult.className = 'quiz-result';
  btnNext.style.display = btnResult.style.display = 'none';
  loadQuestion();
}

// === Eventos ===
btnNext.onclick = nextQuestion;
btnResult.onclick = showResult;
quizSelector.onchange = () => {
  selectedQuiz = quizSelector.value;
  resetQuiz();
};

// === Inicialização ===
loadQuestion();






// Add parallax effect to hero section
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect after page load
window.addEventListener('load', function () {
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const originalText = heroTitle.textContent;
            typeWriter(heroTitle, originalText, 150);
        }
    }, 1500);
});

// Add mouse trail effect
const trail = [];
const trailLength = 10;

document.addEventListener('mousemove', function (e) {
    trail.push({ x: e.clientX, y: e.clientY });
    if (trail.length > trailLength) {
        trail.shift();
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.info-card, .symptom-item, .tip-card, .food-item').forEach(element => {
    observer.observe(element);
});

// Add click sound effect (optional)
function playClickSound() {
    // You can add audio here if desired
    // const audio = new Audio('click-sound.mp3');
    // audio.play();
}

// Add click effects to buttons
document.querySelectorAll('button, .btn, .nav-link').forEach(element => {
    element.addEventListener('click', function (e) {
        playClickSound();

        // Add ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);
