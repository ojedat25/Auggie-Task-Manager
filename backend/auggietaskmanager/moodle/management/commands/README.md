# Mock task generator (`generate_mock_tasks`)

This folder includes a Django management command, `generate_mock_tasks`, that creates *mock* `Task` rows for development/testing.

## What it does

- Creates `moodle.models.Task` records for a user.
- **Ensures every generated `due_date` is within the next N days of when you run the command**.
  - By default: **within the next 7 days**.
- Can optionally generate tasks that look like they came from Moodle (`--source moodle`).

> Note: If you do not pass `--username` or `--user-id`, the command will assign tasks to the first existing user. If no users exist, it creates a dev user: `mockuser` (password: `mockpass`).

## Where to run it from

Run the command from the Django project directory (the one that contains `manage.py`):

- `backend/auggietaskmanager/`

## Quick start

```bash
cd backend/auggietaskmanager

# Create 10 tasks (default) due within the next 7 days
python manage.py generate_mock_tasks

# Create 25 tasks due within the next 7 days for a specific user
python manage.py generate_mock_tasks --count 25 --username alice
```

## Common examples

Create tasks due within the next **7 days** (explicit):

```bash
python manage.py generate_mock_tasks --days 7
```

Create tasks due within the next **3 days**:

```bash
python manage.py generate_mock_tasks --count 15 --days 3
```

Generate tasks that look like Moodle imports:

```bash
python manage.py generate_mock_tasks --source moodle --course "CSCI 201" --count 12
```

Make generation reproducible (same random output each run with the same seed):

```bash
python manage.py generate_mock_tasks --seed 12345
```

## Options

| Option | Default | Description |
|---|---:|---|
| `--count` | `10` | Number of tasks to create. Must be `> 0`. |
| `--days` | `7` | Due dates are generated uniformly between `now` and `now + days`. Must be `> 0`. |
| `--source` | `manual` | Task `source` field. One of: `manual`, `moodle`. |
| `--username` | *(none)* | Assign tasks to the user with this username. Mutually exclusive with `--user-id`. |
| `--user-id` | *(none)* | Assign tasks to the user with this database id. Mutually exclusive with `--username`. |
| `--seed` | *(none)* | Random seed for reproducible generation. |
| `--course` | `""` | Course name (only used when `--source moodle`). |
| `--completed-rate` | `0.2` | Fraction in `[0, 1]` of tasks marked completed. |

## Notes / gotchas

- This command writes to your configured database (often `db.sqlite3` in development). Use it only for dev/test environments.
- If you use `--source moodle`, mock tasks will be created with a `mock-XXXXXX` `external_id`.
- Due dates are generated using Django’s timezone utilities (`django.utils.timezone.now()`), so they are timezone-aware.

## Troubleshooting

If you get errors about missing tables, run migrations first:

```bash
python manage.py migrate
```

If you want to create a user manually first (optional):

```bash
python manage.py createsuperuser
```

