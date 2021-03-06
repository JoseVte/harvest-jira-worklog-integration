# Harvest to JIRA worklog integration

Adds a button in Harvest that lets you import your Harvest logged time directly into JIRA

This idea came up after wasting a lot of time moving the tracked time from harvest to JIRA tasks. You see, JIRA and Harvest measure time differently. 

Here is an example:

Let's say you worked on a task for one hour and 6 minutes
- In harvest you would get something like: 1:06
- In JIRA you would have to calculate the equivalent of that number to the exact time, to get something like: 1h 6m

It gets pretty annoying to waste time calculating mere minutes, with this tool all you have to do is click two buttons and you're set, no more wasting time writing the time down!

## Installing from Source

1. Clone the repository: `git clone git@github.com:JoseVte/harvest-jira-worklog-integration.git`
2. Navigate to chrome://extensions/ and enable "Developer Mode".
3. Choose "Load unpacked extension..."
4. Open the `src/` directory inside the `harvest-jira-worklog-integration` directory you just cloned
5. Right click the extension icon and click on "Options"
6. Enter your username and password for JIRA

## Installing from Chrome Web Store **(DEPRECATED)**

1. Go to [Harvest/Jira worklog integration](https://chrome.google.com/webstore/detail/harvestjira-worklog-integ/jnljfejacjncgpphbcpenmfjgdpeaapd) in the Chrome Web Store.
2. Click on "Add to Chrome"
3. Right click the extension icon and click on "Options"
4. Enter your username and password for JIRA

The application icon was taken from [Fontawesome](http://fontawesome.io)

Ironically some of the code was taken from [Toggl button](https://github.com/toggl/toggl-button)

The package is a fork of https://github.com/eatskolnikov/harvest-jira-worklog-integration updated to new Harvest GUI