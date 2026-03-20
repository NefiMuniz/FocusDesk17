CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$'),
    password_hash   TEXT NOT NULL,
    name            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- Table for boards
CREATE TABLE boards (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 100),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_boards_user_id ON boards(user_id);

-- Table for lists inside boards
CREATE TABLE lists (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id    UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name        TEXT NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50),
    position    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (board_id, name)
);

CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_lists_board_position ON lists(board_id, position);

-- Table for tasks inside lists
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id         UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    title           TEXT NOT NULL CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200),
    description     TEXT,
    due_date        DATE,
    position        INTEGER NOT NULL DEFAULT 0,
    status          TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_list_id ON tasks(list_id);
CREATE INDEX idx_tasks_list_position ON tasks(list_id, position);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Table for labels
CREATE TABLE labels (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50),
    color       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE INDEX idx_labels_user_id ON labels(user_id);

-- Table for relation between tasks and labels
CREATE TABLE task_labels (
    task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label_id    UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_task_labels_label_id ON task_labels(label_id);