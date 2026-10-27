# Mini CRM

**Live demo: [crm-mvvitaliis-projects.vercel.app](https://crm-mvvitaliis-projects.vercel.app/)** — sign up with any email and password.

A multi-tenant CRM built with Next.js: organizations, contacts, a drag-and-drop deal board, role-based access and an audit log. A learning project for practising full-stack work with the App Router, server actions and a relational database.

## Features

- **Organizations (multi-tenant).** Every user can create organizations. All data is scoped to the organization in the URL (`/[orgSlug]/...`), and every server action checks membership first.
- **Roles.** There are three: `owner`, `manager` and `viewer`.
  - Owners invite members by link (invitations expire) and change their roles.
  - Viewers can read but not edit.
- **Contacts.** Create and edit contacts within an organization.
- **Deal board.** A kanban with three stages (lead → negotiation → won). Deals move between columns by drag-and-drop with `@dnd-kit`. Each deal has notes and tasks.
- **Audit log.** Stage changes are written to an audit table and shown on a separate page.
- **Auth.** Email and password sign-up and login, with Better Auth and database sessions.
- **i18n.** Russian and English UI. The locale is stored in a cookie.
- **Responsive layout,** including the mobile menu and board.

## Stack

Next.js 16 (App Router, server actions) · React 19 · TypeScript · PostgreSQL · Drizzle ORM · Better Auth · Zod · Tailwind CSS 4 · @dnd-kit · Vitest · Playwright

## Tests

- **Unit (Vitest), access rules:**
  - an outsider cannot read an organization's deals;
  - a viewer cannot move a deal;
  - a stage change writes exactly one audit row.
- **E2E (Playwright), the full flow:** register, create an organization, add a contact, create a deal, drag it to another stage and check the audit log.

## Running locally

Create `.env.local`:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/crm
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=any-long-random-string
```

Then:

```bash
pnpm install
pnpm db:migrate     # apply Drizzle migrations
pnpm dev            # http://localhost:3000
pnpm test           # unit tests
pnpm test:e2e       # Playwright end-to-end test
```
