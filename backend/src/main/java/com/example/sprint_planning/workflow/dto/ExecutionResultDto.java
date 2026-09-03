package com.example.sprint_planning.workflow.dto;

import java.util.HashMap;
import java.util.Map;

public class ExecutionResultDto {
    private boolean success;
    private String status;
    private String message;
    private Map<String, Object> outputPayload = new HashMap<>();

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getOutputPayload() { return outputPayload; }
    public void setOutputPayload(Map<String, Object> outputPayload) { this.outputPayload = outputPayload; }
}
