package com.tonilr.FinancialTracker.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.dto.UserSummaryDTO;
import com.tonilr.FinancialTracker.dto.UsersListResponse;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@Profile({"dev", "local"})
@RequestMapping("/api/test")
public class TestController {

	private static final Logger logger = LoggerFactory.getLogger(TestController.class);

	private final UsersServices usersServices;

	public TestController(UsersServices usersServices) {
		this.usersServices = usersServices;
	}

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
	public ResponseEntity<UsersListResponse> getUsers() {
		try {
			logger.info("Solicitando lista de usuarios de prueba");
			List<Users> users = usersServices.findAllUsers();
			List<UserSummaryDTO> userDtos = users.stream()
				.map(user -> new UserSummaryDTO(
					user.getUser_Id(),
					user.getUsername(),
					user.getEmail(),
					user.getRegisterDate() != null ? user.getRegisterDate().toString() : null
				))
				.toList();
			UsersListResponse response = new UsersListResponse(userDtos.size(), userDtos, "Usuarios obtenidos correctamente");
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error obteniendo usuarios en TestController", e);
			return ResponseEntity.badRequest().build();
		}
	}
}
