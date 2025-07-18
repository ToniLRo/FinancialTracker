package com.tonilr.FinancialTracker.Entities;

import java.sql.Date;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Transaction")
public class Transaction {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(nullable = false, updatable = false)
	private Long transaction_Id;
	
	@Column(nullable = false, updatable = true)
	private double amount;
	
	@Column(nullable = false, updatable = true)
	private Date date;
	
	@Column(nullable = false, updatable = true)
	private String description;
	
	@Column(nullable = false, updatable = true)
	private Date register_date;
	
	@Column(nullable = true, updatable = true)
	private String type;
	
	@Column(nullable = true, updatable = true)
	private String referenceId;
	
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_Id", nullable = true)
    private Users user;

    // RELACIÓN: Many-to-One con Account
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_Id", nullable = false)
    private Account account;
	
	public Transaction() {
	}

	public Transaction(double amount, Date date, String description, Date register_date, Account account) {
		super();
		this.amount = amount;
		this.date = date;
		this.description = description;
		this.register_date = register_date;
		this.account = account;
	}

	public Transaction(double amount, Date date, String description, Date register_date, String type, String referenceId, Account account) {
		super();
		this.amount = amount;
		this.date = date;
		this.description = description;
		this.register_date = register_date;
		this.type = type;
		this.referenceId = referenceId;
		this.account = account;
	}

	// Getters y setters existentes...
	public Long getTransaction_Id() {
		return transaction_Id;
	}

	public void setTransaction_Id(Long transaction_Id) {
		this.transaction_Id = transaction_Id;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	public Date getRegisterDate() {
		return register_date;
	}

	public void setRegisterDate(Date register_date) {
		this.register_date = register_date;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getReferenceId() {
		return referenceId;
	}

	public void setReferenceId(String referenceId) {
		this.referenceId = referenceId;
	}

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}

	// Getter y setter para Account
	public Account getAccount() {
		return account;
	}

	public void setAccount(Account account) {
		this.account = account;
	}
}
