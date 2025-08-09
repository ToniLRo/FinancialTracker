package com.tonilr.FinancialTracker.Entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Category")
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(nullable = false, updatable = false)
	private Long category_Id;
	@Column(nullable = false, updatable = true)
	private String category_name;
	@Column(nullable = false, updatable = true)
	private String description;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_Id",nullable = true)
    private Users user;

    
	public Category() {
	}

	public Category(String category_name, String description) {
		super();
		this.category_name = category_name;
		this.description = description;
	}

	public Long getCategory_Id() {
		return category_Id;
	}

	public void setCategory_Id(Long category_Id) {
		this.category_Id = category_Id;
	}

	public String getCategoryName() {
		return category_name;
	}

	public void setCategoryName(String category_name) {
		this.category_name = category_name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}
}
