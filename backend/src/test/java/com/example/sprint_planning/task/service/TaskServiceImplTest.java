package com.example.sprint_planning.task.service;

import com.example.sprint_planning.common.exception.ResourceNotFoundException;
import com.example.sprint_planning.security.AuthenticatedUser;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskCommentRepository taskCommentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantContext tenantContext;

    @InjectMocks
    private TaskServiceImpl taskService;

    private UUID tenantId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        userId = UUID.randomUUID();

        // Configure mock tenant context
        lenient().when(tenantContext.requireTenantId()).thenReturn(tenantId);

        // Configure mock security context
        AuthenticatedUser principal = new AuthenticatedUser(userId, "user@example.com", tenantId);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getTasksForActiveTenant_returnsList() {
        Task task = new Task();
        task.setId(UUID.randomUUID());
        task.setTenantId(tenantId);
        task.setTitle("Test Task");
        task.setStatus(TaskStatus.TODO);

        when(taskRepository.findAllByTenantId(tenantId)).thenReturn(List.of(task));

        List<TaskResponse> responses = taskService.getTasksForActiveTenant();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Test Task", responses.get(0).title());
        verify(taskRepository).findAllByTenantId(tenantId);
    }

    @Test
    void createTask_savesAndReturnsTask() {
        CreateTaskRequest request = new CreateTaskRequest(
                "New Task",
                "Task Desc",
                "todo",
                "high",
                "Dev",
                null,
                LocalDate.now(),
                null
        );

        Task savedTask = new Task();
        savedTask.setId(UUID.randomUUID());
        savedTask.setTenantId(tenantId);
        savedTask.setTitle("New Task");
        savedTask.setDescription("Task Desc");
        savedTask.setStatus(TaskStatus.TODO);
        savedTask.setPriority(TaskPriority.HIGH);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        TaskResponse response = taskService.createTask(request);

        assertNotNull(response);
        assertEquals("New Task", response.title());
        assertEquals("todo", response.status());
        assertEquals("high", response.priority());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void updateTask_updatesFields() {
        UUID taskId = UUID.randomUUID();
        Task existingTask = new Task();
        existingTask.setId(taskId);
        existingTask.setTenantId(tenantId);
        existingTask.setTitle("Old Title");
        existingTask.setStatus(TaskStatus.TODO);

        UpdateTaskRequest request = new UpdateTaskRequest(
                "Updated Title",
                "New Description",
                "doing",
                "low",
                "Design",
                null,
                null,
                null
        );

        when(taskRepository.findByIdAndTenantId(taskId, tenantId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskResponse response = taskService.updateTask(taskId, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.title());
        assertEquals("doing", response.status());
        assertEquals("low", response.priority());
        assertEquals("Design", response.tag());
    }

    @Test
    void updateTask_throwsNotFound_whenNonExistent() {
        UUID taskId = UUID.randomUUID();
        when(taskRepository.findByIdAndTenantId(taskId, tenantId)).thenReturn(Optional.empty());

        UpdateTaskRequest request = new UpdateTaskRequest("title", null, null, null, null, null, null, null);

        assertThrows(ResourceNotFoundException.class, () -> taskService.updateTask(taskId, request));
    }

    @Test
    void deleteTask_removesTask() {
        UUID taskId = UUID.randomUUID();
        Task existingTask = new Task();
        existingTask.setId(taskId);
        existingTask.setTenantId(tenantId);

        when(taskRepository.findByIdAndTenantId(taskId, tenantId)).thenReturn(Optional.of(existingTask));

        taskService.deleteTask(taskId);

        verify(taskRepository).delete(existingTask);
    }

    @Test
    void addComment_savesComment() {
        UUID taskId = UUID.randomUUID();
        Task task = new Task();
        task.setId(taskId);
        task.setTenantId(tenantId);

        User user = new User();
        user.setId(userId);
        user.setFirstName("Jane");
        user.setLastName("Doe");

        TaskComment comment = new TaskComment();
        comment.setId(UUID.randomUUID());
        comment.setTask(task);
        comment.setAuthor(user);
        comment.setText("Test Comment");

        when(taskRepository.findByIdAndTenantId(taskId, tenantId)).thenReturn(Optional.of(task));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(taskCommentRepository.save(any(TaskComment.class))).thenReturn(comment);

        CommentResponse response = taskService.addComment(taskId, "Test Comment");

        assertNotNull(response);
        assertEquals("Test Comment", response.text());
        assertEquals("Jane Doe", response.author());
        verify(taskCommentRepository).save(any(TaskComment.class));
    }
}
