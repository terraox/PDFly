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
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException; 

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Iterator;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

// Imports for Compression
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.cos.COSName;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;

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
    // 2. SPLIT PDF (Enhanced)
    // =================================================================

    public List<byte[]> splitPdf(MultipartFile file, String splitMode, String pageRanges, Integer pagesPerFile) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            int totalPages = document.getNumberOfPages();
            List<byte[]> result = new java.util.ArrayList<>();
            
            if ("all".equalsIgnoreCase(splitMode)) {
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
                String[] ranges = pageRanges.split(",");
                for (String range : ranges) {
                    range = range.trim();
                    if (range.contains("-")) {
                        String[] parts = range.split("-");
                        if (parts.length == 2) {
                            try {
                                int startPage = Integer.parseInt(parts[0].trim()) - 1;
                                int endPage = Integer.parseInt(parts[1].trim()) - 1;
                                if (startPage < 0) startPage = 0;
                                if (endPage >= totalPages) endPage = totalPages - 1;
                                if (startPage > endPage) continue;
                                
                                PageExtractor extractor = new PageExtractor(document);
                                extractor.setStartPage(startPage + 1);
                                extractor.setEndPage(endPage + 1);
                                PDDocument extracted = extractor.extract();
                                try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                                    extracted.save(output);
                                    result.add(output.toByteArray());
                                } finally {
                                    extracted.close();
                                }
                            } catch (NumberFormatException e) { continue; }
                        }
                    } else {
                        try {
                            int pageNum = Integer.parseInt(range.trim()) - 1;
                            if (pageNum >= 0 && pageNum < totalPages) {
                                PageExtractor extractor = new PageExtractor(document);
                                extractor.setStartPage(pageNum + 1);
                                extractor.setEndPage(pageNum + 1);
                                PDDocument extracted = extractor.extract();
                                try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                                    extracted.save(output);
                                    result.add(output.toByteArray());
                                } finally {
                                    extracted.close();
                                }
                            }
                        } catch (NumberFormatException e) { continue; }
                    }
                }
            } else {
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
    
    public List<byte[]> splitPdf(MultipartFile file) throws IOException {
        return splitPdf(file, "all", null, null);
    }
    
    public byte[] createZipFromPdfs(List<byte[]> pdfFiles, String baseFilename) throws IOException {
        if (pdfFiles == null || pdfFiles.isEmpty()) {
            throw new IOException("No PDF files to zip.");
        }
        ByteArrayOutputStream zipOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(zipOutputStream)) {
            zos.setLevel(9);
            String safeBaseName = baseFilename != null ? baseFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "split";
            for (int i = 0; i < pdfFiles.size(); i++) {
                byte[] pdfBytes = pdfFiles.get(i);
                if (pdfBytes == null || pdfBytes.length == 0) continue;
                String filename = safeBaseName + "_" + (i + 1) + ".pdf";
                ZipEntry entry = new ZipEntry(filename);
                zos.putNextEntry(entry);
                zos.write(pdfBytes, 0, pdfBytes.length);
                zos.closeEntry();
            }
        }
        return zipOutputStream.toByteArray();
    }
    
    // =================================================================
    // 3. COMPRESS PDF (FIXED & ROBUST)
    // =================================================================

    public byte[] compressPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            
            // 1. Iterate through all pages
            for (PDPage page : document.getPages()) {
                PDResources resources = page.getResources();
                if (resources == null) continue;

                // 2. Find all images on the page
                for (COSName xObjectName : resources.getXObjectNames()) {
                    PDXObject xObject = resources.getXObject(xObjectName);

                    if (xObject instanceof PDImageXObject) {
                        PDImageXObject image = (PDImageXObject) xObject;
                        
                        // 3. Filter: Only compress images larger than 1000px width/height
                        if (image.getWidth() > 1000 || image.getHeight() > 1000) {
                            
                            // A. Convert to BufferedImage
                            BufferedImage bufferedImage = image.getImage();
                            
                            // B. Downsample (Resize to 50%)
                            int newWidth = bufferedImage.getWidth() / 2;
                            int newHeight = bufferedImage.getHeight() / 2;
                            BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
                            Graphics2D g = resizedImage.createGraphics();
                            g.drawImage(bufferedImage, 0, 0, newWidth, newHeight, null);
                            g.dispose();

                            // C. Re-compress to JPEG with Low Quality (0.6)
                            ByteArrayOutputStream compressedStream = new ByteArrayOutputStream();
                            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
                            
                            if (writers.hasNext()) {
                                ImageWriter writer = writers.next();
                                ImageWriteParam param = writer.getDefaultWriteParam();
                                if (param.canWriteCompressed()) {
                                    param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                                    param.setCompressionQuality(0.6f); // 60% Quality
                                }
                                
                                try (MemoryCacheImageOutputStream ios = new MemoryCacheImageOutputStream(compressedStream)) {
                                    writer.setOutput(ios);
                                    writer.write(null, new IIOImage(resizedImage, null, null), param);
                                }
                                writer.dispose();
                            }

                            // D. Create new PDFBox Image Object
                            PDImageXObject newImage = PDImageXObject.createFromByteArray(
                                document, 
                                compressedStream.toByteArray(), 
                                "jpg" // Force JPEG
                            );

                            // E. Replace original image
                            resources.put(xObjectName, newImage);
                        }
                    }
                }
            }

            // 4. Save Optimized Document
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
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
    // 5. WATERMARK PDF
    // =================================================================

    public byte[] watermarkPdf(MultipartFile file, String watermarkText) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            // Use standard font constant
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
    // 6. PROTECT PDF
    // =================================================================

    public byte[] protectPdf(MultipartFile file, String password) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            AccessPermission ap = new AccessPermission();
            ap.setCanPrint(true);
            ap.setCanModify(false); 
            StandardProtectionPolicy spp = new StandardProtectionPolicy(password, password, ap);
            spp.setEncryptionKeyLength(128);
            document.protect(spp);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 7. UNLOCK PDF
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
    // 8. SIGN PDF
    // =================================================================

    public byte[] signPdf(MultipartFile file, String signatureText) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDType1Font font = PDType1Font.HELVETICA_BOLD;
            for (PDPage page : document.getPages()) {
                float fontSize = 24;
                float pageWidth = page.getMediaBox().getWidth();
                float x = pageWidth - 200;
                float y = 50;
                
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(Color.BLUE);
                    contentStream.setFont(font, fontSize);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(x, y);
                    contentStream.showText(signatureText);
                    contentStream.endText();
                    
                    contentStream.setStrokingColor(Color.BLUE);
                    contentStream.setLineWidth(1);
                    contentStream.moveTo(x, y - 5);
                    contentStream.lineTo(x + 150, y - 5);
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
                float x = pageWidth / 2;
                float y = 30; // Bottom Center
                
                if (position != null) {
                    switch (position.toLowerCase()) {
                        case "top-center": y = pageHeight - 30; break;
                        case "top-right": x = pageWidth - 50; y = pageHeight - 30; break;
                        case "top-left": x = 50; y = pageHeight - 30; break;
                        case "bottom-right": x = pageWidth - 50; y = 30; break;
                        case "bottom-left": x = 50; y = 30; break;
                    }
                }
                
                String pageText = String.format("Page %d of %d", i + 1, totalPages);
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(Color.GRAY);
                    contentStream.setFont(font, 12);
                    contentStream.beginText();
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
    // 10. CONVERSIONS (Simulated)
    // =================================================================

    public byte[] handleConversion(MultipartFile file) throws IOException {
         return file.getBytes();
    }
}