package com.tonilr.FinancialTracker.Controllers;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import org.owasp.encoder.Encode;
import com.tonilr.FinancialTracker.Entities.Users;
import com.tonilr.FinancialTracker.Services.UsersServices;
import com.tonilr.FinancialTracker.dto.RegisterRequest;
import com.tonilr.FinancialTracker.dto.UserSettingsDTO;
import com.tonilr.FinancialTracker.dto.LoginRequest;
import com.tonilr.FinancialTracker.Services.JwtService;
import com.tonilr.FinancialTracker.dto.ChangePasswordRequest;
import com.tonilr.FinancialTracker.dto.PasswordResetRequest;
import com.tonilr.FinancialTracker.dto.PasswordResetTokenRequest;
import com.tonilr.FinancialTracker.Services.EmailService;
import com.tonilr.FinancialTracker.Entities.UserSettings;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


@RestController
@RequestMapping("/user")
@Validated
public class UsersController {

	private static final Logger log = LoggerFactory.getLogger(UsersController.class);

	@Autowired
	private final UsersServices userService;
	
	@Autowired
	private final JwtService jwtService;
	
	@Autowired
	private final EmailService emailService;
	
	public UsersController(UsersServices userService, JwtService jwtService, EmailService emailService) {
		this.userService = userService;
		this.jwtService = jwtService;
		this.emailService = emailService;
	}

	@GetMapping("/all")
	public ResponseEntity<List<Users>> getAllUsers() {
		List<Users> users = userService.findAllUsers();
		return new ResponseEntity<>(users, HttpStatus.OK);
	}

	@GetMapping("/find/{id}")
	public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
		try {
			Users user = userService.findUserById(id);
			UserSettingsDTO settingsDTO = null;
			
			if (user.getUserSettings() != null) {
				settingsDTO = new UserSettingsDTO();
				settingsDTO.setSettings_id(user.getUserSettings().getSettings_id());
				settingsDTO.setUserId(user.getUser_Id());
				settingsDTO.setEmailNotificationsEnabled(user.getUserSettings().isEmailNotificationsEnabled());
				settingsDTO.setWeeklyReportEnabled(user.getUserSettings().isWeeklyReportEnabled());
				settingsDTO.setMonthlyReportEnabled(user.getUserSettings().isMonthlyReportEnabled());
				settingsDTO.setEmailAddress(user.getUserSettings().getEmailAddress());
			}

			Map<String, Object> response = new HashMap<>();
			response.put("user_Id", user.getUser_Id());
			response.put("username", user.getUsername());
			response.put("email", user.getEmail());
			response.put("register_date", user.getRegisterDate());
			response.put("settings", settingsDTO);

			return ResponseEntity.ok(response);
		} catch (Exception e) {
			return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping("/add")
	public ResponseEntity<?> addUser(@Valid @RequestBody RegisterRequest request) {
		try {
			log.info("Iniciando registro de usuario. Request recibido: {}", request.getUsername());
			
			// Sanitizar inputs
			String sanitizedUsername = Encode.forHtml(request.getUsername());
			log.info("Username después de sanitizar: {}", sanitizedUsername);
			
			// Verificar existencia
			boolean exists = userService.existsByUsername(sanitizedUsername);
			log.info("¿Usuario existe?: {}", exists);
			
			if (exists) {
				return ResponseEntity
					.badRequest()
					.body("Username already exists");
			}

			// Continuar con el registro...
			log.info("Recibida solicitud de registro para usuario: {}", request.getUsername());
			
			// Sanitizar inputs
			String sanitizedEmail = Encode.forHtml(request.getEmail());
			
			// Crear request sanitizado
			RegisterRequest sanitizedRequest = new RegisterRequest();
			sanitizedRequest.setUsername(sanitizedUsername);
			sanitizedRequest.setEmail(sanitizedEmail);
			sanitizedRequest.setPassword(request.getPassword());
			
			// Crear usuario
			log.info("Creando nuevo usuario");
			Users newUser = userService.addUser(sanitizedRequest);
			log.info("Usuario creado exitosamente con ID: {}", newUser.getUser_Id());
			
			return ResponseEntity.ok("User registered successfully");
			
		} catch (Exception e) {
			log.error("Error durante el registro de usuario", e);
			return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Error during registration: " + e.getMessage());
		}
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

	@PostMapping("/change-password")
	public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token, 
										   @RequestBody ChangePasswordRequest request) {
		try {
			String jwt = token.substring(7);
			String username = jwtService.extractUsername(jwt);
			
			Map<String, Object> response = userService.changePassword(username, request);
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestBody PasswordResetRequest request) {
		try {
			String resetToken = userService.generatePasswordResetToken(request.getEmail());
			emailService.sendPasswordResetEmail(request.getEmail(), resetToken);
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "Password reset instructions have been sent to your email");
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody PasswordResetTokenRequest request) {
		try {
			userService.resetPasswordWithToken(request);
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "Password has been reset successfully");
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (RuntimeException e) {
			Map<String, String> error = new HashMap<>();
			error.put("message", e.getMessage());
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
	}

	@PutMapping("/{userId}/settings")
	public ResponseEntity<?> updateUserSettings(@PathVariable Long userId, @RequestBody UserSettings settings) {
    log.debug("⚡ Recibida petición de actualización de settings para usuario {}", userId);
    log.debug("📝 Settings recibidos: {}", settings);
    
    try {
        // Verificar que el usuario existe
        Users user = userService.findUserById(userId);
        log.debug("👤 Usuario encontrado: {}", user.getUsername());
        
        // Actualizar settings
        userService.updateUserSettings(userId, settings);
        log.debug("✅ Settings actualizados correctamente");
        
        return ResponseEntity.ok().build();
    } catch (Exception e) {
        log.error("❌ Error actualizando settings: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
}

	@GetMapping("/{userId}/settings")
	public ResponseEntity<?> getUserSettings(@PathVariable Long userId) {
		try {
			// Verificar que el usuario autenticado solo pueda ver sus propios settings
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String username = authentication.getName();
			Users authenticatedUser = userService.findUserByUsername(username);
			
			if (!authenticatedUser.getUser_Id().equals(userId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permiso para ver estos settings");
			}

			UserSettings settings = userService.getUserSettings(userId);
			if (settings == null) {
				// Si no existen settings, devolver unos por defecto
				UserSettingsDTO defaultSettings = new UserSettingsDTO();
				defaultSettings.setUserId(userId);
				defaultSettings.setEmailNotificationsEnabled(false);
				defaultSettings.setWeeklyReportEnabled(false);
				defaultSettings.setMonthlyReportEnabled(false);
				return ResponseEntity.ok(defaultSettings);
			}

			// Convertir a DTO
			UserSettingsDTO settingsDTO = new UserSettingsDTO();
			settingsDTO.setSettings_id(settings.getSettings_id());
			settingsDTO.setUserId(userId);
			settingsDTO.setEmailNotificationsEnabled(settings.isEmailNotificationsEnabled());
			settingsDTO.setWeeklyReportEnabled(settings.isWeeklyReportEnabled());
			settingsDTO.setMonthlyReportEnabled(settings.isMonthlyReportEnabled());
			settingsDTO.setEmailAddress(settings.getEmailAddress());

			return ResponseEntity.ok(settingsDTO);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body("Error al obtener los settings: " + e.getMessage());
		}
	}
}
