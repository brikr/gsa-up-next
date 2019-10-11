# gsa-up-next
Simple web page to for the "Intermission" screen during GSA events. You can view a live version [here](https://analog-figure-224304.appspot.com/AIzaSyDWyz_0HbtIRkJmd02RLyozUXiwXnJrTAU).

## Usage
You can serve the project locally via [Angular CLI](https://cli.angular.io/).
```
ng serve
```
Navigate to `http://localhost:4200/<API_KEY>`, where `<API_KEY>` is an API Key generated from Google Cloud (the project makes use of the Google Calendar API to fetch events).

You can also deploy to your favorite Google Cloud project with the [Google Cloud SDK](https://cloud.google.com/sdk/):
```
ng build
gcloud app deploy
```

## Generating Google Cloud API Keys
To create an API key, your account must be granted the Editor role (`roles/editor`) on the Google Cloud project. You can view project roles on the [IAM & admin](https://console.cloud.google.com/iam-admin/iam) page.

### To create an API key:
You will need to first enable the Google Calendar API for your project.
1. Go to the [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) page and click `Enable`.
2. Navigate to the [APIs & Services→Credentials](https://console.cloud.google.com/apis/credentials) panel in the GCP Console.
3. Select Create credentials, then select API key from the dropdown menu.
4. **Optional**: You can choose to restrict your key by selecting the `Restrict Key` option in the popup.
    - Find the **API restrictions** section and select `Restrict key` radio option.
    -  Select `Google Calendar API` from the dropdown list and click `Save`
5. Find your new API key on the **Credentials** page and look for the **Key** column.
6. Copy the **Key** value and use this as your `<API_KEY>`.
