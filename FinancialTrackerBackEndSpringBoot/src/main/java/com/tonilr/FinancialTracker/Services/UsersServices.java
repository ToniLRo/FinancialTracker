package com.tonilr.FinancialTracker.Services;

import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.tonilr.FinancialTracker.dto.ChangePasswordRequest;
import com.tonilr.FinancialTracker.dto.PasswordResetRequest;
import com.tonilr.FinancialTracker.dto.PasswordResetTokenRequest;
import com.tonilr.FinancialTracker.Services.EmailService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Service
public class UsersServices {

	@Autowired
	private final UsersRepo userRepo;
	
	@Autowired
	private final JwtService jwtService;
	
	@Autowired
	private final AuthenticationManager authenticationManager;
	
	@Autowired
	private JavaMailSender mailSender;
	
	@Autowired
	private EmailService emailService;
	
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
		
		// Verificar contraseña con validación estricta de mayúsculas/minúsculas
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new RuntimeException("Credenciales incorrectas. Verifica tu usuario y contraseña.");
		}
		
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
		
		return response;
	}

	public Map<String, Object> changePassword(String username, ChangePasswordRequest request) {
		// Buscar usuario
		Users user = userRepo.findByUsername(username)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		
		// Verificar contraseña actual con validación estricta
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
			throw new RuntimeException("La contraseña actual es incorrecta");
		}
		
		// Verificar que las nuevas contraseñas coincidan exactamente
		if (!request.getNewPassword().equals(request.getConfirmPassword())) {
			throw new RuntimeException("Las nuevas contraseñas no coinciden");
		}
		
		// Verificar que la nueva contraseña sea diferente
		if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
			throw new RuntimeException("La nueva contraseña debe ser diferente a la actual");
		}
		
		// Encriptar y guardar nueva contraseña
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		userRepo.save(user);
		
		Map<String, Object> response = new HashMap<>();
		response.put("message", "Contraseña actualizada exitosamente");
		return response;
	}

	public String generatePasswordResetToken(String email) {
		Users user = userRepo.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("No account found with this email address"));

		// Generar token JWT con expiración de 30 minutos
		return jwtService.generatePasswordResetToken(user.getEmail());
	}

	public void resetPasswordWithToken(PasswordResetTokenRequest request) {
		// Validar que las contraseñas coincidan
		if (!request.getNewPassword().equals(request.getConfirmPassword())) {
			throw new RuntimeException("Passwords do not match");
		}

		// Validar token JWT
		try {
			String email = jwtService.extractEmailFromResetToken(request.getToken());
			
			Users user = userRepo.findByEmail(email)
					.orElseThrow(() -> new RuntimeException("Invalid or expired token"));

			// Encriptar y actualizar contraseña
			String encodedPassword = passwordEncoder.encode(request.getNewPassword());
			user.setPassword(encodedPassword);
			userRepo.save(user);
			
		} catch (Exception e) {
			throw new RuntimeException("Invalid or expired token");
		}
	}

	public void sendPasswordResetEmail(String email) {
	    Users user = userRepo.findByEmail(email)
	        .orElseThrow(() -> new RuntimeException("No existe usuario con ese email"));

	    // Generar el token JWT como ya tienes
	    String token = Jwts.builder()
	        .setSubject(user.getEmail())
	        .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 minutos
	        .signWith(SignatureAlgorithm.HS256, "claveSecretaParaReset".getBytes())
	        .compact();

	    String resetLink = "http://localhost:4200/forgot-password?token=" + token;

	    // Crear y enviar el email
	    SimpleMailMessage message = new SimpleMailMessage();
	    message.setTo(user.getEmail());
	    message.setSubject("Recuperación de contraseña");
	    message.setText("Haz clic en el siguiente enlace para restablecer tu contraseña:\n" + resetLink);

	    mailSender.send(message);
	}
}
