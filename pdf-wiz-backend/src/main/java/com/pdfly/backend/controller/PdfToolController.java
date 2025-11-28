// Location: pdf-wiz-backend/src/main/java/com/pdfly/backend/controller/PdfToolController.java
package com.pdfly.backend.controller;

import com.pdfly.backend.service.PdfToolService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
public class PdfToolController {

    private final PdfToolService pdfToolService;

    private ResponseEntity<byte[]> createPdfResponse(byte[] fileBytes, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        return ResponseEntity.ok().headers(headers).body(fileBytes);
    }
    
    private ResponseEntity<byte[]> createErrorResponse(String message) {
        return ResponseEntity.status(500).body(("Error: " + message).getBytes());
    }

    // 1. MERGE
    @PostMapping(value = "/merge", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> mergePdfs(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.size() < 2) {
            return createErrorResponse("Please upload at least two PDF files to merge.");
        }
        
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                return createErrorResponse("One or more files are empty. Please upload valid PDF files.");
            }
        }
        
        try {
            byte[] mergedPdf = pdfToolService.mergePdfs(files);
            if (mergedPdf == null || mergedPdf.length == 0) {
                return createErrorResponse("Merge operation produced an empty file.");
            }
            return createPdfResponse(mergedPdf, "pdfly_merged.pdf");
        } catch (Exception e) {
            return createErrorResponse("Merge failed: " + e.getMessage());
        }
    }

    // 2. SPLIT
    @PostMapping(value = "/split", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> splitPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "splitMode", required = false, defaultValue = "all") String splitMode,
            @RequestParam(value = "pageRanges", required = false) String pageRanges,
            @RequestParam(value = "pagesPerFile", required = false) Integer pagesPerFile) {
        
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file to split.");
        }
        
        try {
            List<byte[]> splitFiles = pdfToolService.splitPdf(file, splitMode, pageRanges, pagesPerFile);
            
            if (splitFiles.isEmpty()) {
                return createErrorResponse("No pages were split. Please check your split options.");
            }
            
            String baseFilename = file.getOriginalFilename();
            if (baseFilename != null && baseFilename.endsWith(".pdf")) {
                baseFilename = baseFilename.substring(0, baseFilename.length() - 4);
            } else {
                baseFilename = "split";
            }
            
            byte[] zipBytes = pdfToolService.createZipFromPdfs(splitFiles, baseFilename);
            
            if (zipBytes == null || zipBytes.length == 0) {
                return createErrorResponse("Failed to create ZIP file.");
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/zip"));
            headers.setContentDispositionFormData("attachment", baseFilename + "_split.zip");
            headers.setContentLength(zipBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(zipBytes);
                    
        } catch (Exception e) {
            return createErrorResponse("Split operation failed: " + e.getMessage());
        }
    }
    
    // 3. COMPRESS
    @PostMapping(value = "/compress", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> compressPdf(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file to compress.");
        }
        try {
            byte[] compressedPdf = pdfToolService.compressPdf(file);
            return createPdfResponse(compressedPdf, "pdfly_compressed.pdf");
        } catch (IOException e) {
            return createErrorResponse("Compression failed: " + e.getMessage());
        }
    }
    
    // 4. ROTATE
    @PostMapping(value = "/rotate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> rotatePdf(@RequestParam("file") MultipartFile file, 
                                            @RequestParam("degrees") int degrees) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file to rotate.");
        }
        try {
            byte[] rotatedPdf = pdfToolService.rotatePdf(file, degrees);
            return createPdfResponse(rotatedPdf, "pdfly_rotated.pdf");
        } catch (IOException e) {
            return createErrorResponse("Rotation failed: " + e.getMessage());
        }
    }
    
    // 5. WATERMARK
    @PostMapping(value = "/watermark", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> watermarkPdf(@RequestParam("file") MultipartFile file, 
                                               @RequestParam("text") String text) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file for watermarking.");
        }
        try {
            byte[] watermarkedPdf = pdfToolService.watermarkPdf(file, text);
            return createPdfResponse(watermarkedPdf, "pdfly_watermarked.pdf");
        } catch (IOException e) {
            return createErrorResponse("Watermark failed: " + e.getMessage());
        }
    }

    // 6. PROTECT
    @PostMapping(value = "/protect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> protectPdf(@RequestParam("file") MultipartFile file, 
                                             @RequestParam("password") String password) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file to protect.");
        }
        try {
            byte[] protectedPdf = pdfToolService.protectPdf(file, password);
            return createPdfResponse(protectedPdf, "pdfly_protected.pdf");
        } catch (IOException e) {
            return createErrorResponse("Protection failed: " + e.getMessage());
        }
    }
    
    // 7. UNLOCK
    @PostMapping(value = "/unlock", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> unlockPdf(@RequestParam("file") MultipartFile file, 
                                            @RequestParam("password") String password) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file to unlock.");
        }
        try {
            byte[] unlockedPdf = pdfToolService.unlockPdf(file, password);
            return createPdfResponse(unlockedPdf, "pdfly_unlocked.pdf");
        } catch (InvalidPasswordException e) {
             return ResponseEntity.status(401).body("InvalidPassword: The password provided is incorrect.".getBytes());
        } catch (IOException e) {
            return createErrorResponse("Unlock failed: " + e.getMessage());
        }
    }
    
    // 8. SIGN
    @PostMapping(value = "/sign", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> signPdf(@RequestParam("file") MultipartFile file, 
                                         @RequestParam("signatureText") String text) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file to sign.");
        }
        try {
            byte[] signedPdf = pdfToolService.signPdf(file, text);
            return createPdfResponse(signedPdf, "pdfly_signed.pdf");
        } catch (IOException e) {
            return createErrorResponse("Signing failed: " + e.getMessage());
        }
    }
    
    // 9. PAGE NUMBERS
    @PostMapping(value = "/page-numbers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> addPageNumbers(@RequestParam("file") MultipartFile file,
                                                @RequestParam(value = "position", required = false, defaultValue = "bottom-center") String position) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a PDF file.");
        }
        try {
            byte[] numberedPdf = pdfToolService.addPageNumbers(file, position);
            return createPdfResponse(numberedPdf, "pdfly_numbered.pdf");
        } catch (IOException e) {
            return createErrorResponse("Adding page numbers failed: " + e.getMessage());
        }
    }
    
    // 10. JPG TO PDF
    @PostMapping(value = "/jpg-to-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> jpgToPdf(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload an image file.");
        }
        try {
            byte[] pdfBytes = pdfToolService.imageToPdf(file);
            return createPdfResponse(pdfBytes, "converted.pdf");
        } catch (IOException e) {
            return createErrorResponse("Image conversion failed: " + e.getMessage());
        }
    }
    
    // 11. GENERIC CONVERT (Handles Word/PPT/Excel)
    @PostMapping(value = "/convert/{toolId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> handleConversion(@PathVariable("toolId") String toolId, 
                                                   @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a file for conversion.");
        }
        
        try {
            byte[] processedBytes;
            String ext;
            String contentType;
            String tool = toolId.toLowerCase();

            if (tool.contains("word")) {
                processedBytes = pdfToolService.pdfToWord(file);
                ext = ".docx";
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (tool.contains("ppt") || tool.contains("powerpoint")) {
                processedBytes = pdfToolService.pdfToPpt(file);
                ext = ".pptx";
                contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            } else if (tool.contains("excel") || tool.contains("sheet")) {
                // REAL EXCEL CONVERSION Logic
                processedBytes = pdfToolService.pdfToExcel(file);
                ext = ".xlsx";
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else {
                // Fallback
                processedBytes = pdfToolService.handleConversion(file);
                ext = ".pdf";
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
                                     
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType)); 
            headers.setContentDispositionFormData("attachment", "pdfly_converted" + ext);
            return ResponseEntity.ok().headers(headers).body(processedBytes);
            
        } catch (IOException e) {
            return createErrorResponse("Conversion failed: " + e.getMessage());
        }
    }
}