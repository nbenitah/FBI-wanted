// Add click event to static images in indexFBI.html
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fbi-img').forEach(img => {
        img.addEventListener('click', function() {
            const info = this.alt || 'No information available for this individual.';
            alert('Info: ' + info);
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const wantedListContainer = document.getElementById('wanted-list-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search');
    const sortSelect = document.getElementById('sort-select');
    let allPersons = [];
    let currentSort = 'name-asc';
    // Set your default API endpoint here
    const apiUrl = 'https://api.fbi.gov/wanted/v1/list';
    // Removed invalid https://api.fbi.gov/@wantedmy endpoint (not used)

    async function fetchWantedList() {
        // Show loading message
        if (wantedListContainer) {
            wantedListContainer.innerHTML = '<p>Loading wanted individuals...</p>';
        }
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('API Endpoint not found. Please check the URL.');
                } else if (response.status === 403) {
                     throw new Error('Access forbidden. You might need API keys or different permissions.');
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log("API Data:", data); // Log the data to inspect its structure

            // Store all persons for search
            allPersons = data.items || [];
            // If API returns no items, use mock-wanted.json
            if (!allPersons.length) {
                console.warn('API returned no items, loading mock data...');
                try {
                    const mockResponse = await fetch('mock-wanted.json');
                    const mockData = await mockResponse.json();
                    allPersons = mockData.items || [];
                } catch (mockError) {
                    console.error('Failed to load mock data:', mockError);
                }
            }
            renderWantedList(sortPersons(allPersons, currentSort));
            // Render wanted list (used for search and initial display)
            function renderWantedList(persons) {
                wantedListContainer.innerHTML = '';
                if (!persons || persons.length === 0) {
                    wantedListContainer.innerHTML = '<p>No results found.</p>';
                    return;
                }
                persons.forEach((person, idx) => {
                    const card = document.createElement('div');
                    card.classList.add('wanted-person-card');
                    let imageUrl = 'https://via.placeholder.com/150';
                    if (person.images && person.images.length > 0) {
                        imageUrl = person.images[0].original;
                        // Log image URL for debugging
                        console.log('Image URL for', person.title, ':', imageUrl);
                    } else {
                        console.warn('No image found for', person.title);
                    }
                    const title = person.title || 'Unknown Name';
                    const description = person.description || 'No description available.';
                    // Special case for Mohammad Baseri
                    const detailsId = `details-${person.uid || title.replace(/\s+/g, '-')}`;
                    let detailsLink = `<a href="#" class="view-details" data-details-id="${detailsId}">View Details</a>`;
                    let imgTag = '';
                    if (title.toUpperCase().includes('MOHAMMAD BASERI')) {
                        detailsLink += ` | <a href="https://www.fbi.gov/wanted/terrorinfo/mohammad-baseri/@@download.pdf" target="_blank">PDF Details</a>`;
                        imgTag = `<img src="${imageUrl}" alt="${title}" onerror='this.onerror=null;this.src="https://www.fbi.gov/wanted/terrorinfo/mohammad-baseri/baseri2.jpg";console.warn("Image failed for ${title}", this.src);'>`;
                    } else {
                        imgTag = `<img src="${imageUrl}" alt="${title}" onerror='this.onerror=null;this.src="https://via.placeholder.com/150";console.warn("Image failed for ${title}", this.src);'>`;
                    }
                    let detailsHtml = '';
                    if ((idx + 1) % 9 === 0) {
                        detailsHtml = `<div class="extra-details"><strong>Full Description:</strong> ${description}</div>`;
                        if (person.details) {
                            detailsHtml += `<div class="extra-details"><strong>Details:</strong> ${person.details}</div>`;
                        }
                    } else {
                        detailsHtml = `<p>${description.substring(0, 100)}...</p>`;
                    }
                    card.innerHTML = `
                        ${imgTag}
                        <h2>${title}</h2>
                        ${detailsHtml}
                        ${detailsLink}
                    `;
                    wantedListContainer.appendChild(card);
                });
                // Modal for showing details
                let modal = document.getElementById('details-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'details-modal';
                    modal.style.display = 'none';
                    modal.style.position = 'fixed';
                    modal.style.top = '0';
                    modal.style.left = '0';
                    modal.style.width = '100vw';
                    modal.style.height = '100vh';
                    modal.style.background = 'rgba(0,0,0,0.7)';
                    modal.style.zIndex = '9999';
                    modal.innerHTML = '<div id="details-content" style="background:#fff;max-width:500px;margin:5% auto;padding:20px;border-radius:8px;position:relative;"></div>';
                    document.body.appendChild(modal);
                    modal.addEventListener('click', function(e) {
                        if (e.target === modal) modal.style.display = 'none';
                    });
                }
                const detailsContent = document.getElementById('details-content');
                document.querySelectorAll('.view-details').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const id = this.getAttribute('data-details-id');
                        const person = persons.find(p => (p.uid && id === `details-${p.uid}`) || (!p.uid && id === `details-${(p.title || '').replace(/\s+/g, '-')}`));
                        if (person) {
                            let html = `<h2>${person.title}</h2>`;
                            html += `<div style="display:flex;gap:24px;align-items:flex-start;">`;
                            html += `<div style="flex:0 0 220px;">`;
                            if (person.images && person.images.length > 0) {
                                html += `<img src="${person.images[0].original}" alt="${person.title}" style="width:220px;height:auto;max-width:100%;border-radius:8px;">`;
                            } else {
                                html += `<div style="width:220px;height:300px;background:#eee;display:flex;align-items:center;justify-content:center;border-radius:8px;">No Image</div>`;
                            }
                            html += `</div>`;
                            html += `<div class="modal-info" style="flex:1;">`;
                            html += `<p><strong>Description:</strong> ${person.description || 'No description available.'}</p>`;
                            if (person.details) {
                                html += `<p><strong>Details:</strong> ${person.details}</p>`;
                            }
                            if (person.remarks) {
                                html += `<p><strong>Remarks:</strong> ${person.remarks}</p>`;
                            }
                            if (person.caution) {
                                html += `<p><strong>Caution:</strong> ${person.caution}</p>`;
                            }
                            if (person.reward_text) {
                                html += `<p><strong>Reward:</strong> ${person.reward_text}</p>`;
                            }
                            if (person.warning_message) {
                                html += `<p><strong>Warning:</strong> ${person.warning_message}</p>`;
                            }
                            if (person.url) {
                                html += `<p><a href="${person.url}" target="_blank">FBI Official Page</a></p>`;
                            }
                            html += `</div>`;
                            html += `</div>`;
                            detailsContent.innerHTML = html;
                            modal.style.display = 'block';
                        }
                    });
                });
            }

            // Search functionality
            if (searchButton && searchInput) {
                function doSearch() {
                    const query = searchInput.value.trim().toLowerCase();
                    if (!query) {
                        renderWantedList(sortPersons(allPersons, currentSort));
                        return;
                    }
                    const filtered = allPersons.filter(person => {
                        // Match on title or aliases if available
                        let match = false;
                        if (person.title && person.title.toLowerCase().includes(query)) match = true;
                        if (!match && Array.isArray(person.aliases)) {
                            match = person.aliases.some(alias => alias && alias.toLowerCase().includes(query));
                        }
                        return match;
                    });
                    renderWantedList(sortPersons(filtered, currentSort));
                }
                searchButton.addEventListener('click', doSearch);
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') doSearch();
                });
            }
            // Sorting functionality
            function sortPersons(persons, sortType) {
                let arr = [...persons];
                switch (sortType) {
                    case 'name-asc':
                        arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                        break;
                    case 'name-desc':
                        arr.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
                        break;
                    case 'reward-desc':
                        arr.sort((a, b) => parseReward(b.reward_text) - parseReward(a.reward_text));
                        break;
                    case 'reward-asc':
                        arr.sort((a, b) => parseReward(a.reward_text) - parseReward(b.reward_text));
                        break;
                    case 'date-desc':
                        arr.sort((a, b) => new Date(b.date_of_birth_used || b.date_of_birth || b.modified || b.publication) - new Date(a.date_of_birth_used || a.date_of_birth || a.modified || a.publication));
                        break;
                    case 'date-asc':
                        arr.sort((a, b) => new Date(a.date_of_birth_used || a.date_of_birth || a.modified || a.publication) - new Date(b.date_of_birth_used || b.date_of_birth || b.modified || b.publication));
                        break;
                }
                return arr;
            }
            function parseReward(rewardText) {
                if (!rewardText) return 0;
                let match = rewardText.replace(/,/g, '').match(/\$([0-9]+)/);
                return match ? parseInt(match[1], 10) : 0;
            }
            if (sortSelect) {
                sortSelect.addEventListener('change', function() {
                    currentSort = sortSelect.value;
                    renderWantedList(sortPersons(allPersons, currentSort));
                });
            }
            if (clearSearchButton && searchInput) {
                clearSearchButton.addEventListener('click', () => {
                    searchInput.value = '';
                    renderWantedList(allPersons);
                });
            }
        } catch (error) {
            console.error('Error fetching wanted list:', error);
            wantedListContainer.innerHTML = `<p style="color: red;">Failed to load wanted list: ${error.message}. Please try again later.</p>`;
        }
    }

    fetchWantedList();
});