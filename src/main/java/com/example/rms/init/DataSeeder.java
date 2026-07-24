package com.example.rms.init;

import com.example.rms.entity.AppUser;
import com.example.rms.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if admin user already exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            System.out.println("Seeding default users...");
            
            userRepository.save(new AppUser("admin", passwordEncoder.encode("Admin@123"), "Admin"));
            userRepository.save(new AppUser("manager", passwordEncoder.encode("Manager@123"), "Manager"));
            userRepository.save(new AppUser("viewer", passwordEncoder.encode("Viewer@123"), "Viewer"));
            
            System.out.println("Default users created successfully.");
        } else {
            System.out.println("Default users already exist. Skipping seeding.");
        }
    }
}
