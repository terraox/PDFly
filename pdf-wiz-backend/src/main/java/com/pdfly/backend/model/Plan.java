package com.pdfly.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Pro", "Enterprise"

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String billingCycle; // "MONTHLY", "YEARLY"

    @ElementCollection
    private List<String> features;

    private boolean active = true;
}
