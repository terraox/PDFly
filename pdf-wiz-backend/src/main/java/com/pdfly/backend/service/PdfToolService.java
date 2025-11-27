// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/service/PdfToolService.java
package com.pdfly.backend.service;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.multipdf.Splitter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font; 
// Removed ambiguous font import that was causing compile error
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException; 

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

// WE RELY ONLY ON IMPLICIT REFERENCE OR FQCN WHERE NECESSARY

@Service
@RequiredArgsConstructor
public class PdfToolService {

    // =================================================================
    // 1. MERGE PDFS
    // =================================================================

    public byte[] mergePdfs(List<MultipartFile> files) throws IOException {
        PDFMergerUtility merger = new PDFMergerUtility();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        merger.setDestinationStream(outputStream);
        for (MultipartFile file : files) {
            merger.addSource(file.getInputStream());
        }

        merger.mergeDocuments(MemoryUsageSetting.setupMainMemoryOnly());
        return outputStream.toByteArray();
    }


    // =================================================================
    // 2. SPLIT PDF
    // =================================================================

    public List<byte[]> splitPdf(MultipartFile file) throws IOException {
        
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            Splitter splitter = new Splitter();
            List<PDDocument> pages = splitter.split(document);

            return pages.stream().map(p -> {
                try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                    p.save(output);
                    p.close();
                    return output.toByteArray();
                } catch (IOException e) {
                    throw new RuntimeException("Error saving split page.", e);
                }
            }).collect(Collectors.toList());

        } catch (RuntimeException e) {
             throw new IOException("Failed during PDF stream handling or splitting.", e);
        }
    }
    
    // =================================================================
    // 3. COMPRESS PDF
    // =================================================================

    public byte[] compressPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream); 
            document.close();
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 4. ROTATE PDF
    // =================================================================

    public byte[] rotatePdf(MultipartFile file, int degrees) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            for (PDPage page : document.getPages()) {
                int newRotation = (page.getRotation() + degrees) % 360;
                page.setRotation(newRotation);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 5. WATERMARK PDF (Semi-Transparent Text)
    // =================================================================

    public byte[] watermarkPdf(MultipartFile file, String watermarkText) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            // CORRECT USAGE: Using the static constant directly
            PDType1Font font = PDType1Font.HELVETICA_BOLD; 
            
            for (PDPage page : document.getPages()) {
                float fontSize = 72;
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();
                
                float textWidth = font.getStringWidth(watermarkText) / 1000 * fontSize;

                PDExtendedGraphicsState r = new PDExtendedGraphicsState();
                r.setNonStrokingAlphaConstant(0.2f); 
                r.setAlphaSourceFlag(true);

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    
                    contentStream.setGraphicsStateParameters(r);
                    contentStream.setNonStrokingColor(Color.GRAY);
                    contentStream.setFont(font, fontSize);
                    
                    contentStream.beginText();
                    contentStream.setTextMatrix(org.apache.pdfbox.util.Matrix.getRotateInstance(
                        Math.toRadians(45), 
                        (pageWidth - textWidth) / 2, 
                        (pageHeight - fontSize) / 2 
                    ));
                    contentStream.showText(watermarkText);
                    contentStream.endText();
                }
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 6. PROTECT/ENCRYPT PDF
    // =================================================================

    public byte[] protectPdf(MultipartFile file, String password) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            AccessPermission ap = new AccessPermission();
            ap.setCanPrint(true);
            ap.setCanModify(false); 

            StandardProtectionPolicy spp = new StandardProtectionPolicy(
                password, 
                password, 
                ap
            );
            spp.setEncryptionKeyLength(128);
            spp.setPermissions(ap);
            
            document.protect(spp);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 7. UNLOCK/DECRYPT PDF
    // =================================================================

    public byte[] unlockPdf(MultipartFile file, String password) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream(), password)) {
            
            if (document.isEncrypted()) {
                document.setAllSecurityToBeRemoved(true);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        } 
    }
    
    // =================================================================
    // 8. IMAGE & WORD CONVERSIONS (Simulated)
    // =================================================================

    /**
     * Placeholder for complex file type conversions (PDF to JPG, Word to PDF).
     */
    public byte[] handleConversion(MultipartFile file) throws IOException {
         return file.getBytes();
    }
}