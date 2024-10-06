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
    const fieldsetContainer = document.createElement('div');
    fieldsetContainer.className = 'fieldset-container';

    const legend = document.createElement('legend');
    legend.textContent = field.header;

    fieldset.appendChild(legend);
    fieldset.appendChild(fieldsetContainer);

    if (field.type === 'radio' || field.type === 'checkbox') {
        field.options ? renderOptions(fieldsetContainer, field) : renderBlocks(fieldsetContainer, field);
    }

    form.appendChild(fieldset);
    updateProgressBar();
    
    restoreFieldData(field);
    updateNextButtonState();

    // Add event listeners to all inputs in the current step
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', updateNextButtonState);
    });
}

function renderOptions(fieldset, field) {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    fieldset.appendChild(optionsContainer);

    field.options.forEach(option => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.value = option;
        input.id = `${field.name}-${option.replace(/\s+/g, '-').toLowerCase()}`;
        
        const customCheckbox = document.createElement('span');
        customCheckbox.className = 'custom-checkbox';
        
        label.appendChild(input);
        label.appendChild(customCheckbox);
        label.appendChild(document.createTextNode(option));
        optionsContainer.appendChild(label);
    });
}

function renderBlocks(fieldset, field) {
    field.blocks.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'checkbox-block';

        const blockDivContainer = document.createElement('div');
        blockDivContainer.className = 'checkbox-block--container';
        
        const blockHeader = document.createElement('h3');
        blockHeader.textContent = block.categoryHeader;
        blockDiv.appendChild(blockHeader);
        blockDiv.appendChild(blockDivContainer);

        block.items.forEach(item => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.name = `${field.name}[${block.categoryName}]`;
            input.value = item;
            input.id = `${field.name}-${block.categoryName}-${item.replace(/\s+/g, '-').toLowerCase()}`;
            
            const customCheckbox = document.createElement('span');
            customCheckbox.className = 'custom-checkbox';
            
            label.appendChild(input);
            label.appendChild(customCheckbox);
            label.appendChild(document.createTextNode(item));
            blockDivContainer.appendChild(label);
        });

        fieldset.appendChild(blockDiv);
    });
}

function updateNextButtonState() {
    const field = formFields[currentStep];
    const inputs = form.querySelectorAll('input:checked');
    
    if (field.type === 'radio') {
        nextBtn.disabled = inputs.length === 0;
    } else if (field.type === 'checkbox') {
        nextBtn.disabled = inputs.length === 0;
    }
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

    updateNextButtonState();
}

function saveFieldData() {
    const field = formFields[currentStep];
    const inputs = form.querySelectorAll('input:checked');
    
    if (field.type === 'radio') {
        formData[field.name] = inputs[0] ? inputs[0].value : null;

        if (field.name === 'type' && formData[field.name] === "Детский оздоровительный лагерь") {
            formData.people = "Дети";
        }
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
    alert('Form submitted!');
    console.log('Form data:', formData);
});

// Initial render
renderStep(currentStep);
updateNavigation();