package com.tonilr.FinancialTracker.dto;

import java.sql.Date;
import com.tonilr.FinancialTracker.Entities.AccountType;

public class AccountDTO {
    private Long account_Id;
    private String holder_name;
    private String account_number;
    private AccountType account_type;
    private double balance;
    private String currency;
    private Date creation_date;
    private String good_thru;
    private Long userId;

    public AccountDTO() {}

    public AccountDTO(Long account_Id, String holder_name, String account_number, 
                     AccountType account_type, double balance, String currency, 
                     Date creation_date, String good_thru, Long userId) {
        this.account_Id = account_Id;
        this.holder_name = holder_name;
        this.account_number = account_number;
        this.account_type = account_type;
        this.balance = balance;
        this.currency = currency;
        this.creation_date = creation_date;
        this.good_thru = good_thru;
        this.userId = userId;
    }
    
    public Long getAccount_Id() { return account_Id; }
    public void setAccount_Id(Long account_Id) { this.account_Id = account_Id; }
    
    public String getHolder_name() { return holder_name; }
    public void setHolder_name(String holder_name) { this.holder_name = holder_name; }
    
    public String getAccount_number() { return account_number; }
    public void setAccount_number(String account_number) { this.account_number = account_number; }
    
    public AccountType getAccount_type() { return account_type; }
    public void setAccount_type(AccountType account_type) { this.account_type = account_type; }
    
    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Date getCreation_date() { return creation_date; }
    public void setCreation_date(Date creation_date) { this.creation_date = creation_date; }
    
    public String getGood_thru() { return good_thru; }
    public void setGood_thru(String good_thru) { this.good_thru = good_thru; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
