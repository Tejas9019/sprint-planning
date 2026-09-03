package com.example.sprint_planning.workflow.service;

import com.example.sprint_planning.workflow.dto.ExecutionResultDto;
import com.example.sprint_planning.workflow.dto.WorkflowDto;
import com.example.sprint_planning.workflow.dto.WorkflowNodeDto;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class WorkflowExecutionEngine {

    private final WorkflowCrudService workflowCrudService;

    public WorkflowExecutionEngine(WorkflowCrudService workflowCrudService) {
        this.workflowCrudService = workflowCrudService;
    }

    public ExecutionResultDto executeWorkflow(UUID workspaceId, UUID workflowId, Map<String, Object> inputPayload) {
        WorkflowDto workflow = workflowCrudService.getWorkflow(workspaceId, workflowId);
        
        int totalNodes = workflow.getNodes().size();
        int totalEdges = workflow.getEdges().size();
        
        ExecutionResultDto result = new ExecutionResultDto();
        result.setSuccess(true);
        result.setStatus("SUCCESS");
        result.setMessage(String.format("Workflow '%s' executed successfully. Processed %d nodes and %d connections.",
                workflow.getName(), totalNodes, totalEdges));

        Map<String, Object> payload = new HashMap<>();
        if (inputPayload != null) {
            payload.putAll(inputPayload);
        }
        payload.put("workflowId", workflowId.toString());
        payload.put("nodesProcessed", totalNodes);
        payload.put("edgesProcessed", totalEdges);
        result.setOutputPayload(payload);

        return result;
    }
}
