package com.tonilr.FinancialTracker.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.Entities.Users;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

	@Autowired
	private UsersServices usersServices;

	@GetMapping("/ping")
	public ResponseEntity<Map<String, Object>> ping() {
		Map<String, Object> response = new HashMap<>();
		response.put("message", "pong");
		response.put("timestamp", System.currentTimeMillis());
		response.put("status", "OK");
		return ResponseEntity.ok(response);
	}

	@GetMapping("/status")
	public ResponseEntity<Map<String, Object>> status() {
		Map<String, Object> response = new HashMap<>();
		response.put("active", true);
		response.put("isProduction", false);
		response.put("message", "Test endpoint funcionando");
		response.put("timestamp", System.currentTimeMillis());
		return ResponseEntity.ok(response);
	}

	@GetMapping("/users")
	public ResponseEntity<Map<String, Object>> getUsers() {
		try {
			List<Users> users = usersServices.findAllUsers();
			Map<String, Object> response = new HashMap<>();
			response.put("totalUsers", users.size());
			response.put("users", users.stream().map(user -> {
				Map<String, Object> userInfo = new HashMap<>();
				userInfo.put("id", user.getUser_Id());
				userInfo.put("username", user.getUsername());
				userInfo.put("email", user.getEmail());
				userInfo.put("registerDate", user.getRegisterDate());
				return userInfo;
			}).toList());
			response.put("message", "Usuarios obtenidos correctamente");
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("error", "Error obteniendo usuarios: " + e.getMessage());
			return ResponseEntity.badRequest().body(errorResponse);
		}
	}
}
