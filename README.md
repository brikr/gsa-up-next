# gsa-up-next
Simple web page to for the "Intermission" screen during GSA events

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
