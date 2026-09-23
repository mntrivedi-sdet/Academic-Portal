// =========================================
// Load Footer
// =========================================

fetch("footer.html")
    .then(response => response.text())
    .then(data => {

        document.getElementById("footer").innerHTML = data;

        // =========================================
        // WhatsApp Button
        // =========================================

        const whatsappButton =
            document.getElementById("whatsappButton");

        const whatsappPopup =
            document.getElementById("whatsappPopup");

        if (whatsappButton && whatsappPopup) {

            whatsappButton.addEventListener("click", function () {

                whatsappPopup.classList.toggle("show");

            });

        }

    })
    .catch(error => {

        console.error("Error loading footer:", error);

    });