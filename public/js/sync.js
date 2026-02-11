const actionButtons = document.querySelectorAll('.simpan-draft, .change-page-button, .individual-indicator-step, .individual-step-text, .submit-button');
let syncTimeoutHTMLNotif;

actionButtons.forEach(button => {
    button.addEventListener('click', () => {
        $('#syncNotif').removeClass('show');
        clearTimeout(syncTimeoutHTMLNotif);
        syncTimeoutHTMLNotif = setTimeout(() => {
            $('#syncNotif').html('');
        }, 300);
    });
});