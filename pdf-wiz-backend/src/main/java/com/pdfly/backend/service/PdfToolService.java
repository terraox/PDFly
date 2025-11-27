// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/service/PdfToolService.java
package com.pdfly.backend.service;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.io.MemoryUsageSetting;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.apache.pdfbox.multipdf.Splitter;
import org.apache.pdfbox.multipdf.PageExtractor;
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
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
    // 2. SPLIT PDF (Enhanced with customization options)
    // =================================================================

    /**
     * Split PDF with customization options
     * @param file The PDF file to split
     * @param splitMode "all" (split all pages), "range" (custom page ranges), "every" (split every N pages)
     * @param pageRanges For "range" mode: comma-separated ranges like "1-5,6-10,11-15"
     * @param pagesPerFile For "every" mode: number of pages per file
     * @return List of byte arrays, each representing a split PDF
     */
    public List<byte[]> splitPdf(MultipartFile file, String splitMode, String pageRanges, Integer pagesPerFile) throws IOException {
        
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            int totalPages = document.getNumberOfPages();
            List<byte[]> result = new java.util.ArrayList<>();
            
            if ("all".equalsIgnoreCase(splitMode)) {
                // Split every page into individual files
                Splitter splitter = new Splitter();
                List<PDDocument> pages = splitter.split(document);
                
                for (PDDocument pageDoc : pages) {
                    try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                        pageDoc.save(output);
                        result.add(output.toByteArray());
                    } finally {
                        pageDoc.close();
                    }
                }
            } else if ("every".equalsIgnoreCase(splitMode) && pagesPerFile != null && pagesPerFile > 0) {
                // Split every N pages
                Splitter splitter = new Splitter();
                splitter.setSplitAtPage(pagesPerFile);
                List<PDDocument> splitDocs = splitter.split(document);
                
                for (PDDocument splitDoc : splitDocs) {
                    try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                        splitDoc.save(output);
                        result.add(output.toByteArray());
                    } finally {
                        splitDoc.close();
                    }
                }
            } else if ("range".equalsIgnoreCase(splitMode) && pageRanges != null && !pageRanges.trim().isEmpty()) {
                // Split by custom page ranges (e.g., "1-5,6-10,11-15")
                String[] ranges = pageRanges.split(",");
                
                for (String range : ranges) {
                    range = range.trim();
                    if (range.contains("-")) {
                        String[] parts = range.split("-");
                        if (parts.length == 2) {
                            try {
                                int startPage = Integer.parseInt(parts[0].trim()) - 1; // Convert to 0-based
                                int endPage = Integer.parseInt(parts[1].trim()) - 1; // Convert to 0-based
                                
                                // Validate range
                                if (startPage < 0) startPage = 0;
                                if (endPage >= totalPages) endPage = totalPages - 1;
                                if (startPage > endPage) continue;
                                
                                // Extract page range using PageExtractor
                                PageExtractor extractor = new PageExtractor(document);
                                extractor.setStartPage(startPage + 1); // 1-based
                                extractor.setEndPage(endPage + 1); // 1-based
                                PDDocument extracted = extractor.extract();
                                
                                try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                                    extracted.save(output);
                                    result.add(output.toByteArray());
                                } finally {
                                    extracted.close();
                                }
                            } catch (NumberFormatException e) {
                                // Skip invalid range
                                continue;
                            }
                        }
                    } else {
                        // Single page
                        try {
                            int pageNum = Integer.parseInt(range.trim()) - 1; // Convert to 0-based
                            if (pageNum >= 0 && pageNum < totalPages) {
                                // Use PageExtractor for single page
                                PageExtractor extractor = new PageExtractor(document);
                                extractor.setStartPage(pageNum + 1); // 1-based
                                extractor.setEndPage(pageNum + 1); // 1-based
                                PDDocument extracted = extractor.extract();
                                
                                try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                                    extracted.save(output);
                                    result.add(output.toByteArray());
                                } finally {
                                    extracted.close();
                                }
                            }
                        } catch (NumberFormatException e) {
                            // Skip invalid page number
                            continue;
                        }
                    }
                }
            } else {
                // Default: split all pages
                Splitter splitter = new Splitter();
                List<PDDocument> pages = splitter.split(document);
                
                for (PDDocument pageDoc : pages) {
                    try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                        pageDoc.save(output);
                        result.add(output.toByteArray());
                    } finally {
                        pageDoc.close();
                    }
                }
            }
            
            return result;

        } catch (RuntimeException e) {
             throw new IOException("Failed during PDF stream handling or splitting: " + e.getMessage(), e);
        }
    }
    
    // Legacy method for backward compatibility
    public List<byte[]> splitPdf(MultipartFile file) throws IOException {
        return splitPdf(file, "all", null, null);
    }
    
    /**
     * Create a ZIP file containing multiple PDF files
     * @param pdfFiles List of PDF byte arrays
     * @param baseFilename Base name for the files (e.g., "document" will create "document_1.pdf", "document_2.pdf")
     * @return ZIP file as byte array
     */
    public byte[] createZipFromPdfs(List<byte[]> pdfFiles, String baseFilename) throws IOException {
        if (pdfFiles == null || pdfFiles.isEmpty()) {
            throw new IOException("No PDF files to zip.");
        }
        
        ByteArrayOutputStream zipOutputStream = new ByteArrayOutputStream();
        ZipOutputStream zos = null;
        
        try {
            zos = new ZipOutputStream(zipOutputStream);
            // Set compression level
            zos.setLevel(9); // Maximum compression
            
            // Sanitize base filename
            String safeBaseName = baseFilename != null 
                ? baseFilename.replaceAll("[^a-zA-Z0-9._-]", "_") 
                : "split";
            
            for (int i = 0; i < pdfFiles.size(); i++) {
                byte[] pdfBytes = pdfFiles.get(i);
                if (pdfBytes == null || pdfBytes.length == 0) {
                    continue; // Skip empty files
                }
                
                String filename = safeBaseName + "_" + (i + 1) + ".pdf";
                
                // Create ZIP entry
                ZipEntry entry = new ZipEntry(filename);
                entry.setMethod(ZipEntry.DEFLATED); // Use deflation method
                zos.putNextEntry(entry);
                zos.write(pdfBytes, 0, pdfBytes.length);
                zos.closeEntry();
            }
            
        } finally {
            // Properly close the ZIP stream
            if (zos != null) {
                zos.finish(); // Finalize the ZIP file
                zos.close();
            }
        }
        
        // Get the byte array after everything is closed
        byte[] zipBytes = zipOutputStream.toByteArray();
        zipOutputStream.close();
        
        if (zipBytes.length == 0) {
            throw new IOException("Generated ZIP file is empty.");
        }
        
        return zipBytes;
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
    // 8. SIGN PDF (Add signature text/image)
    // =================================================================

    public byte[] signPdf(MultipartFile file, String signatureText) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            PDType1Font font = PDType1Font.HELVETICA_BOLD;
            
            for (PDPage page : document.getPages()) {
                float fontSize = 24;
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();
                
                // Position signature at bottom right
                float x = pageWidth - 150;
                float y = 50;
                
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(Color.BLUE);
                    contentStream.setFont(font, fontSize);
                    
                    contentStream.beginText();
                    contentStream.newLineAtOffset(x, y);
                    contentStream.showText(signatureText);
                    contentStream.endText();
                    
                    // Draw a line under signature
                    contentStream.setStrokingColor(Color.BLUE);
                    contentStream.setLineWidth(1);
                    contentStream.moveTo(x, y - 5);
                    contentStream.lineTo(x + 140, y - 5);
                    contentStream.stroke();
                }
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 9. ADD PAGE NUMBERS
    // =================================================================

    public byte[] addPageNumbers(MultipartFile file, String position) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            PDType1Font font = PDType1Font.HELVETICA;
            int totalPages = document.getNumberOfPages();
            
            for (int i = 0; i < totalPages; i++) {
                PDPage page = document.getPage(i);
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();
                
                // Determine position (default: bottom center)
                float x = pageWidth / 2;
                float y = 30; // Bottom
                
                if (position != null) {
                    switch (position.toLowerCase()) {
                        case "top-center":
                            y = pageHeight - 30;
                            break;
                        case "top-right":
                            x = pageWidth - 50;
                            y = pageHeight - 30;
                            break;
                        case "top-left":
                            x = 50;
                            y = pageHeight - 30;
                            break;
                        case "bottom-right":
                            x = pageWidth - 50;
                            y = 30;
                            break;
                        case "bottom-left":
                            x = 50;
                            y = 30;
                            break;
                        default: // bottom-center
                            break;
                    }
                }
                
                String pageText = String.format("Page %d of %d", i + 1, totalPages);
                
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(Color.GRAY);
                    contentStream.setFont(font, 12);
                    
                    contentStream.beginText();
                    // Center the text
                    float textWidth = font.getStringWidth(pageText) / 1000 * 12;
                    contentStream.newLineAtOffset(x - textWidth / 2, y);
                    contentStream.showText(pageText);
                    contentStream.endText();
                }
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 10. IMAGE & WORD CONVERSIONS (Simulated)
    // =================================================================

    /**
     * Placeholder for complex file type conversions (PDF to JPG, Word to PDF).
     */
    public byte[] handleConversion(MultipartFile file) throws IOException {
         return file.getBytes();
    }
}