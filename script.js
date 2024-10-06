import { formFields } from './form-fields.js';

let currentStep = 0;
let formData = {};

const form = document.getElementById('multi-step-form');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');

function renderStep(step) {
    form.innerHTML = '';
    const field = formFields[step];
    
    // Check if the field should be shown
    if (field.showIf && !field.showIf(formData)) {
        // If the field shouldn't be shown, move to the next step
        currentStep++;
        if (currentStep < formFields.length) {
            renderStep(currentStep);
        } else {
            // If we've reached the end, show the submit button
            updateNavigation();
        }
        return;
    }

    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = field.header;
    fieldset.appendChild(legend);

    if (field.type === 'radio' || field.type === 'checkbox') {
        field.options ? renderOptions(fieldset, field) : renderBlocks(fieldset, field);
    }

    form.appendChild(fieldset);
    updateProgressBar();
    
    // Restore any previously entered data for this step
    restoreFieldData(field);
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

function saveFieldData() {
    const field = formFields[currentStep];
    const inputs = form.querySelectorAll('input:checked');
    
    if (field.type === 'radio') {
        formData[field.name] = inputs[0] ? inputs[0].value : null;
    } else if (field.type === 'checkbox') {
        if (field.options) {
            formData[field.name] = Array.from(inputs).map(input => input.value);
        } else {
            formData[field.name] = {};
            inputs.forEach(input => {
                const [category, item] = input.name.split('[')[1].split(']');
                if (!formData[field.name][category]) {
                    formData[field.name][category] = [];
                }
                formData[field.name][category].push(input.value);
            });
        }
    }
}

function restoreFieldData(field) {
    if (formData[field.name]) {
        if (field.type === 'radio') {
            const input = form.querySelector(`input[name="${field.name}"][value="${formData[field.name]}"]`);
            if (input) input.checked = true;
        } else if (field.type === 'checkbox') {
            if (field.options) {
                formData[field.name].forEach(value => {
                    const input = form.querySelector(`input[name="${field.name}"][value="${value}"]`);
                    if (input) input.checked = true;
                });
            } else {
                Object.entries(formData[field.name]).forEach(([category, items]) => {
                    items.forEach(item => {
                        const input = form.querySelector(`input[name="${field.name}[${category}]"][value="${item}"]`);
                        if (input) input.checked = true;
                    });
                });
            }
        }
    }
}

nextBtn.addEventListener('click', () => {
    saveFieldData();
    if (currentStep < formFields.length - 1) {
        currentStep++;
        renderStep(currentStep);
        updateNavigation();
    }
});

prevBtn.addEventListener('click', () => {
    saveFieldData();
    if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
        updateNavigation();
    }
});

submitBtn.addEventListener('click', () => {
    saveFieldData();
    console.log('Form submitted!');
    console.log('Form data:', formData);
});

// Initial render
renderStep(currentStep);
updateNavigation();
