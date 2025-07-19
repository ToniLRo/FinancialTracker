package com.tonilr.FinancialTracker.Entities;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Account")
public class Account {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(nullable = false, updatable = false)
	private Long account_Id;
	
	@Column(nullable = false, updatable = true)
	private String holder_name;

	@Column(nullable = false, updatable = true)
	private String account_number;
	
	@Column(nullable = false, updatable = true)
	private AccountType account_type;
	
	@Column(nullable = false, updatable = true)
	private double balance;
	
	@Column(nullable = false, updatable = true)
	private String currency;
	
	@Column(nullable = false, updatable = true)
	private Date creation_date;
	
	// NUEVO: Campo para fecha de vencimiento (MM/YY)
	@Column(nullable = true, updatable = true, length = 5)
	private String good_thru;
	
	@JsonIgnore
	@OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private Set<Transaction> transactions = new HashSet<Transaction>();

	public Account() {
	}

	public Account(String holder_name, String account_number, AccountType account_type, double balance, 
			String currency, Date creation_date, String good_thru) {
		super();
		this.holder_name = holder_name;
		this.account_number = account_number;
		this.account_type = account_type;
		this.balance = balance;
		this.currency = currency;
		this.creation_date = creation_date;
		this.good_thru = good_thru;
	}

	// Getters y setters existentes...
	public Long getAccount_Id() {
		return account_Id;
	}

	public void setAccount_Id(Long account_Id) {
		this.account_Id = account_Id;
	}

	public String getHolder_name() {
		return holder_name;
	}

	public void setHolder_name(String holder_name) {
		this.holder_name = holder_name;
	}

	public String getAccount_number() {
		return account_number;
	}

	public void setAccount_number(String account_number) {
		this.account_number = account_number;
	}

	public AccountType getAccount_type() {
		return account_type;
	}

	public void setAccount_type(AccountType account_type) {
		this.account_type = account_type;
	}

	public double getBalance() {
		return balance;
	}

	public void setBalance(double balance) {
		this.balance = balance;
	}
	
	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public Date getCreation_date() {
		return creation_date;
	}

	public void setCreation_date(Date creation_date) {
		this.creation_date = creation_date;
	}

	// NUEVO: Getter y setter para good_thru
	public String getGood_thru() {
		return good_thru;
	}

	public void setGood_thru(String good_thru) {
		this.good_thru = good_thru;
	}

	// Getter y setter para transactions
	public Set<Transaction> getTransactions() { return transactions; }
	public void setTransactions(Set<Transaction> transactions) { this.transactions = transactions; }
}
