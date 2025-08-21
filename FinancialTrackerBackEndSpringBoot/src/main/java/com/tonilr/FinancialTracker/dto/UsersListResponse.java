package com.tonilr.FinancialTracker.dto;

import java.util.List;

public class UsersListResponse {
	private int totalUsers;
	private List<UserSummaryDTO> users;
	private String message;

	public UsersListResponse() {}

	public UsersListResponse(int totalUsers, List<UserSummaryDTO> users, String message) {
		this.totalUsers = totalUsers;
		this.users = users;
		this.message = message;
	}

	public int getTotalUsers() { return totalUsers; }
	public void setTotalUsers(int totalUsers) { this.totalUsers = totalUsers; }

	public List<UserSummaryDTO> getUsers() { return users; }
	public void setUsers(List<UserSummaryDTO> users) { this.users = users; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }
}


