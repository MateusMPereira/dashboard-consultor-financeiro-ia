# Financial Dashboard

## Development Guide

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/MateusMPereira/dashboard-consultor-financeiro-ia.git

# Step 2: Navigate to the project directory
cd dashboard-consultor-financeiro-ia

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Report server (PDF)

You can run a small report server that exposes `POST /api/report` which accepts a JSON body `{ "phone": "4396666986" }` or a query param `?phone=4396666986`.

Setup:

1. Ensure the following environment variables are set (for Supabase access):

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
```

2. Install dependencies and start the report server:

```powershell
npm i
npm run serve:report
```

3. Example using `curl` to request a PDF:

```powershell
curl -X POST "http://localhost:3000/api/report" -H "Content-Type: application/json" -d '{"phone":"4396666986"}' --output report.pdf
```

The endpoint will return HTTP 400 for any error or if the user/company is not found (as requested).
