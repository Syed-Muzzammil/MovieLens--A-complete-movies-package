const searchBar = document.getElementById('search-bar');
const movieCards = document.getElementById('movie-cards');

searchBar.addEventListener('input', () => {
    const searchTerm = searchBar.value.toLowerCase();
    const cards = movieCards.querySelectorAll('.movie-card');

    cards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});