export const UserRolesEnums = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    member: "member",
}

export const AvailableUserRoles = Object.values(UserRolesEnums);

export const TaskStatusEnums = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done",
}

export const AvailableTaskStatus = Object.values(TaskStatusEnums);