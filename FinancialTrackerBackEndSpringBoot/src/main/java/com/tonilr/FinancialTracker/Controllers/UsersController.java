package com.tonilr.FinancialTracker.Controllers;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.dto.RegisterRequest;
import com.tonilr.FinancialTracker.dto.LoginRequest;
import com.tonilr.FinancialTracker.Services.JwtService;



@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/user")
public class UsersController {

	@Autowired
	private final UsersServices userService;
	
	@Autowired
	private final JwtService jwtService;
	
	public UsersController(UsersServices userService, JwtService jwtService) {
		this.userService = userService;
		this.jwtService = jwtService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<Users>> getAllUsers() {
		List<Users> users = userService.findAllUsers();
		return new ResponseEntity<>(users, HttpStatus.OK);
	}

	@GetMapping("/find/{id}")
	public ResponseEntity<Users> getUserById(@PathVariable("id") Long id) {
		Users user = userService.findUserById(id);
		return new ResponseEntity<>(user, HttpStatus.OK);
	}

	@PostMapping("/add")
	public ResponseEntity<Users> addUser(@RequestBody RegisterRequest request) {
		Users newUser = userService.addUser(request);
		return new ResponseEntity<>(newUser, HttpStatus.CREATED);
	}

	@PutMapping("/update")
	public ResponseEntity<Users> updateUser(@RequestBody Users user) {
		Users updateUser = userService.updateUser(user);
		return new ResponseEntity<>(updateUser, HttpStatus.OK);
	}
	


	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
		userService.deleteUser(id);
		return new ResponseEntity<>(HttpStatus.OK);
	}

	@PostMapping("/login")
	public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
		try {
			Map<String, Object> response = userService.loginUser(request);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
		}
	}

	@GetMapping("/profile")
	public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String token) {
		try {
			// Extraer userId del token JWT
			String jwt = token.substring(7); // Remover "Bearer "
			Long userId = jwtService.extractUserId(jwt);

			Users user = userService.findUserById(userId);

			Map<String, Object> profile = new HashMap<>();
			profile.put("userId", user.getUser_Id());
			profile.put("username", user.getUsername());
			profile.put("registerDate", user.getRegisterDate() != null ? user.getRegisterDate().toString() : null);
			
			return new ResponseEntity<>(profile, HttpStatus.OK);
		} catch (Exception e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", "Error al obtener perfil: " + e.getMessage());
			return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
