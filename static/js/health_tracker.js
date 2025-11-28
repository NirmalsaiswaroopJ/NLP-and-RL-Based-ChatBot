// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.closest('.tab-btn').classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'medications') {
        loadMedications();
    } else if (tabName === 'history') {
        loadHistory();
    }
}

// Medication Form Submission
document.getElementById('medicationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        medication_name: document.getElementById('med_name').value,
        time: document.getElementById('med_time').value,
        dosage: document.getElementById('med_dosage').value,
        phone_number: document.getElementById('phone_number').value,
        notes: document.getElementById('med_notes').value
    };
    
    try {
        const response = await fetch('/health-tracker/medication/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Medication reminder added successfully!');
            document.getElementById('medicationForm').reset();
            loadMedications();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error adding medication');
    }
});

// Load Medications
async function loadMedications() {
    const listDiv = document.getElementById('medicationsList');
    listDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading...</div>';
    
    try {
        const response = await fetch('/health-tracker/medications');
        const data = await response.json();
        
        if (data.success && data.medications.length > 0) {
            let html = '';
            data.medications.forEach(med => {
                html += `
                    <div class="medication-item">
                        <div class="medication-info">
                            <h4>${med.medication_name}</h4>
                            <p>
                                <strong>Time:</strong> ${med.time} | 
                                <strong>Dosage:</strong> ${med.dosage}
                            </p>
                            ${med.notes ? `<p style="margin-top: 0.5rem;"><strong>Notes:</strong> ${med.notes}</p>` : ''}
                            ${med.phone_number ? `<p style="margin-top: 0.5rem;"><strong>Reminder:</strong> SMS to ${med.phone_number}</p>` : ''}
                        </div>
                        <div class="medication-actions">
                            <button class="btn btn-danger" onclick="deleteMedication('${med.id}')">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            });
            listDiv.innerHTML = html;
        } else {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">medication</span>
                    <p>No medications added yet. Add your first reminder above!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        listDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger-color);">❌ Error loading medications</div>';
    }
}

// Delete Medication
async function deleteMedication(medId) {
    if (!confirm('Are you sure you want to delete this medication reminder?')) {
        return;
    }
    
    try {
        const response = await fetch('/health-tracker/medication/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medication_id: medId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Medication deleted successfully');
            loadMedications();
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error deleting medication');
    }
}

// Health Assessment Form Submission
document.getElementById('assessmentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        overall_health: document.querySelector('input[name="overall_health"]:checked').value,
        sleep_hours: document.querySelector('input[name="sleep_hours"]:checked').value,
        exercise_frequency: document.querySelector('input[name="exercise_frequency"]:checked').value,
        stress_level: document.querySelector('input[name="stress_level"]:checked').value,
        diet_quality: document.querySelector('input[name="diet_quality"]:checked').value,
        water_intake: document.querySelector('input[name="water_intake"]:checked').value
    };
    
    try {
        const response = await fetch('/health-tracker/assessment/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAssessmentResults(data);
        } else {
            alert('❌ ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error submitting assessment');
    }
});

// Display Assessment Results
function displayAssessmentResults(data) {
    const resultsDiv = document.getElementById('assessmentResults');
    
    let healthScoreColor = '#10b981';
    if (data.health_score < 50) healthScoreColor = '#ef4444';
    else if (data.health_score < 70) healthScoreColor = '#f59e0b';
    
    let html = `
        <div class="results-card">
            <h3>
                <span class="material-symbols-outlined">analytics</span>
                Your Health Assessment Results
            </h3>
            
            <div class="health-score" style="color: ${healthScoreColor};">
                ${data.health_score}/100
            </div>
            
            <p style="text-align: center; margin-bottom: 2rem; color: var(--text-secondary); font-size: 1.125rem;">
                <strong>${data.feedback}</strong>
            </p>
            
            <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span class="material-symbols-outlined">lightbulb</span>
                Personalized Health Tips
            </h4>
            
            <ul class="tips-list">
    `;
    
    data.tips.forEach(tip => {
        html += `
            <li>
                <span class="material-symbols-outlined">check_circle</span>
                <span>${tip}</span>
            </li>
        `;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    
    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Load Assessment History
async function loadHistory() {
    const listDiv = document.getElementById('historyList');
    listDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading...</div>';
    
    try {
        const response = await fetch('/health-tracker/history');
        const data = await response.json();
        
        if (data.success && data.history.length > 0) {
            let html = '';
            data.history.forEach((record, index) => {
                let scoreColor = '#10b981';
                if (record.health_score < 50) scoreColor = '#ef4444';
                else if (record.health_score < 70) scoreColor = '#f59e0b';
                
                html += `
                    <div class="card" style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="margin: 0;">Assessment #${data.history.length - index}</h3>
                            <span style="color: var(--text-secondary); font-size: 0.875rem;">${record.date}</span>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: auto 1fr; gap: 1rem; align-items: center;">
                            <div style="font-size: 2.5rem; font-weight: 700; color: ${scoreColor};">
                                ${record.health_score}/100
                            </div>
                            <div>
                                <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                                    ${record.feedback}
                                </p>
                                <button class="btn btn-secondary" onclick="toggleTips('tips-${record.id}')" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
                                    <span class="material-symbols-outlined" style="font-size: 1rem;">visibility</span>
                                    View Tips
                                </button>
                            </div>
                        </div>
                        
                        <div id="tips-${record.id}" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                            <h4 style="margin-bottom: 1rem;">Health Tips:</h4>
                            <ul class="tips-list">
                                ${record.tips.map(tip => `
                                    <li>
                                        <span class="material-symbols-outlined">check_circle</span>
                                        <span>${tip}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            });
            listDiv.innerHTML = html;
        } else {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">assignment</span>
                    <p>No assessment history yet. Complete your first assessment to see results here!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        listDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger-color);">❌ Error loading history</div>';
    }
}

// Toggle Tips Visibility
function toggleTips(id) {
    const tipsDiv = document.getElementById(id);
    if (tipsDiv.style.display === 'none') {
        tipsDiv.style.display = 'block';
        event.target.querySelector('.material-symbols-outlined').textContent = 'visibility_off';
    } else {
        tipsDiv.style.display = 'none';
        event.target.querySelector('.material-symbols-outlined').textContent = 'visibility';
    }
}

// Open Chatbot (if available)
function openChatbot() {
    // If chatbot exists on dashboard, redirect there
    window.location.href = '/dashboard';
    setTimeout(() => {
        const chatbotToggler = document.querySelector('.chatbot-toggler');
        if (chatbotToggler) {
            chatbotToggler.click();
        }
    }, 500);
}

// Load medications on page load
window.addEventListener('DOMContentLoaded', () => {
    loadMedications();
});