package com.tonilr.FinancialTracker.dto;

public class TransactionDTO {
    private Long id;
    private double amount;
    private String date;
    private String description;
    private String type;
    private String referenceId;
    private String registerDate;
    private Long accountId;
    
    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    
    public String getRegisterDate() { return registerDate; }
    public void setRegisterDate(String registerDate) { this.registerDate = registerDate; }
    
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
}