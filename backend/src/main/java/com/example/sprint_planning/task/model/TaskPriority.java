package com.example.sprint_planning.task.model;

public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH;

    public static TaskPriority fromString(String value) {
        if (value == null) return null;
        try {
            return TaskPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
