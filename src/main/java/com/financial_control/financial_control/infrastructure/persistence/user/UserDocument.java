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

    @Indexed(sparse = true)
    private String googleId;

    private Role role;

    public static UserDocument from(User user) {
        UserDocument doc = new UserDocument();
        doc.id           = user.getId();
        doc.name         = user.getName();
        doc.email        = user.getEmail();
        doc.passwordHash = user.getPasswordHash();
        doc.googleId     = user.getGoogleId();
        doc.role         = user.getRole();
        return doc;
    }

    public User toDomain() {
        return new User(id, name, email, passwordHash, googleId, role);
    }
}
