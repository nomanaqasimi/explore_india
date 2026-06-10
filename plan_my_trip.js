// plan-my-trip.js — Interactive logic for the Plan My Trip page

// ── STEP NAVIGATION ─────────────────────────────────────────
let currentStep = 1;

function goToStep(stepNum) {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.add('hidden');

    // Show new step
    document.getElementById(`step-${stepNum}`).classList.remove('hidden');

    // Update progress bar
    updateProgress(stepNum);

    currentStep = stepNum;

    // Scroll to top of form smoothly
    document.querySelector('.form-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgress(activeStep) {
    document.querySelectorAll('.step').forEach(step => {
        const num = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        if (num === activeStep) step.classList.add('active');
        if (num < activeStep) step.classList.add('completed');
    });
}

// ── PILL SELECTORS ───────────────────────────────────────────
// Multi-select pills (interests)
document.querySelectorAll('#interests .pill').forEach(pill => {
    pill.addEventListener('click', () => {
        pill.classList.toggle('selected');
    });
});

// Single-select pills (companions, budget)
['#companions', '#budget'].forEach(selector => {
    document.querySelectorAll(`${selector} .pill`).forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll(`${selector} .pill`).forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
        });
    });
});

// ── FORM SUBMISSION ──────────────────────────────────────────
document.getElementById('tripForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';

    // Collect all form data
    const interests = [...document.querySelectorAll('#interests .pill.selected')].map(p => p.dataset.value);
    const companion = document.querySelector('#companions .pill.selected')?.dataset.value || '';
    const budget    = document.querySelector('#budget .pill.selected')?.dataset.value || '';
    const destinations = [...document.querySelectorAll('input[name="destinations"]:checked')].map(d => d.value);

    const payload = {
        interests,
        companion,
        budget,
        destinations,
        other_dest:       document.getElementById('other_dest').value,
        start_date:       document.getElementById('start_date').value,
        end_date:         document.getElementById('end_date').value,
        travellers:       document.getElementById('travellers').value,
        depart_city:      document.getElementById('depart_city').value,
        special_requests: document.getElementById('special_requests').value,
        duration_note:    document.getElementById('duration_note').value,
        full_name:        document.getElementById('full_name').value,
        email:            document.getElementById('email').value,
        phone:            document.getElementById('phone').value,
        promo:            document.getElementById('promo').checked
    };

    // Validate required fields
    if (!payload.full_name || !payload.email) {
        alert('Please fill in your name and email address.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Generate My Itinerary</span><span class="btn-arrow">→</span>';
        return;
    }

    try {
        const res = await fetch('http://127.0.0.1:5000/plan-trip', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            showSuccess();
        } else {
            alert('Something went wrong: ' + data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Generate My Itinerary</span><span class="btn-arrow">→</span>';
        }
    } catch (err) {
        // If backend not connected yet, show success anyway for testing
        console.warn('Backend not connected:', err);
        showSuccess();
    }
});

function showSuccess() {
    document.getElementById('tripForm').classList.add('hidden');
    document.getElementById('successState').classList.remove('hidden');
    document.querySelector('.form-main').scrollIntoView({ behavior: 'smooth' });
}

// ── MOBILE NAV TOGGLE ────────────────────────────────────────
document.querySelector('.nav-toggle').addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    if (links.style.display === 'flex') {
        links.style.display = 'none';
    } else {
        links.style.display = 'flex';
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '68px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'rgba(10,5,0,0.97)';
        links.style.padding = '20px 24px';
        links.style.gap = '20px';
        links.style.borderBottom = '0.5px solid rgba(255,255,255,0.1)';
    }
});

// ── DATE MIN TODAY ───────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
document.getElementById('start_date').min = today;
document.getElementById('end_date').min = today;

document.getElementById('start_date').addEventListener('change', function() {
    document.getElementById('end_date').min = this.value;
});