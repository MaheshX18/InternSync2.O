package com.internsync.repository;

import com.internsync.model.Role;
import com.internsync.model.User;
import com.internsync.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    long countByRole(Role role);

    long countByStatus(UserStatus status);

    List<User> findTop5ByOrderByCreatedAtDesc();

    Page<User> findByRole(Role role, Pageable pageable);

    List<User> findByRole(Role role);

    Page<User> findByStatus(UserStatus status, Pageable pageable);

    Page<User> findByRoleAndStatus(Role role, UserStatus status, Pageable pageable);
}
