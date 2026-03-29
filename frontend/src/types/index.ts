export interface Board {
    id: string;
    name: string;
    description?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface TaskList {
    id: string;
    name: string;
    position: number;
    board_id: string;
    tasks?: Task[];
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    status: string;
    position: number;
    list_id: string;
    labels: Label[];
}

export interface Label {
    id: string;
    name: string;
    color?: string;
}