document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app.js');
    const activitiesList = document.getElementById('activities-list');
    const activitySelect = document.getElementById('activity');
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // Fetch and display activities
    console.log('Fetching activities...');
    fetch('/activities')
        .then(response => {
            console.log('Fetch response:', response);
            return response.json();
        })
        .then(activities => {
            console.log('Activities data:', activities);
            activitiesList.innerHTML = '';
            activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

            for (const [name, details] of Object.entries(activities)) {
                // Create activity card
                const card = document.createElement('div');
                card.className = 'activity-card';
                card.setAttribute('data-activity', name);
                card.innerHTML = `
                    <h4>${name}</h4>
                    <p><strong>Description:</strong> ${details.description}</p>
                    <p><strong>Schedule:</strong> ${details.schedule}</p>
                    <p><strong>Max Participants:</strong> ${details.max_participants}</p>
                    <p><strong>Current Participants:</strong></p>
                    <ul class="participants">
                        ${details.participants.map(email => `<li>${email} <button class="delete-participant" data-email="${email}" data-activity="${name}">×</button></li>`).join('')}
                    </ul>
                `;
                activitiesList.appendChild(card);

                // Add to select
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                activitySelect.appendChild(option);
            }
        })
        .catch(error => {
            console.error('Error fetching activities:', error);
            activitiesList.innerHTML = '<p>Error loading activities.</p>';
        });

    // Add event listeners for delete buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-participant')) {
            const email = e.target.dataset.email;
            const activity = e.target.dataset.activity;
            fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                messageDiv.className = 'message success';
                messageDiv.textContent = data.message;
                messageDiv.classList.remove('hidden');
                // Remove the li
                e.target.parentElement.remove();
            })
            .catch(error => {
                messageDiv.className = 'message error';
                messageDiv.textContent = error.detail || 'An error occurred.';
                messageDiv.classList.remove('hidden');
            });
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const activity = document.getElementById('activity').value;

        fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email })
        })
        .then(response => response.json())
        .then(data => {
            messageDiv.className = 'message success';
            messageDiv.textContent = data.message;
            messageDiv.classList.remove('hidden');
            // Update the participants list for the signed-up activity
            const card = document.querySelector(`[data-activity="${activity}"]`);
            if (card) {
                const ul = card.querySelector('.participants');
                const li = document.createElement('li');
                li.innerHTML = `${email} <button class="delete-participant" data-email="${email}" data-activity="${activity}">×</button>`;
                ul.appendChild(li);
            }
        })
        .catch(error => {
            messageDiv.className = 'message error';
            messageDiv.textContent = error.detail || 'An error occurred.';
            messageDiv.classList.remove('hidden');
        });
    });
});
