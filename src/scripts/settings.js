var Db = chrome.extension.getBackgroundPage().Db;
var Settings = {
    $jiraUsername: document.querySelector("#jira-username"),
    $jiraPassword: document.querySelector("#jira-password"),
    $jiraSave: document.querySelector("#jira-save"),

    showPage: function () {
        Settings.$jiraUsername.value = Db.get("jira-username");
        Settings.$jiraPassword.value = Db.get("jira-password");
    }
};

document.addEventListener('DOMContentLoaded', function (e) {
    Settings.showPage();
    Settings.$jiraUsername.addEventListener('blur', function (e) {
        chrome.runtime.sendMessage({type: "update-jira-username", value: Settings.$jiraUsername.value});
        showAlert();
    });
    Settings.$jiraPassword.addEventListener('blur', function (e) {
        chrome.runtime.sendMessage({type: "update-jira-password", value: Settings.$jiraPassword.value});
        showAlert();
    });
    Settings.$jiraSave.addEventListener('click', function (e) {
        chrome.runtime.sendMessage({type: "update-jira-username", value: Settings.$jiraUsername.value});
        chrome.runtime.sendMessage({type: "update-jira-password", value: Settings.$jiraPassword.value});
        showAlert();
    });
});

function showAlert() {
    if (document.getElementById('alert-user-data')) {
        document.getElementById('alert-user-data').remove();
    }
    var alert = document.createElement('div');
    alert.id = 'alert-user-data';
    alert.style.background = '#3ac653';
    alert.style.color = '#fff';
    alert.style.padding = '10px 20px';
    alert.style.margin = '0 -15px 10px';
    alert.appendChild(document.createTextNode('User data updated'));
    document.getElementById('form-jira-alerts').appendChild(alert);
    setTimeout(function () {
        if (document.getElementById('alert-user-data')) {
            document.getElementById('alert-user-data').remove();
        }
    }, 5000);
}