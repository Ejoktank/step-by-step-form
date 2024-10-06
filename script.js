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
        if (step < formFields.length - 1) {
            currentStep++;
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
        blockDiv.className = 'checkbox-block';
        
        const blockHeader = document.createElement('h4');
        blockHeader.textContent = block.categoryHeader;
        blockDiv.appendChild(blockHeader);

        block.items.forEach(item => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `${field.name}[${block.categoryName}]`;
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
    const prevStep = findPreviousStep(currentStep);
    const nextStep = findNextStep(currentStep);

    prevBtn.style.display = prevStep >= 0 ? 'inline-block' : 'none';
    nextBtn.style.display = nextStep < formFields.length ? 'inline-block' : 'none';
    submitBtn.style.display = nextStep === formFields.length ? 'inline-block' : 'none';
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
                const [, categoryName] = input.name.match(/\[(.*?)\]/);
                if (!formData[field.name][categoryName]) {
                    formData[field.name][categoryName] = [];
                }
                formData[field.name][categoryName].push(input.value);
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
                Object.entries(formData[field.name]).forEach(([categoryName, items]) => {
                    items.forEach(item => {
                        const input = form.querySelector(`input[name="${field.name}[${categoryName}]"][value="${item}"]`);
                        if (input) input.checked = true;
                    });
                });
            }
        }
    }
}

function findPreviousStep(currentStep) {
    for (let i = currentStep - 1; i >= 0; i--) {
        const field = formFields[i];
        if (!field.showIf || field.showIf(formData)) {
            return i;
        }
    }
    return -1; // If no previous step is found
}

function findNextStep(currentStep) {
    for (let i = currentStep + 1; i < formFields.length; i++) {
        const field = formFields[i];
        if (!field.showIf || field.showIf(formData)) {
            return i;
        }
    }
    return formFields.length; // If no next step is found, return length to indicate end
}

nextBtn.addEventListener('click', () => {
    saveFieldData();
    const nextStep = findNextStep(currentStep);
    if (nextStep < formFields.length) {
        currentStep = nextStep;
        renderStep(currentStep);
        updateNavigation();
    }
});

prevBtn.addEventListener('click', () => {
    saveFieldData();
    const prevStep = findPreviousStep(currentStep);
    if (prevStep >= 0) {
        currentStep = prevStep;
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