package com.example.rms.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private String role;
    private String token;
    
    public LoginResponse(boolean success, String message, String role, String token) {
        this.success = success;
        this.message = message;
        this.role = role;
        this.token = token;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
