package com.example.sprint_planning.note.model;

public class ChecklistItem {
    private String id;
    private String text;
    private boolean done;

    public ChecklistItem() {
    }

    public ChecklistItem(String id, String text, boolean done) {
        this.id = id;
        this.text = text;
        this.done = done;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }
}
