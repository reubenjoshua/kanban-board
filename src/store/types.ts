export type Label = {
    id: string
    name: string
    color: string
}

export type Task = {
    id: string
    columnId: string
    title: string
    description: string
    labelIds: string[]
    createdAt: number
}

export type Column = {
    id: string
    title: string
    taskIds: string[]
}

export type Board = {
    id: string
    name: string
    columnIds: string[]
    columns: Record<string, Column>
    tasks: Record<string, Task>
    labels: Record<string, Label>
}