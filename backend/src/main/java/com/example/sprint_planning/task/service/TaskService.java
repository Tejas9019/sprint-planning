package com.example.sprint_planning.task.service;

import com.example.sprint_planning.task.dto.CreateTaskRequest;
import com.example.sprint_planning.task.dto.UpdateTaskRequest;
import com.example.sprint_planning.task.dto.TaskResponse;
import com.example.sprint_planning.task.dto.CommentResponse;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    List<TaskResponse> getTasksForActiveTenant();
    TaskResponse createTask(CreateTaskRequest request);
    TaskResponse updateTask(UUID id, UpdateTaskRequest request);
    void deleteTask(UUID id);
    CommentResponse addComment(UUID taskId, String text);
}
