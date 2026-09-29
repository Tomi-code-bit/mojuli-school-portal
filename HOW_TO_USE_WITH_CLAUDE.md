# How to Connect and Modify Your Website with Claude

You can easily modify and expand **Mojuli Christ Glorious School Portal** using **Claude** using any of the three methods below:

---

## Method 1: Connect Directly via Claude.ai Projects & GitHub (Recommended & Easiest)
Claude has a native GitHub integration that can read and write directly to your repository:
1. Go to [Claude.ai](https://claude.ai) and sign in.
2. Click **Projects** in the left menu, then click **Create Project**.
3. Name your project **"Mojuli School Portal"**.
4. In the Project Knowledge section, click **Connect GitHub**.
5. Select your repository: **`Tomi-code-bit/mojuli-school-portal`**.
6. Claude will now have complete access to `CLAUDE.md`, `index.html`, and all code!
7. You can now prompt Claude:
   - *"Add a new fee payment receipt generator"*
   - *"Change the tuition fee amounts"*
   - *"Modify the school calendar events"*
   Claude will make changes and can even create GitHub Pull Requests or commits directly for you!

---

## Method 2: Working in Any Claude Chat (Fastest One-Click Method)
If you don't use Claude Projects:
1. Open a new chat on [Claude.ai](https://claude.ai) or the Claude Desktop App.
2. Drag and drop `CLAUDE.md` and `index.html` (or `mojuli_standalone.html` / `mojuli_school_portal.zip`) into the chat.
3. Type what you want to change (e.g. *"Please add an extra subject 'French' to Primary 4"*).
4. Claude will provide the updated code block or updated file.
5. Save the updated file into your local folder.

---

## Method 3: Using Claude Code (Terminal Agent)
If you install Node.js on your computer:
1. Open PowerShell and run:
   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```
2. Navigate to your project folder:
   ```powershell
   cd "C:\Users\SUCCESS NEW\.gemini\antigravity-ide\scratch\mojuli-school-portal"
   ```
3. Type:
   ```powershell
   claude
   ```
4. Claude Code will automatically detect `CLAUDE.md`, analyze your website, make edits directly, and run Git commands on your behalf!

---

## Key Files Reference
- `index.html`: The complete single-page application with styles, logic, and views.
- `CLAUDE.md`: System prompt & architectural documentation specifically formatted for Claude.
- `supabaseClient.js`: Supabase cloud integration for real-time online syncing.
- `supabase_schema.sql`: Complete database schema for cloud deployments.
- `server.exe`: Your local web server running at `http://localhost:8080/index.html`.
