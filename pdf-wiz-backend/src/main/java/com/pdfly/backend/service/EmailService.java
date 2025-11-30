// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/service/EmailService.java
package com.pdfly.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendWelcomeEmail(String toEmail, String generatedPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setSubject("🔑 Your Secure Access Key to PDFly");
            helper.setTo(toEmail);

            String htmlBody = String.format(
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "<style>" +
                            "body { font-family: 'Inter', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }"
                            +
                            ".container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }"
                            +
                            ".header { background: #18181b; padding: 32px; text-align: center; }" +
                            ".logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em; }" +
                            ".logo span { color: #6366f1; }" +
                            ".content { padding: 40px 32px; color: #3f3f46; line-height: 1.6; }" +
                            ".h1 { font-size: 24px; font-weight: 700; color: #18181b; margin-bottom: 16px; }" +
                            ".card { background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin: 24px 0; }"
                            +
                            ".label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; font-weight: 600; margin-bottom: 4px; }"
                            +
                            ".value { font-size: 16px; font-family: 'Monaco', monospace; color: #18181b; font-weight: 500; word-break: break-all; }"
                            +
                            ".button { display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px; }"
                            +
                            ".footer { background: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }"
                            +
                            "</style>" +
                            "</head>" +
                            "<body>" +
                            "<div class='container'>" +
                            "<div class='header'>" +
                            "<div class='logo'>PDF<span>ly</span></div>" +
                            "</div>" +
                            "<div class='content'>" +
                            "<div class='h1'>Welcome to the elite circle! 🚀</div>" +
                            "<p>Your secure access to PDFly is ready. We have generated a unique access key just for you.</p>"
                            +
                            "<div class='card'>" +
                            "<div style='margin-bottom: 16px;'>" +
                            "<div class='label'>Email Address</div>" +
                            "<div class='value'>%s</div>" +
                            "</div>" +
                            "<div>" +
                            "<div class='label'>Access Key (Password)</div>" +
                            "<div class='value' style='color: #4f46e5;'>%s</div>" +
                            "</div>" +
                            "</div>" +
                            "<p>Please use these credentials to sign in to your dashboard.</p>" +
                            "<center><a href='http://localhost:5173/login' class='button'>Sign In to Dashboard</a></center>"
                            +
                            "</div>" +
                            "<div class='footer'>" +
                            "<p>This is an automated message. Please do not reply.</p>" +
                            "<p>&copy; 2024 PDFly Inc. All rights reserved.</p>" +
                            "</div>" +
                            "</div>" +
                            "</body>" +
                            "</html>",
                    toEmail, generatedPassword);

            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            // Fallback or log error
        }
    }

    public void sendResetPhrase(String toEmail, String phrase) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setSubject("⚠️ Time-Sensitive Password Reset Code");
            helper.setTo(toEmail);

            String htmlBody = String.format(
                    "<!DOCTYPE html>" +
                            "<html>" +
                            "<head>" +
                            "<style>" +
                            "body { font-family: 'Inter', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }"
                            +
                            ".container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }"
                            +
                            ".header { background: #18181b; padding: 32px; text-align: center; }" +
                            ".logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em; }" +
                            ".logo span { color: #6366f1; }" +
                            ".content { padding: 40px 32px; color: #3f3f46; line-height: 1.6; }" +
                            ".h1 { font-size: 24px; font-weight: 700; color: #18181b; margin-bottom: 16px; }" +
                            ".code-box { background: #f4f4f5; border: 2px dashed #e4e4e7; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }"
                            +
                            ".code { font-size: 32px; font-family: 'Monaco', monospace; color: #4f46e5; font-weight: 700; letter-spacing: 0.1em; }"
                            +
                            ".footer { background: #f4f4f5; padding: 24px; text-align: center; font-size: 12px; color: #71717a; }"
                            +
                            "</style>" +
                            "</head>" +
                            "<body>" +
                            "<div class='container'>" +
                            "<div class='header'>" +
                            "<div class='logo'>PDF<span>ly</span></div>" +
                            "</div>" +
                            "<div class='content'>" +
                            "<div class='h1'>Password Reset Request</div>" +
                            "<p>We received a request to reset the password for your PDFly account (<strong>%s</strong>).</p>"
                            +
                            "<div class='code-box'>" +
                            "<div class='code'>%s</div>" +
                            "</div>" +
                            "<p>This code is valid for <strong>15 minutes</strong>. Do not share this code with anyone.</p>"
                            +
                            "<p style='font-size: 14px; color: #71717a;'>If you did not request this, you can safely ignore this email.</p>"
                            +
                            "</div>" +
                            "<div class='footer'>" +
                            "<p>This is an automated message. Please do not reply.</p>" +
                            "<p>&copy; 2024 PDFly Inc. All rights reserved.</p>" +
                            "</div>" +
                            "</div>" +
                            "</body>" +
                            "</html>",
                    toEmail, phrase);

            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }
}