//var Db = chrome.extension.getBackgroundPage().Db;
function _(s, elem) {
    elem = elem || document;
    return elem.querySelector(s);
}

var modalDiv = document.createElement('div');
modalDiv.className = "modal fade";
modalDiv.id = "harvest-jira-dialog";
_("body").appendChild(modalDiv);

var harvestJiraButton = {
    render: function (selector, renderer) {
        harvestJiraButton.renderTo(selector, renderer);
    },
    renderTo: function (selector, renderer) {
        var i, len, elems = document.querySelectorAll(selector);
        for (i = 0, len = elems.length; i < len; i += 1) {
            elems[i].classList.add('harvest-jira');
        }
        for (i = 0, len = elems.length; i < len; i += 1) {
            renderer(elems[i]);
        }
    },
    getJIRATaskIdFromUrl: function (jiraTaskUrl) {
        var taskId = jiraTaskUrl.substr(jiraTaskUrl.lastIndexOf('/') + 1);
        if (taskId.indexOf("?") > 0) {
            taskId = taskId.substr(0, taskId.indexOf("?"));
        }
        return taskId;
    },
    getJIRADomainFromUrl: function (jiraTaskUrl) {
        var domain;
        if (jiraTaskUrl.indexOf("://") > -1) {
            domain = jiraTaskUrl.split('/')[2];
        }
        else {
            domain = jiraTaskUrl.split('/')[0];
        }
        return domain;
    },
    createButton: function (parameters) {
        var buttonElement = document.createElement('button');
        buttonElement.className = 'hui-button hui-button-small';
        buttonElement.innerHTML = 'Log on JIRA';
        var jiraTaskTitle = "";
        if (typeof(parameters.jiraTaskTitle) !== 'undefined') {
            jiraTaskTitle = parameters.jiraTaskTitle;
        }
        var harvestTimeSpent = '0:00';
        if (typeof(parameters.harvestTimeSpent) !== 'undefined') {
            harvestTimeSpent = parameters.harvestTimeSpent;
        }
        if (typeof(parameters.jiraTaskUrl) !== 'undefined') {
            var jiraTaskId = harvestJiraButton.getJIRATaskIdFromUrl(parameters.jiraTaskUrl);
            var domainUrl = harvestJiraButton.getJIRADomainFromUrl(parameters.jiraTaskUrl);
            if (domainUrl.indexOf('atlassian') !== -1) {
                buttonElement.setAttribute('data-jira-task-url', parameters.jiraTaskUrl);
                buttonElement.setAttribute('data-jira-task-id', jiraTaskId);
                buttonElement.setAttribute('data-jira-base-url', domainUrl);
                buttonElement.addEventListener('click', function (e) {
                    var modalUrl = chrome.extension.getURL("html/modal.html");
                    var domainUrl = buttonElement.getAttribute('data-jira-base-url');
                    var taskId = buttonElement.getAttribute('data-jira-task-id');
                    var url = '//' + domainUrl + '/rest/api/2/issue/' + taskId + '/worklog';
                    var username = _jiraGlobalUsername;
                    var password = _jiraGlobalPassword;

                    $.ajax(url, {
                        beforeSend: function (request) {
                            request.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
                        },
                        contentType: 'application/json',
                        type: 'GET'
                    }).done(function (data) {
                        if (typeof(data.worklogs) === 'undefined') return;
                        for (var i = 0, l = data.worklogs.length; i < l; i++) {
                            var createdDate = new Date(data.worklogs[i].created);
                            data.worklogs[i]['date'] = createdDate.toISOString();
                            data.worklogs[i]['date'] = data.worklogs[i]['date'].substr(0,
                                data.worklogs[i]['date'].indexOf('T'));
                        }
                        data.worklogs.sort(function (a, b) {
                            var createdA = new Date(a.created);
                            var createdB = new Date(b.created);
                            if (createdA < createdB) {
                                return -1;
                            } else if (createdB > createdA){
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                        var harvestData =  harvestTimeSpent.split(':');
                        var hours = harvestData[0];
                        var minutes = harvestData[1];
                        var convertedTime = hours.trim() + "h " + minutes.trim() + "m";
                        var context = {
                            tasktitle: jiraTaskTitle,
                            worklogs: data.worklogs,
                            dataJiraBaseUrl: domainUrl,
                            dataJiraTaskId: taskId,
                            elapsedTime: harvestTimeSpent,
                            convertedTime: convertedTime
                        };
                        $.get(modalUrl, function (data) {
                            var template = Handlebars.compile(data);
                            var html = template(context);
                            var dialog = $("#harvest-jira-dialog");
                            dialog.html(html);
                            $("#btnLogWork").click(function () {
                                harvestJiraButton.addWorkLog(buttonElement);
                            });
                            dialog.modal("show");
                        }, "text");
                    });
                });
                return buttonElement;
            }
        }
    },
    addWorkLog: function (buttonElement) {
        var btn = $("#btnLogWork");
        var domainUrl = btn.data('jira-base-url');
        var taskId = btn.data('jira-task-id');
        var comment = $("#harvest-jira-comment").val();
        var timeSpent = btn.data('harvest-time-spent');
        var url = 'https://' + domainUrl + '/rest/api/2/issue/' + taskId + '/worklog';
        var data = {
            comment: comment,
            timeSpent: timeSpent
        };
        var message = {
            type: "logwork",
            domainUrl: domainUrl,
            taskId: taskId,
            url: url,
            data: data
        };
        chrome.runtime.sendMessage(message);
    },
    newMessage: function (request, sender, sendResponse) {
        if (request.type === 'logged-work-successfully') {
            $("#harvest-jira-dialog .modal-content").html("<div class='modal-body text-center'><h3>Work logged successfully<h3></div>");
            var closeTabMessage = {
                type: "closetab",
                tabId: request.tabId
            };
            chrome.runtime.sendMessage(closeTabMessage);
        } else if (request.type === 'logged-work-failed') {
            $("#harvest-jira-dialog .modal-content").html("<div class='modal-body text-center'><h3>Oops! there was a bit of an issue there</h3></div>");
            var closeTabMessage = {
                type: "closetab",
                tabId: request.tabId
            };
            chrome.runtime.sendMessage(closeTabMessage);
        }
    }
};

chrome.runtime.onMessage.addListener(harvestJiraButton.newMessage);
