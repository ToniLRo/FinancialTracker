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
import org.springframework.web.bind.annotation.RestController;

import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.dto.RegisterRequest;
import com.tonilr.FinancialTracker.dto.LoginRequest;



@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/user")
public class UsersController {

	@Autowired
	private final UsersServices userService;
	
	public UsersController(UsersServices userService) {
		this.userService = userService;
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
			Users user = userService.loginUser(request);
			Map<String, Object> response = new HashMap<>();
			response.put("message", "Login exitoso");
			response.put("userId", user.getUser_Id());
			response.put("username", user.getUsername());
			response.put("email", user.getEmail());
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
		}
	}
}
