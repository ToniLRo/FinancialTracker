package com.tonilr.FinancialTracker.dto;

public class UserSummaryDTO {
	private Long id;
	private String username;
	private String email;
	private String registerDate;

	public UserSummaryDTO() {}

	public UserSummaryDTO(Long id, String username, String email, String registerDate) {
		this.id = id;
		this.username = username;
		this.email = email;
		this.registerDate = registerDate;
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getRegisterDate() { return registerDate; }
	public void setRegisterDate(String registerDate) { this.registerDate = registerDate; }
}


