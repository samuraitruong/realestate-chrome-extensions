// Saves options to chrome.storage
function save_options() {
    var apiKey = document.getElementById('apiKey').value;
    var preferAddress = document.getElementById('preferAddress').value;
    var replaceMap = document.getElementById('replaceMap').checked;
    chrome.storage.sync.set({
        apiKey: apiKey,
        preferAddress: preferAddress,
        replaceMap: replaceMap
    }, function () {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        apiKey: '',
        preferAddress: '',
        replaceMap: true
    }, function (items) {
        document.getElementById('apiKey').value = items.apiKey;
        document.getElementById('preferAddress').value = items.preferAddress;
        document.getElementById('replaceMap').checked = items.replaceMap;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);