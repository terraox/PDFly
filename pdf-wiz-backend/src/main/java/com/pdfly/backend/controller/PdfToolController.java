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

    // Helper to build a standard PDF download response
    private ResponseEntity<byte[]> createPdfResponse(byte[] fileBytes, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        return ResponseEntity.ok()
                .headers(headers)
                .body(fileBytes);
    }
    
    // Helper for error messages
    private ResponseEntity<byte[]> createErrorResponse(String message) {
        return ResponseEntity.status(500).body(("Error: " + message).getBytes());
    }

    // =================================================================
    // 1. MERGE ENDPOINT (POST /api/tools/merge)
    // =================================================================
    @PostMapping(value = "/merge", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> mergePdfs(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.size() < 2) {
            return createErrorResponse("Please upload at least two PDF files to merge.");
        }
        try {
            byte[] mergedPdf = pdfToolService.mergePdfs(files);
            return createPdfResponse(mergedPdf, "pdfly_merged.pdf");
        } catch (IOException e) {
            return createErrorResponse("Merging failed due to file reading error: " + e.getMessage());
        }
    }


    // =================================================================
    // 2. SPLIT ENDPOINT (POST /api/tools/split)
    // =================================================================
    @PostMapping(value = "/split", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> splitPdf(@RequestParam("file") MultipartFile file) {
         if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a PDF file to split.");
        }
        try {
            // Note: Returning a list of byte arrays requires zipping. 
            // We return a simple success status for now.
            List<byte[]> splitFiles = pdfToolService.splitPdf(file);
            return ResponseEntity.ok().body("Successfully split PDF into " + splitFiles.size() + " pages. (Download feature pending ZIP implementation)");
        } catch (IOException e) {
            return createErrorResponse("Splitting failed: " + e.getMessage());
        }
    }
    
    
    // =================================================================
    // 3. COMPRESS ENDPOINT (POST /api/tools/compress)
    // =================================================================
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
    
    
    // =================================================================
    // 4. ROTATE ENDPOINT (POST /api/tools/rotate)
    // =================================================================
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
    
    
    // =================================================================
    // 5. WATERMARK ENDPOINT (POST /api/tools/watermark)
    // =================================================================
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

    
    // =================================================================
    // 6. PROTECT ENDPOINT (POST /api/tools/protect)
    // =================================================================
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
    
    
    // =================================================================
    // 7. UNLOCK ENDPOINT (POST /api/tools/unlock)
    // =================================================================
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
             // Specific error for wrong password attempt
             return ResponseEntity.status(401).body("InvalidPassword: The password provided is incorrect.".getBytes());
        } catch (IOException e) {
            return createErrorResponse("Unlock failed due to file reading error: " + e.getMessage());
        }
    }
    
    
    // =================================================================
    // 8. GENERIC CONVERSION ENDPOINT (Handles the rest 5+ tools)
    // =================================================================
    
    /**
     * Generic handler for simple conversions (PDF to Word, JPG to PDF, etc.)
     * This simulates success since complex POI/DOCX conversion is library-dependent.
     */
    @PostMapping(value = "/convert/{toolId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> handleConversion(@PathVariable("toolId") String toolId,
                                                   @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return createErrorResponse("Please upload a file for conversion.");
        }
        
        try {
            // Service returns the original file bytes, simulating success.
            byte[] processedBytes = pdfToolService.handleConversion(file);
            
            // Determine output type for download
            String outputExtension = toolId.contains("jpg") ? ".jpg" : 
                                     toolId.contains("word") ? ".docx" : 
                                     toolId.contains("excel") ? ".xlsx" : 
                                     toolId.contains("ppt") ? ".pptx" : ".pdf";
                                     
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM); // Generic binary stream
            headers.setContentDispositionFormData("attachment", "pdfly_converted" + outputExtension);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(processedBytes);
            
        } catch (IOException e) {
            return createErrorResponse("Conversion failed: " + e.getMessage());
        }
    }

}