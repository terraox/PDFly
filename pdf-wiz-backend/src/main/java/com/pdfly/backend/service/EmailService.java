// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/service/EmailService.java
package com.pdfly.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendWelcomeEmail(String toEmail, String generatedPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setSubject("🔑 Your Secure Access Key to PDFly");
        message.setTo(toEmail);
        
        String body = String.format(
            "Welcome to the elite circle, %s!\n\n" +
            "Your access to PDFly is ready. We have generated a unique, secure access key for you. " +
            "Please use the following confidential credentials to sign in:\n\n" +
            "Email: %s\n" +
            "Access Key (Password): %s\n\n" +
            "--- \n" +
            "Please sign in here: http://localhost:5173/login\n\n" +
            "Your privacy and security are our top priority. We recommend keeping this key private.\n\n" +
            "Sincerely,\nThe PDFly Security Team",
            toEmail, toEmail, generatedPassword
        );
        
        message.setText(body);
        mailSender.send(message);
    }
    
    public void sendResetPhrase(String toEmail, String phrase) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setSubject("⚠️ Time-Sensitive Password Reset Code");
        message.setTo(toEmail);

        String body = String.format(
            "We received a request to reset the password for your PDFly account (%s).\n\n" +
            "Your 6-Digit Verification Code (Phrase) is:\n\n" +
            "  >>> %s <<<\n\n" +
            "This code is valid for 15 minutes. Do not share this code with anyone.\n" +
            "If you did not request this, you can safely ignore this email.\n\n" +
            "The PDFly Security Team",
            toEmail, phrase
        );

        message.setText(body);
        mailSender.send(message);
    }
}