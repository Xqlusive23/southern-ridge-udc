# Southern Ridge Union De' Creditos

Online banking and operations console for **Southern Ridge Union De' Creditos** (Southern Ridge UDC). Members sign in to E-Banking to review balances, move money, and update contact details. Officers use the admin desk to change member records and post balance adjustments.

This is a normal Node.js / Next.js app. It runs on **Windows**, macOS, and Linux. No database server is required. Member records are stored in `data/bank.json` on the machine that runs the app.

Private repo: [https://cursor.com/codebase/imisi-adenuga/bank-ops](https://cursor.com/codebase/imisi-adenuga/bank-ops)

## Open on Windows

You need [Node.js LTS](https://nodejs.org) (20 or newer). The installer adds `node` and `npm` to PATH. Restart Cursor or your terminal after installing.

### Option A — folder already on your PC

1. Open the project folder in File Explorer or Cursor (**File → Open Folder**).
2. Double-click `START-WINDOWS.bat`.
3. The first run installs packages, then opens [http://127.0.0.1:43147](http://127.0.0.1:43147).

Or in PowerShell, from inside the project folder:

```powershell
.\setup-windows.ps1
```

If PowerShell blocks the script:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\setup-windows.ps1
```

### Option B — get the repo onto this PC

From the repo page, use **Open in Cursor**. That clones `imisi-adenuga/bank-ops` and opens it. Then run `START-WINDOWS.bat`.

To clone with Git for Windows, open the repo page, copy the clone URL shown there, then in PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Documents\bank-ops"
cd "$env:USERPROFILE\Documents"
git clone <paste-the-clone-url> bank-ops
```

You can also clone in WSL with the [Origin CLI](https://cursor.com/docs/origin/cli).

### Option C — zip

Extract the project zip into `Documents\bank-ops`. If Cursor says it failed to checkout the branch because the folder is not a git repository, double-click `INIT-GIT-WINDOWS.bat` first. Then open that folder in Cursor and run `START-WINDOWS.bat`.

## Demo sign-in

| Portal | Email | Password |
| --- | --- | --- |
| E-Banking | `maria.okonkwo@email.com` | `RidgeMember26` |
| Operations console | `admin@southernridgeudc.com` | `RidgeAdmin26` |

On the login screens you can click **Fill demo credentials**. Other seeded members (`james.whitfield@email.com`, `amina.cole@email.com`) use `RidgeMember26`. Amina’s membership starts frozen.

## What you can do

**Members**

- Open Everyday Checking and Ridge Savings online
- Review balances, account numbers, and activity
- Transfer between their own accounts or to another member by account number
- Update phone, address, and password

**Officers**

- Search and open any membership
- Edit name, email, phone, address, date of birth, and status
- Credit, debit, or set an exact account balance
- Freeze or close individual accounts
- Open additional checking, savings, or business accounts
- Reset a member password
- Create a new member from the desk

## If Cursor says “not a git repository”

The folder you opened has the source files but no `.git` directory (common after extracting a zip). Close that window, run `INIT-GIT-WINDOWS.bat` in the extracted folder, then **File → Open Folder** on the same folder.

## Notes

This is a local demonstration system. Do not store real customer credentials here. Set `SESSION_SECRET` in `.env.local` if you deploy it beyond this machine.
