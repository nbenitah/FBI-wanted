document.addEventListener('DOMContentLoaded', () => {
    const omdbDocsContainer = document.getElementById('omdb-docs-container');
    const docSortSelect = document.getElementById('doc-sort-select');
    const omdbApiKey = 'fb1cba48';
    const documentaryTitles = [
        'Most Wanted',
        'America’s Most Wanted',
        'FBI: Most Wanted',
        'The FBI Files',
        'Manhunt: Unabomber',
        'The Most Dangerous Man in America',
        'The Most Wanted Woman',
        'The Most Wanted Man',
        'Most Wanted Criminals',
        'FBI Undercover',
        'The Hunt for the Zodiac Killer',
        'Unsolved Mysteries',
        'Making a Murderer',
        'The Confession Tapes',
        'The Innocent Man',
        'The Disappearance of Madeleine McCann',
    ];
    async function fetchDocumentaries() {
        if (!omdbDocsContainer) return;
        omdbDocsContainer.innerHTML = '<p>Loading documentaries...</p>';
        let docs = [];
        for (const title of documentaryTitles) {
            try {
                const url = `https://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}`;
                const response = await fetch(url);
                const data = await response.json();
                if (data && data.Response === 'True') {
                    docs.push(data);
                }
            } catch (err) {
                docs.push({ Title: title, Error: true });
            }
        }
        let currentSort = docSortSelect ? docSortSelect.value : 'title-asc';
        renderDocs(docs, currentSort);
        if (docSortSelect) {
            docSortSelect.onchange = function() {
                renderDocs(docs, docSortSelect.value);
            };
        }
        function renderDocs(docs, sortType) {
            let sorted = [...docs];
            switch (sortType) {
                case 'title-asc':
                    sorted.sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
                    break;
                case 'title-desc':
                    sorted.sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
                    break;
                case 'year-desc':
                    sorted.sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
                    break;
                case 'year-asc':
                    sorted.sort((a, b) => (parseInt(a.Year) || 0) - (parseInt(b.Year) || 0));
                    break;
            }
            let docsHtml = '';
            for (const data of sorted) {
                if (data.Error) {
                    docsHtml += `<div style="margin:12px;color:red;">Failed to load documentary: ${data.Title}</div>`;
                } else {
                    docsHtml += `<div class="doc-card">
                        <img src="${data.Poster !== 'N/A' ? data.Poster : 'https://via.placeholder.com/150'}" alt="${data.Title}" style="width:100%;height:340px;object-fit:cover;border-radius:4px;">
                        <h3 style="font-size:1.1rem;margin:8px 0 4px 0;">${data.Title}</h3>
                        <p style="font-size:0.95rem;margin:0 0 8px 0;">${data.Year} | ${data.Type}</p>
                        <p style="font-size:0.9rem;flex:1;">${data.Plot}</p>
                        <a href="https://www.imdb.com/title/${data.imdbID}" target="_blank" style="margin-top:8px;align-self:flex-start;">View on IMDb</a>
                    </div>`;
                }
            }
            omdbDocsContainer.innerHTML = docsHtml || '<p>No documentaries found.</p>';
        }
    }
    fetchDocumentaries();
});