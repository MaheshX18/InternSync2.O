package com.internsync.service;

import com.internsync.dto.request.LoginRequest;
import com.internsync.dto.request.RefreshTokenRequest;
import com.internsync.dto.request.RegisterRequest;
import com.internsync.dto.response.AuthResponse;
import com.internsync.exception.EmailAlreadyExistsException;
import com.internsync.exception.TokenRefreshException;
import com.internsync.model.RefreshToken;
import com.internsync.model.Role;
import com.internsync.model.User;
import com.internsync.repository.UserRepository;
import com.internsync.security.CustomUserDetails;
import com.internsync.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.admin.secret-key:InternSyncAdminMasterKey2026}")
    private String adminSecretKey;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Error: Email '" + request.getEmail() + "' is already in use.");
        }

        // Security check for ADMIN registration
        if (request.getRole() == Role.ADMIN) {
            if (request.getAdminSecretKey() == null || !request.getAdminSecretKey().equals(adminSecretKey)) {
                throw new IllegalArgumentException("Error: Invalid or missing admin security key required for ADMIN role creation.");
            }
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName(),
                request.getRole()
        );

        user.setPhone(request.getPhone());
        user.setInstitutionId(request.getInstitutionId());
        user.setDepartment(request.getDepartment());
        user.setRollNumber(request.getRollNumber());
        user.setBatch(request.getBatch());
        user.setCompanyId(request.getCompanyId());

        User savedUser = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String accessToken = jwtUtils.generateAccessToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                jwtUtils.getJwtExpirationMs(),
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String accessToken = jwtUtils.generateAccessToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                jwtUtils.getJwtExpirationMs(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getUser().getRole()
        );
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUserId)
                .map(userId -> userRepository.findById(userId)
                        .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "User not found for given refresh token")))
                .map(user -> {
                    // Refresh token rotation: Revoke old refresh token, generate new one
                    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    String newAccessToken = jwtUtils.generateAccessTokenFromEmail(
                            user.getEmail(),
                            user.getId(),
                            user.getRole().name()
                    );

                    return new AuthResponse(
                            newAccessToken,
                            newRefreshToken.getToken(),
                            jwtUtils.getJwtExpirationMs(),
                            user.getId(),
                            user.getEmail(),
                            user.getRole()
                    );
                })
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "Refresh token is not in database"));
    }

    public void logout(String userId) {
        refreshTokenService.deleteByUserId(userId);
    }

    public void logoutByToken(String refreshToken) {
        refreshTokenService.deleteByToken(refreshToken);
    }
}
