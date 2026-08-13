package com.example.sprint_planning.task.model;

public enum TaskStatus {
    TODO,
    DOING,
    DONE;

    public static TaskStatus fromString(String value) {
        if (value == null) return TODO;
        try {
            return TaskStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TODO;
        }
    }
}
