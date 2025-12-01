# Google Cloud Credentials

To enable AI features, you need to set up Google Cloud credentials:

1. Create a Google Cloud Project
2. Enable the Vertex AI API
3. Create a Service Account
4. Download the JSON key file
5. Place it in this directory as `service-account-key.json`

Alternatively, the app will work in fallback mode without AI features.

## Environment Variables Needed:
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json
VERTEX_AI_LOCATION=us-central1