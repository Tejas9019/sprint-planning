package com.example.sprint_planning.task.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.security.SecurityUtils;
import com.example.sprint_planning.tenant.context.TenantContext;
import com.example.sprint_planning.task.dto.CommentResponse;
import com.example.sprint_planning.task.dto.CreateTaskRequest;
import com.example.sprint_planning.task.dto.TaskResponse;
import com.example.sprint_planning.task.dto.UpdateTaskRequest;
import com.example.sprint_planning.task.model.Task;
import com.example.sprint_planning.task.model.TaskComment;
import com.example.sprint_planning.task.model.TaskPriority;
import com.example.sprint_planning.task.model.TaskStatus;
import com.example.sprint_planning.task.repository.TaskCommentRepository;
import com.example.sprint_planning.task.repository.TaskRepository;
import com.example.sprint_planning.user.model.User;
import com.example.sprint_planning.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final UserRepository userRepository;
    private final TenantContext tenantContext;

    public TaskServiceImpl(TaskRepository taskRepository,
                           TaskCommentRepository taskCommentRepository,
                           UserRepository userRepository,
                           TenantContext tenantContext) {
        this.taskRepository = taskRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.userRepository = userRepository;
        this.tenantContext = tenantContext;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForActiveTenant() {
        UUID tenantId = tenantContext.requireTenantId();
        return taskRepository.findAllByTenantId(tenantId).stream()
                .map(this::toTaskResponse)
                .toList();
    }

    @Override
    public TaskResponse createTask(CreateTaskRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        Task task = new Task();
        task.setTenantId(tenantId);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(TaskStatus.fromString(request.status()));
        task.setPriority(TaskPriority.fromString(request.priority()));
        task.setTag(request.tag());
        task.setDate(request.date());
        task.setImageUrl(request.imageUrl());

        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        return toTaskResponse(saved);
    }

    @Override
    public TaskResponse updateTask(UUID id, UpdateTaskRequest request) {
        UUID tenantId = tenantContext.requireTenantId();
        Task task = taskRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.status() != null) {
            task.setStatus(TaskStatus.fromString(request.status()));
        }
        if (request.priority() != null) {
            task.setPriority(TaskPriority.fromString(request.priority()));
        }
        if (request.tag() != null) {
            task.setTag(request.tag());
        }
        if (request.date() != null) {
            task.setDate(request.date());
        }
        if (request.imageUrl() != null) {
            task.setImageUrl(request.imageUrl());
        }
        if (request.assigneeId() != null) {
            User assignee = userRepository.findById(request.assigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee user not found"));
            task.setAssignee(assignee);
        } else if (request.assigneeId() == null) {
            // Note: If request explicitly provides null, we might want to unassign
            task.setAssignee(null);
        }

        Task saved = taskRepository.save(task);
        return toTaskResponse(saved);
    }

    @Override
    public void deleteTask(UUID id) {
        UUID tenantId = tenantContext.requireTenantId();
        Task task = taskRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    @Override
    public CommentResponse addComment(UUID taskId, String text) {
        UUID tenantId = tenantContext.requireTenantId();
        Task task = taskRepository.findByIdAndTenantId(taskId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        User currentUser = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found"));

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(currentUser);
        comment.setText(text);

        TaskComment saved = taskCommentRepository.save(comment);
        return toCommentResponse(saved);
    }

    private TaskResponse toTaskResponse(Task task) {
        List<CommentResponse> commentResponses = task.getComments() != null
                ? task.getComments().stream().map(this::toCommentResponse).toList()
                : Collections.emptyList();

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name().toLowerCase(),
                task.getPriority() != null ? task.getPriority().name().toLowerCase() : null,
                task.getTag(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                commentResponses.size(),
                commentResponses,
                task.getImageUrl(),
                task.getDate()
        );
    }

    private CommentResponse toCommentResponse(TaskComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getAuthor().getFullName(),
                comment.getText(),
                comment.getCreatedAt()
        );
    }
}
