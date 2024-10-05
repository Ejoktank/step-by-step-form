import { formFields } from './form-fields.js';

let currentStep = 0;

const form = document.getElementById('multi-step-form');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
console.log(submitBtn);

const progressBar = document.getElementById('progress-bar');

function renderStep(step) {
    form.innerHTML = '';
    const field = formFields[step];
    
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = field.header;
    fieldset.appendChild(legend);

    if (field.type === 'radio' || field.type === 'checkbox') {
        field.options ? renderOptions(fieldset, field) : renderBlocks(fieldset, field);
    }

    form.appendChild(fieldset);
    updateProgressBar();
}

function renderOptions(fieldset, field) {
    field.options.forEach(option => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.value = option;
        label.appendChild(input);
        label.appendChild(document.createTextNode(option));
        fieldset.appendChild(label);
    });
}

function renderBlocks(fieldset, field) {
    field.blocks.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';
        const blockHeader = document.createElement('h3');
        blockHeader.textContent = block.category;
        blockDiv.appendChild(blockHeader);

        block.items.forEach(item => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `${field.name}[${block.category}]`;
            input.value = item;
            label.appendChild(input);
            label.appendChild(document.createTextNode(item));
            blockDiv.appendChild(label);
        });

        fieldset.appendChild(blockDiv);
    });
}

function updateProgressBar() {
    const progress = ((currentStep + 1) / formFields.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateNavigation() {
    prevBtn.style.display = currentStep > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentStep < formFields.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentStep === formFields.length - 1 ? 'inline-block' : 'none';
}

nextBtn.addEventListener('click', () => {
    if (currentStep < formFields.length - 1) {
        currentStep++;
        renderStep(currentStep);
        updateNavigation();
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
        updateNavigation();
    }
});

submitBtn.addEventListener('click', (e) => {
    // Here you can handle form submission
    console.log('Form submitted!');
    
    // Collect form data
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    
    // Log form data to console (for demonstration)
    console.log('Form values:', formValues);
});

// Initial render
renderStep(currentStep);
updateNavigation();
