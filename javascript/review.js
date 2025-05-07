function openModal() {
    document.getElementById("ratingModal").style.display = "block";
}

function closeModal() {
    document.getElementById("ratingModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    const stars = document.querySelectorAll(".star");
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener("click", function () {
            selectedRating = parseInt(star.getAttribute("data-value"));
            updateStars(selectedRating);
        });

        star.addEventListener("mouseover", function () {
            updateStars(parseInt(star.getAttribute("data-value")));
        });

        star.addEventListener("mouseleave", function () {
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        stars.forEach(star => {
            let starValue = parseInt(star.getAttribute("data-value"));
            star.classList.toggle("filled", starValue <= rating);
        });
    }
});

function submitReview() {
    const rating = document.querySelectorAll(".star.filled").length;
    const reviewText = document.getElementById("review").value;
    alert(`Rating: ${rating} stars\nReview: ${reviewText}`);
    closeModal();
}
