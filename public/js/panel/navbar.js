document.addEventListener("DOMContentLoaded", function () {
    $('#acc-max').on('click', function () {
        $('.dropdown-menu').toggleClass('active');
    });
    $('#acc-min').on('click', function () {
        $('.dropdown-menu').toggleClass('active');
    });
    var dropdownMenu = document.querySelector(".dropdown-menu");
    document.addEventListener("click", function (event) {
        if (!dropdownMenu.classList.contains("show")) {
            dropdownMenu.classList.remove("active");
        } 
    });
});