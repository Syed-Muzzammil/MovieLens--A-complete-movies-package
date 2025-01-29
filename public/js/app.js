function showAddMovieForm() {
    document.getElementById('add-movie-form').style.display = 'block';
}

function hideAddMovieForm() {
    document.getElementById('add-movie-form').style.display = 'none';
}

function searchMovies() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const movieCards = document.querySelectorAll(".movie-card");

    movieCards.forEach((card) => {
        const description = card.querySelector("p");
        const showMoreButton = document.createElement("button");
        showMoreButton.className = "show-more";
        showMoreButton.textContent = "Show More";

        card.appendChild(showMoreButton);

        showMoreButton.addEventListener("click", () => {
            if (description.classList.contains("expanded")) {
                description.classList.remove("expanded");
                showMoreButton.textContent = "Show More";
            } else {
                description.classList.add("expanded");
                showMoreButton.textContent = "Show Less";
            }
        });

        if (description.scrollHeight <= description.offsetHeight) {
            showMoreButton.style.display = "none";
        }
    });
});



function viewDetails(title) {
    alert('Details of ' + title);
}
