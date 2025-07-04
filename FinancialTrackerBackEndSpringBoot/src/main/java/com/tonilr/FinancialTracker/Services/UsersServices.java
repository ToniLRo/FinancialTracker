package com.tonilr.FinancialTracker.Services;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.dto.RegisterRequest;
import com.tonilr.FinancialTracker.exceptions.UserNotFoundException;
import com.tonilr.FinancialTracker.repos.UsersRepo;

@Service
public class UsersServices {

	@Autowired
	private final UsersRepo userRepo;
	
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public UsersServices(UsersRepo userRepo) {
		this.userRepo = userRepo;
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
}
