package com.financial_control.financial_control.infrastructure.persistence.user;

import com.financial_control.financial_control.domain.user.Role;
import com.financial_control.financial_control.domain.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Documento MongoDB para persistência da entidade User.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class UserDocument {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    private Role role;

    public static UserDocument from(User user) {
        return new UserDocument(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole()
        );
    }

    public User toDomain() {
        return new User(id, name, email, passwordHash, role);
    }
}
