package com.tonilr.FinancialTracker.Services;

import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.dto.RegisterRequest;
import com.tonilr.FinancialTracker.dto.LoginRequest;
import com.tonilr.FinancialTracker.exceptions.UserNotFoundException;
import com.tonilr.FinancialTracker.repos.UsersRepo;
import com.tonilr.FinancialTracker.Services.JwtService;

@Service
public class UsersServices {

	@Autowired
	private final UsersRepo userRepo;
	
	@Autowired
	private final JwtService jwtService;
	
	@Autowired
	private final AuthenticationManager authenticationManager;
	
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public UsersServices(UsersRepo userRepo, JwtService jwtService, AuthenticationManager authenticationManager) {
		this.userRepo = userRepo;
		this.jwtService = jwtService;
		this.authenticationManager = authenticationManager;
	}

	public Users addUser(RegisterRequest request) {
		// Validar que el email no exista
		if (userRepo.existsByEmail(request.getEmail())) {
			throw new RuntimeException("El email ya está registrado");
		}
		
		// Validar que el username no exista
		if (userRepo.existsByUsername(request.getUsername())) {
			throw new RuntimeException("El nombre de usuario ya está en uso");
		}
		
		// Crear nuevo usuario
		Users newUser = new Users();
		newUser.setUsername(request.getUsername());
		newUser.setEmail(request.getEmail());
		newUser.setPassword(passwordEncoder.encode(request.getPassword())); // Encriptar contraseña
		newUser.setRegisterDate(new Date(System.currentTimeMillis()));
		
		return userRepo.save(newUser);
	}

	public List<Users> findAllUsers() {
		return userRepo.findAll();
	}

	public Users updateUser(Users usuario) {
		return userRepo.save(usuario);
	}

	public Users findUserById(Long id) {
		return userRepo.findById(id)
				.orElseThrow(() -> new UserNotFoundException("User by id " + id + " was not found"));
	}

	public void deleteUser(Long id) {
		userRepo.deleteById(id);
	}

	public Map<String, Object> loginUser(LoginRequest request) {
		// Autenticar usando Spring Security
		authenticationManager.authenticate(
			new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
		);
		
		// Buscar usuario por username
		Users user = userRepo.findByUsername(request.getUsername())
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		
		// Generar token JWT
		UserDetails userDetails = new org.springframework.security.core.userdetails.User(
			user.getUsername(), 
			user.getPassword(), 
			java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("USER"))
		);
		
		String jwtToken = jwtService.generateToken(userDetails);
		
		// Crear respuesta
		Map<String, Object> response = new HashMap<>();
		response.put("token", jwtToken);
		response.put("userId", user.getUser_Id());
		response.put("username", user.getUsername());
		response.put("email", user.getEmail());
		response.put("registerDate", user.getRegisterDate() != null ? user.getRegisterDate().toString() : null);
		response.put("message", "Login exitoso");
		
		System.out.println("Login response: " + response); // Debug
		return response;
	}
}
