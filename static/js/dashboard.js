// static/js/dashboard.js
// ==============================================================================
// MEDIBOT DASHBOARD - COMPLETE FRONTEND LOGIC
// ==============================================================================
// Features:
// - Modal management (open/close with animations)
// - Hospital finder with Google Maps integration
// - Medicine search with OpenFDA/RxNorm
// - Appointment booking, listing, rescheduling, cancellation
// - Chat history viewer
// - Health tracker (if implemented)
// - Floating chatbot widget with real-time messaging
// - GSAP animations for smooth UX
// ==============================================================================

// ==============================================================================
// DOM ELEMENT REFERENCES
// ==============================================================================
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbot = document.querySelector(".chatbot");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector("#send-btn");

// ==============================================================================
// MODAL MANAGEMENT FUNCTIONS
// ==============================================================================

/**
 * Opens a modal by ID with GSAP animation
 * @param {string} modalId - The ID of the modal to open
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID "${modalId}" not found`);
        return;
    }
    
    modal.style.display = 'flex';
    
    // GSAP animation for modal entrance
    gsap.from(`#${modalId} .modal`, {
        scale: 0,
        duration: 0.3,
        ease: "back.out(1.7)"
    });
    
    // Load data based on modal type
    if (modalId === 'appointmentModal') {
        hideBookingForm();
        loadAppointments();
    } else if (modalId === 'historyModal') {
        loadChatHistory();
    }
}

/**
 * Closes a modal by ID
 * @param {string} modalId - The ID of the modal to close
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
}

// Close modals when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
            }
        });
    });
});

// ==============================================================================
// HOSPITAL FINDER FUNCTIONALITY
// ==============================================================================

// static/js/dashboard.js  (hospital functions)
async function findHospitals(pagetoken = null, useDistanceRank = false) {
    const radiusEl = document.getElementById('hospitalRadius');
    const radius = parseInt(radiusEl ? radiusEl.value : 5000, 10) || 5000;
    const resultsDiv = document.getElementById('hospitalResults');

    resultsDiv.innerHTML = `<div class="loading-text">🔍 Finding nearby hospitals...</div>`;

    if (!navigator.geolocation) {
        resultsDiv.innerHTML = `<div class="loading-text error">❌ Geolocation not supported by your browser.</div>`;
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        try {
            const body = {
                latitude: userLat,
                longitude: userLng,
            };

            if (pagetoken) {
                body.pagetoken = pagetoken;
            } else {
                // if user wants nearest, ask backend to use rankby=distance
                if (useDistanceRank) {
                    body.rankby = "distance";
                } else {
                    body.radius = radius;
                }
            }

            const resp = await fetch('/dashboard/hospitals/nearby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await resp.json();

            if (!resp.ok || !data.success) {
                console.error('Places API error:', data);
                resultsDiv.innerHTML = `<div class="loading-text error">❌ Error fetching hospitals: ${escapeHtml(data.error || 'Unknown error')}</div>`;
                return;
            }

            const hospitals = data.hospitals || [];
            if (hospitals.length === 0) {
                resultsDiv.innerHTML = `<div class="loading-text">No hospitals found nearby. Try increasing radius.</div>`;
                return;
            }

            // Build HTML
            let html = '<div class="hospital-list">';
            hospitals.forEach(h => {
                const ratingHtml = h.rating ? `<div class="hospital-rating">⭐ ${escapeHtml(String(h.rating))} (${escapeHtml(String(h.total_ratings || 0))})</div>` : '';
                const addr = h.formatted_address || h.vicinity || 'Address not available';
                const openBadge = (h.open_now === true) ? `<span class="status-open">Open Now</span>` : (h.open_now === false ? `<span class="status-closed">Closed</span>` : '');
                html += `
                    <div class="hospital-item">
                        <div class="hospital-header">
                            <div class="hospital-name">${escapeHtml(h.name)}</div>
                            ${ratingHtml}
                        </div>
                        <div class="hospital-address">${escapeHtml(addr)} ${openBadge}</div>
                        <div class="hospital-meta" style="margin-top:0.5rem; font-size:0.9rem; color:var(--text-secondary);">
                            ${h.phone ? `Phone: ${escapeHtml(h.phone)} · ` : ''}
                            ${h.website ? `<a href="${escapeHtml(h.website)}" target="_blank" rel="noopener">Website</a>` : ''}
                        </div>
                        <div class="hospital-actions" style="margin-top:0.75rem; display:flex; gap:0.5rem;">
                            <button class="hospital-btn" onclick="window.open('${escapeHtml(h.directions_url)}', '_blank')">
                                <span class="material-symbols-outlined">directions</span> Directions
                            </button>
                            <button class="hospital-btn" onclick="window.open('${escapeHtml(h.maps_url)}', '_blank')">
                                <span class="material-symbols-outlined">map</span> Open Map
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            // Show "Load more" if token present
            if (data.next_page_token) {
                html += `<div style="margin-top:1rem; text-align:center;">
                            <button id="loadMoreHospitalsBtn" class="modal-btn">Load more results</button>
                         </div>`;
            }

            resultsDiv.innerHTML = html;

            // Attach click for load more (if present)
            const loadBtn = document.getElementById('loadMoreHospitalsBtn');
            if (loadBtn) {
                loadBtn.addEventListener('click', async () => {
                    // Inform user they will be waiting briefly (next_page_token often needs ~2 seconds)
                    loadBtn.disabled = true;
                    loadBtn.textContent = 'Loading...';
                    // Wait 2 seconds before fetching (token may not be active immediately)
                    setTimeout(() => {
                        findHospitals(data.next_page_token, false);
                    }, 2100);
                });
            }
        } catch (err) {
            console.error("findHospitals error:", err);
            resultsDiv.innerHTML = `<div class="loading-text error">❌ Error fetching hospitals. Check console for details.</div>`;
        }
    }, (error) => {
        console.error("Geolocation error:", error);
        resultsDiv.innerHTML = `<div class="loading-text error">❌ Unable to get your location. Please enable location services.</div>`;
    }, { timeout: 10000, enableHighAccuracy: true });
}

/* Utility: escape HTML to prevent XSS */
function escapeHtml(text) {
    if (!text && text !== 0) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// ==============================================================================
// MEDICINE SEARCH FUNCTIONALITY
// ==============================================================================

/**
 * Searches for medicine information using OpenFDA/RxNorm APIs
 */
async function searchMedicine() {
    const medicineName = document.getElementById('medicineName').value.trim();
    const resultsDiv = document.getElementById('medicineResults');

    if (!medicineName) {
        alert('Please enter a medicine name');
        return;
    }

    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">🔍 Searching for medicine information...</div>';

    try {
        const response = await fetch('/dashboard/medicine/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medicine_name: medicineName })
        });

        const data = await response.json();

        if (response.ok && data.found) {
            let html = `
                <div class="result-card" style="background: white; padding: 1.5rem; border-radius: 12px; margin-top: 1rem; box-shadow: var(--shadow-sm);">
                    <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: var(--primary-color);">
                        ${escapeHtml(data.name || medicineName)}
                    </h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            `;
            
            if (data.generic_name && data.generic_name !== 'Not available') {
                html += `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                        <span style="font-weight: 600; color: var(--text-primary);">Generic Name:</span>
                        <span style="text-align: right; color: var(--text-secondary);">${escapeHtml(data.generic_name)}</span>
                    </div>
                `;
            }
            
            if (data.brand_name && data.brand_name !== 'Not available') {
                html += `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                        <span style="font-weight: 600; color: var(--text-primary);">Brand Name:</span>
                        <span style="text-align: right; color: var(--text-secondary);">${escapeHtml(data.brand_name)}</span>
                    </div>
                `;
            }
            
            if (data.manufacturer && data.manufacturer !== 'Not available') {
                html += `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                        <span style="font-weight: 600; color: var(--text-primary);">Manufacturer:</span>
                        <span style="text-align: right; color: var(--text-secondary);">${escapeHtml(data.manufacturer)}</span>
                    </div>
                `;
            }
            
            if (data.purpose && data.purpose !== 'Not available') {
                html += `
                    <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                        <span style="font-weight: 600; display: block; margin-bottom: 0.5rem; color: var(--text-primary);">Purpose:</span>
                        <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">${escapeHtml(data.purpose)}</p>
                    </div>
                `;
            }
            
            if (data.warnings && data.warnings !== 'Not available') {
                html += `
                    <div style="padding: 0.75rem 0; border-top: 1px solid var(--border-color);">
                        <span style="font-weight: 600; display: block; margin-bottom: 0.5rem; color: var(--danger-color);">⚠️ Warnings:</span>
                        <p style="margin: 0; color: var(--text-secondary); line-height: 1.6;">${escapeHtml(data.warnings)}</p>
                    </div>
                `;
            }
            
            if (data.source) {
                html += `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <span style="font-size: 0.75rem; color: var(--text-light);">Source: ${escapeHtml(data.source)}</span>
                    </div>
                `;
            }
            
            html += `</div></div>`;
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    ❌ ${escapeHtml(data.message || 'Medicine not found. Please check the spelling and try again.')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Medicine search error:', error);
        resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger-color);">❌ Error searching for medicine. Please try again.</div>';
    }
}

// ==============================================================================
// APPOINTMENT MANAGEMENT
// ==============================================================================

/**
 * Shows the appointment booking form
 */
function showBookingForm() {
    document.getElementById('bookingForm').style.display = 'block';
    document.getElementById('appointmentsList').style.display = 'none';
    
    // Reset form
    document.getElementById('appointmentBookingForm').reset();
    
    // Set minimum date to today
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
}

/**
 * Hides the appointment booking form
 */
function hideBookingForm() {
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('appointmentsList').style.display = 'block';
}

/**
 * Loads all appointments for the current user
 */
async function loadAppointments() {
    const resultsDiv = document.getElementById('appointmentsResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">📅 Loading appointments...</div>';

    try {
        const response = await fetch('/dashboard/appointments');
        const data = await response.json();

        if (response.ok && data.success) {
            if (data.appointments.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                        <span class="material-symbols-outlined" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;">event_busy</span>
                        <p style="font-size: 1.125rem; margin-bottom: 1rem;">No appointments scheduled yet</p>
                        <button class="modal-btn" onclick="showBookingForm()" style="margin: 0 auto;">
                            <span class="material-symbols-outlined">add</span>
                            Book Your First Appointment
                        </button>
                    </div>
                `;
                return;
            }

            let html = '<div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">';
            
            data.appointments.forEach(appt => {
                const statusColors = {
                    'pending': 'background: #dbeafe; color: #1e40af;',
                    'confirmed': 'background: #dcfce7; color: #166534;',
                    'cancelled': 'background: #fee2e2; color: #991b1b;',
                    'completed': 'background: #f3f4f6; color: #374151;',
                    'rescheduled': 'background: #fef3c7; color: #92400e;'
                };
                
                const statusStyle = statusColors[appt.status] || statusColors.pending;
                
                html += `
                    <div class="appointment-item" style="padding: 1.25rem; background: white; border-radius: 12px; border-left: 4px solid var(--primary-color); box-shadow: var(--shadow-sm);">
                        <div class="appointment-header" style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                            <div>
                                <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.25rem; color: var(--text-primary);">${escapeHtml(appt.doctor_name)}</h4>
                                <p style="color: var(--text-secondary); font-size: 0.875rem;">${escapeHtml(appt.specialization)}</p>
                            </div>
                            <span style="padding: 0.375rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; ${statusStyle}">
                                ${appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                        </div>
                        <div style="margin-bottom: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                                <span class="material-symbols-outlined" style="font-size: 1rem;">calendar_today</span>
                                <span>${escapeHtml(appt.appointment_date)}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                                <span class="material-symbols-outlined" style="font-size: 1rem;">schedule</span>
                                <span>${escapeHtml(appt.appointment_time)}</span>
                            </div>
                        </div>
                        ${appt.notes ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.75rem;"><strong>Notes:</strong> ${escapeHtml(appt.notes)}</p>` : ''}
                        ${appt.status === 'pending' ? `
                            <div class="appointment-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                                <button class="appointment-btn btn-reschedule" onclick="rescheduleAppointment('${appt.id}', '${escapeHtml(appt.doctor_name)}', '${appt.appointment_date}', '${appt.appointment_time}')" style="flex: 1; padding: 0.625rem; background: var(--primary-light); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.375rem; font-weight: 500;">
                                    <span class="material-symbols-outlined" style="font-size: 1rem;">edit_calendar</span>
                                    Reschedule
                                </button>
                                <button class="appointment-btn btn-cancel" onclick="cancelAppointment('${appt.id}', '${escapeHtml(appt.doctor_name)}')" style="flex: 1; padding: 0.625rem; background: var(--danger-color); color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.375rem; font-weight: 500;">
                                    <span class="material-symbols-outlined" style="font-size: 1rem;">cancel</span>
                                    Cancel
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            html += '</div>';
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--danger-color);">❌ ${escapeHtml(data.error || 'Error loading appointments')}</div>`;
        }
    } catch (error) {
        console.error('Load appointments error:', error);
        resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger-color);">❌ Error loading appointments</div>';
    }
}

/**
 * Reschedules an existing appointment
 */
function rescheduleAppointment(appointmentId, doctorName, currentDate, currentTime) {
    const newDate = prompt(`Reschedule appointment with ${doctorName}\n\nEnter new date (YYYY-MM-DD):`, currentDate);
    if (!newDate) return;
    
    const newTime = prompt(`Enter new time (HH:MM):`, currentTime);
    if (!newTime) return;
    
    fetch('/dashboard/appointment/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            appointment_id: appointmentId,
            new_date: newDate,
            new_time: newTime
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ ' + data.message);
            loadAppointments();
        } else {
            alert('❌ ' + (data.error || 'Failed to reschedule'));
        }
    })
    .catch(error => {
        console.error('Reschedule error:', error);
        alert('❌ Error rescheduling appointment');
    });
}

/**
 * Cancels an appointment
 */
function cancelAppointment(appointmentId, doctorName) {
    if (!confirm(`Are you sure you want to cancel the appointment with ${doctorName}?`)) {
        return;
    }
    
    fetch('/dashboard/appointment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('✅ ' + data.message);
            loadAppointments();
        } else {
            alert('❌ ' + (data.error || 'Failed to cancel'));
        }
    })
    .catch(error => {
        console.error('Cancel error:', error);
        alert('❌ Error cancelling appointment');
    });
}

// Book appointment form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('appointmentBookingForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                doctor_name: document.getElementById('doctorName').value,
                specialization: document.getElementById('specialization').value,
                appointment_date: document.getElementById('appointmentDate').value,
                appointment_time: document.getElementById('appointmentTime').value,
                notes: document.getElementById('appointmentNotes').value
            };

            try {
                const response = await fetch('/dashboard/appointment/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (data.success) {
                    alert('✅ ' + data.message);
                    hideBookingForm();
                    form.reset();
                    loadAppointments();
                } else {
                    alert('❌ ' + (data.error || 'Failed to book appointment'));
                }
            } catch (error) {
                console.error('Book appointment error:', error);
                alert('❌ Error booking appointment');
            }
        });
    }
});

// ==============================================================================
// CHAT HISTORY FUNCTIONALITY
// ==============================================================================

/**
 * Loads chat history for the current user
 */
async function loadChatHistory() {
    const resultsDiv = document.getElementById('historyResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">💬 Loading chat history...</div>';

    try {
        const response = await fetch('/dashboard/chat/history');
        const data = await response.json();

        if (response.ok && data.success && data.chats && data.chats.length > 0) {
            let html = '<div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">';
            
            data.chats.forEach(chat => {
                html += `
                    <div class="activity-item" style="padding: 1.25rem; background: var(--background); border-radius: 12px; border-left: 4px solid var(--primary-color);">
                        <div style="margin-bottom: 0.75rem;">
                            <strong style="color: var(--text-primary);">You:</strong>
                            <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); line-height: 1.6;">${escapeHtml(chat.message)}</p>
                        </div>
                        <div style="padding-top: 0.75rem; border-top: 1px solid var(--border-color);">
                            <strong style="color: var(--primary-color);">MediBot:</strong>
                            <p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); line-height: 1.6;">${escapeHtml(chat.response)}</p>
                        </div>
                        <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-light);">${escapeHtml(chat.timestamp)}</div>
                    </div>
                `;
            });
            
            html += '</div>';
            resultsDiv.innerHTML = html;
        } else {
            resultsDiv.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
                    <span class="material-symbols-outlined" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;">chat_bubble_outline</span>
                    <p>No chat history found. Start chatting with MediBot!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load chat history error:', error);
        resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger-color);">❌ Error loading chat history</div>';
    }
}

// ==============================================================================
// CHATBOT WIDGET FUNCTIONALITY
// ==============================================================================

let userMessage = null;

/**
 * Creates a chat list item element
 */
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<span class="material-symbols-outlined">health_and_safety</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

/**
 * Generates a response from the chatbot
 */
const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageElement.textContent = data.response || "I'm here to help! Please describe your symptoms or ask me a health question.";
        } else {
            messageElement.textContent = "Sorry, I encountered an error. Please try again.";
        }
        
    } catch (error) {
        console.error('Chatbot error:', error);
        messageElement.textContent = "Connection error. Please check your internet connection.";
    }
    
    chatbox.scrollTo(0, chatbox.scrollHeight);
};

/**
 * Handles sending a chat message
 */
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = "auto";

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

// Chatbot event listeners
if (chatInput) {
    chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
}

if (sendChatBtn) {
    sendChatBtn.addEventListener("click", handleChat);
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        chatbot.classList.remove("show");
    });
}

if (chatbotToggler) {
    chatbotToggler.addEventListener("click", () => {
        chatbot.classList.toggle("show");
    });
}

/**
 * Opens the chatbot programmatically
 */
function openChatbot() {
    if (chatbot) {
        chatbot.classList.add("show");
    }
}

// ==============================================================================
// INITIALIZATION
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date for appointment booking
    const appointmentDate = document.getElementById('appointmentDate');
    if (appointmentDate) {
        appointmentDate.min = new Date().toISOString().split('T')[0];
    }

    // GSAP Animations for page load
    gsap.from(".page-header", {
        y: -50,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out"
    });

    gsap.from(".stat-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
    });

    gsap.from(".quick-actions", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        delay: 0.5
    });
});

// ==============================================================================
// END OF DASHBOARD.JS
// ==============================================================================
