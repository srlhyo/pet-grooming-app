# Database Schema Draft (first pass)

Rough first-pass schema for the MVP. Design only: nothing here has been applied to the database, and no ORM has been chosen.

Conventions assumed for now:

- `id` is a `uuid` primary key on every table.
- `created_at` / `updated_at` are `timestamptz` on every table.
- Every tenant-owned table carries `shop_id` (marked **[tenant]** below). Full tenant isolation (RLS, composite keys, etc.) is deliberately not solved yet.

---

## shops

One row per grooming business (the tenant).

- `id` (PK)
- `name`
- `email`
- `phone`
- `timezone` — IANA name, e.g. `Europe/Lisbon`
- `created_at`, `updated_at`

## users

Staff who log in to the app.

- `id` (PK)
- `shop_id` (FK → shops) **[tenant]**
- `email` — unique
- `full_name`
- `role` — `owner` | `admin` | `groomer`
- `is_active`
- `created_at`, `updated_at`

Note: Supabase Auth could later own the login identity; if so, a nullable `auth_user_id` linking to `auth.users` would be added here. Not decided yet.

## clients

The shop's customers (pet owners). They do not log in.

- `id` (PK)
- `shop_id` (FK → shops) **[tenant]**
- `first_name`
- `last_name`
- `email`
- `phone`
- `email_notifications_enabled` — opt-in/out for reminders
- `notes`
- `created_at`, `updated_at`

## pets

- `id` (PK)
- `shop_id` (FK → shops) **[tenant]**
- `client_id` (FK → clients)
- `name`
- `species` — `dog` | `cat` | `other`
- `breed` — free text
- `date_of_birth`
- `weight_kg`
- `notes` — grooming / medical / behaviour notes
- `created_at`, `updated_at`

## appointments

The central entity.

- `id` (PK)
- `shop_id` (FK → shops) **[tenant]**
- `client_id` (FK → clients)
- `pet_id` (FK → pets)
- `groomer_id` (FK → users, nullable) — assigned staff member
- `starts_at` — `timestamptz`
- `ends_at` — `timestamptz`
- `service_description` — free text for now (a `services` table can come later)
- `status` — `scheduled` | `completed` | `cancelled` | `no_show`
- `price` — nullable
- `notes`
- `created_at`, `updated_at`

`client_id` is stored directly as well as being reachable via the pet, because reminders and client history need the client without an extra join. Keeping them consistent is a later concern.

## notifications_log

One row per notification the system decided to send about an appointment. Email only for the MVP (reminders and missed-appointment notices). The table is a log, not a queue: rows are created when a notification is due to exist and updated as it is sent or fails.

- `id` (PK)
- `shop_id` (FK → shops) **[tenant]** — stored directly even though it is reachable via the appointment, so per-shop history and future tenant isolation do not need joins.
- `appointment_id` (FK → appointments) — the appointment the message is about. Required for both MVP types.
- `client_id` (FK → clients) — who the message was for. Kept alongside `appointment_id` so "all messages sent to this client" is a direct lookup.
- `type` — `appointment_reminder` | `missed_appointment`
- `recipient_email` — snapshot of the address the message was sent to. Clients can change their email later; the log must keep what was actually used.
- `status` — `pending` | `sent` | `failed`
  - `pending`: created, not yet sent
  - `sent`: the email provider accepted it
  - `failed`: sending did not succeed; `error_message` says why
- `scheduled_for` — `timestamptz`, when the message should go out. Reminder: some time before `appointments.starts_at`. Missed-appointment: when the appointment is marked `no_show`.
- `sent_at` — `timestamptz`, nullable; set when `status` becomes `sent`.
- `provider_message_id` — nullable; identifier returned by the email provider, so a message can be traced in the provider's dashboard.
- `error_message` — nullable; last failure reason. Even a rough MVP should never fail silently.
- `created_at`, `updated_at`

Choices made for simplicity:

- `type` and `status` are small fixed value sets (enum or checked text, decided with the ORM). Adding values later is easy.
- `recipient_email` rather than a generic `recipient` + `channel` pair, because only email exists today. If SMS/WhatsApp is added, a `channel` column can be introduced then.
- No retry counters, provider name, or template fields yet. `error_message` and `status` give enough to see that something went wrong; retry policy is a later design.

Relationships:

- `notifications_log.shop_id → shops.id`: every log row belongs to one shop.
- `notifications_log.appointment_id → appointments.id`: one appointment can have several log rows (one reminder, one missed-appointment notice, plus any re-sends after a reschedule).
- `notifications_log.client_id → clients.id`: one client can have many log rows. Should always match the appointment's client.

Left undecided for this table:

- Whether a rescheduled appointment reuses the pending row or cancels it and creates a new one (a `cancelled` status may be added for that).
- Whether opted-out clients get a `skipped` row for visibility or no row at all.
- How far ahead reminders are scheduled, and whether more than one reminder is sent.
- Retry behaviour and any uniqueness rule preventing duplicate sends.
- Whether `appointment_id` stays required once non-appointment emails exist.

---

## Relationships

```mermaid
erDiagram
    shops ||--o{ users : has
    shops ||--o{ clients : has
    clients ||--o{ pets : owns
    pets ||--o{ appointments : "booked for"
    clients ||--o{ appointments : books
    users |o--o{ appointments : "assigned groomer"
    appointments ||--o{ notifications_log : triggers
```

- shop → users, clients, pets, appointments, notifications_log (all carry `shop_id`)
- client → pets
- client + pet → appointments; appointment → optional groomer (user)
- appointment (+ client) → notifications_log

## Assumptions

- One user belongs to exactly one shop.
- Appointments store absolute instants (`timestamptz`); the shop's timezone is used only to display them.
- A service is just text on the appointment for now.
- Removing a client, pet or user will most likely be a soft delete (flag/timestamp), so appointment history is kept.

## Left undecided

- Supabase Auth vs application-owned authentication.
- Tenant isolation mechanics (RLS, composite foreign keys, query scoping).
- Indexes, uniqueness rules, and overlap prevention for groomer schedules.
- Reminder timing and retry policy for notifications.
- Whether `services`, `shop_memberships` (multi-shop users) or an audit table are needed later.
