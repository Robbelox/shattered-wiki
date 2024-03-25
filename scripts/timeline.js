document.addEventListener("DOMContentLoaded", function() {
    // Define your timeline data
    const timelineData = [
        { date: "2000", event: "Event 1", description: "Description of Event 1" },
        { date: "2005", event: "Event 2", description: "Description of Event 2" },
        // Add more events as needed
    ];

    // Function to create timeline elements dynamically
    function createTimelineElement(date, event, description) {
        const timelineElement = document.createElement("div");
        timelineElement.classList.add("timeline-item");
        timelineElement.innerHTML = `
            <div class="timeline-content">
                <h2>${event}</h2>
                <p>${description}</p>
                <span class="timeline-date">${date}</span>
            </div>
        `;
        return timelineElement;
    }

    // Function to populate the timeline with data
    function populateTimeline() {
        const timelineContainer = document.querySelector(".timeline-container");
        timelineData.forEach((item, index) => {
            const { date, event, description } = item;
            const timelineElement = createTimelineElement(date, event, description);
            timelineElement.style.left = `${index * 100}px`; // Adjust spacing between events
            timelineContainer.appendChild(timelineElement);
        });
    }

    // Call the function to populate the timeline
    populateTimeline();
});
