# Southern Ridge Union De' Creditos

Online banking and operations console for **Southern Ridge Union De' Creditos** (Southern Ridge UDC). Members sign in to E-Banking to review balances, move money, and update contact details. Officers use the admin desk to change member records and post balance adjustments.

Member data is stored in a local JSON ledger at `data/bank.json`. No external database is required.

## Run locally

```bash
npm install
npm run dev
```

The app listens on [http://127.0.0.1:43147](http://127.0.0.1:43147).

## Demo sign-in

| Portal | Email | Password |
| --- | --- | --- |
| E-Banking | `maria.okonkwo@email.com` | `RidgeMember26` |
| Operations console | `admin@southernridgeudc.com` | `RidgeAdmin26` |

Other seeded members (`james.whitfield@email.com`, `amina.cole@email.com`) use `RidgeMember26`. Amina’s membership starts frozen so you can see a restricted member in the admin desk.

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

## Notes

This is a local demonstration system. Do not use it as a production bank, and do not store real customer credentials here. Set `SESSION_SECRET` in `.env.local` if you deploy it beyond this machine.
