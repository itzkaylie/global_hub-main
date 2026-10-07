map.locate({ setView: true, maxZoom: 10 });

// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Example of adding interactivity (such as showing/hiding scholarship details)
    const scholarshipTypes = document.querySelectorAll('.scholarship-type');

    scholarshipTypes.forEach(type => {
        type.addEventListener('click', () => {
            type.classList.toggle('expanded');
        });
    });
});

// scripts.js

// Get all the FAQ buttons
const faqQuestions = document.querySelectorAll('.faq-question');

// Add an event listener for each question
faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
        // Toggle the answer visibility
        const answer = question.nextElementSibling;

        // If the answer is visible, hide it. If it's hidden, show it.
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
        } else {
            answer.style.display = 'block';
        }
    });
});


faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        answer.classList.toggle('show');
    });
});
