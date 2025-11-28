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
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font; 
import org.apache.pdfbox.pdmodel.encryption.AccessPermission;
import org.apache.pdfbox.pdmodel.encryption.StandardProtectionPolicy;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.rendering.ImageType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
import java.util.Map;
import java.util.HashMap;

// Imports for Compression & Images
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.graphics.image.JPEGFactory;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.cos.COSBase;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.MemoryCacheImageOutputStream;
import org.apache.pdfbox.pdmodel.graphics.form.PDFormXObject;

// Imports for Word Conversion
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;

// Imports for PowerPoint Conversion
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFPictureShape;
import org.apache.poi.sl.usermodel.PictureData;
import java.awt.geom.Rectangle2D;

// Imports for Excel Conversion
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFCell;

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
    public List<byte[]> splitPdf(MultipartFile file, String splitMode, String pageRanges, Integer pagesPerFile) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            List<byte[]> result = new java.util.ArrayList<>();
            
            Splitter splitter = new Splitter();
            if ("every".equalsIgnoreCase(splitMode) && pagesPerFile != null && pagesPerFile > 0) {
                splitter.setSplitAtPage(pagesPerFile);
            }
            
            List<PDDocument> pages = splitter.split(document);
            for (PDDocument pageDoc : pages) {
                try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                    pageDoc.save(output);
                    result.add(output.toByteArray());
                } finally {
                    pageDoc.close();
                }
            }
            return result;
        }
    }
    
    public byte[] createZipFromPdfs(List<byte[]> pdfFiles, String baseFilename) throws IOException {
        ByteArrayOutputStream zipOutputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(zipOutputStream)) {
            zos.setLevel(9);
            String safeBaseName = baseFilename != null ? baseFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "split";
            for (int i = 0; i < pdfFiles.size(); i++) {
                ZipEntry entry = new ZipEntry(safeBaseName + "_" + (i + 1) + ".pdf");
                zos.putNextEntry(entry);
                zos.write(pdfFiles.get(i));
                zos.closeEntry();
            }
        }
        return zipOutputStream.toByteArray();
    }

    // =================================================================
    // 3. COMPRESS PDF (Downsampling)
    // =================================================================
    public byte[] compressPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            document.getDocumentCatalog().setMetadata(null); 
            Map<COSBase, PDImageXObject> cache = new HashMap<>();
            for (PDPage page : document.getPages()) {
                compressResources(page.getResources(), document, cache);
            }
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream); 
            return outputStream.toByteArray();
        }
    }

    private void compressResources(PDResources resources, PDDocument document, Map<COSBase, PDImageXObject> cache) throws IOException {
        if (resources == null) return;
        for (COSName name : resources.getXObjectNames()) {
            PDXObject xobject = resources.getXObject(name);
            if (xobject instanceof PDFormXObject) {
                compressResources(((PDFormXObject) xobject).getResources(), document, cache);
            } else if (xobject instanceof PDImageXObject) {
                PDImageXObject image = (PDImageXObject) xobject;
                if (image.getWidth() > 1000 || image.getHeight() > 1000) {
                    BufferedImage bi = image.getImage();
                    int newWidth = bi.getWidth() / 2;
                    int newHeight = bi.getHeight() / 2;
                    BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g = resized.createGraphics();
                    g.drawImage(bi, 0, 0, newWidth, newHeight, null);
                    g.dispose();
                    
                    PDImageXObject newImage = JPEGFactory.createFromImage(document, resized, 0.5f); 
                    resources.put(name, newImage);
                }
            }
        }
    }
    
    // =================================================================
    // 4. ROTATE PDF
    // =================================================================
    public byte[] rotatePdf(MultipartFile file, int degrees) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            for (PDPage page : document.getPages()) {
                page.setRotation((page.getRotation() + degrees) % 360);
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
            // FIXED: Use the public static constant directly instead of the internal class
            PDType1Font font = PDType1Font.HELVETICA_BOLD; 
            
            for (PDPage page : document.getPages()) {
                float fontSize = 60;
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    PDExtendedGraphicsState r = new PDExtendedGraphicsState();
                    r.setNonStrokingAlphaConstant(0.2f); 
                    contentStream.setGraphicsStateParameters(r);
                    contentStream.setNonStrokingColor(Color.GRAY);
                    contentStream.setFont(font, fontSize);
                    contentStream.beginText();
                    // Simple centering logic
                    contentStream.setTextMatrix(org.apache.pdfbox.util.Matrix.getRotateInstance(
                        Math.toRadians(45), page.getMediaBox().getWidth()/2, page.getMediaBox().getHeight()/2));
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
            // FIXED: Use the public static constant directly
            PDType1Font font = PDType1Font.HELVETICA_BOLD;
            for (PDPage page : document.getPages()) {
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(Color.BLUE);
                    contentStream.setFont(font, 18);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(page.getMediaBox().getWidth() - 200, 50);
                    contentStream.showText(signatureText);
                    contentStream.endText();
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
            // FIXED: Use the public static constant directly
            PDType1Font font = PDType1Font.HELVETICA;
            int totalPages = document.getNumberOfPages();
            for (int i = 0; i < totalPages; i++) {
                PDPage page = document.getPage(i);
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(Color.BLACK);
                    contentStream.setFont(font, 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(page.getMediaBox().getWidth() / 2, 20);
                    contentStream.showText("Page " + (i + 1) + " of " + totalPages);
                    contentStream.endText();
                }
            }
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    // =================================================================
    // 10. PDF TO WORD (REAL)
    // =================================================================
    public byte[] pdfToWord(MultipartFile file) throws IOException {
        try (PDDocument pdfDocument = PDDocument.load(file.getInputStream());
             XWPFDocument wordDocument = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(pdfDocument);

            String[] lines = text.split(System.lineSeparator());
            for (String line : lines) {
                XWPFParagraph paragraph = wordDocument.createParagraph();
                XWPFRun run = paragraph.createRun();
                run.setText(line);
            }

            wordDocument.write(out);
            return out.toByteArray();
        }
    }

    // =================================================================
    // 11. PDF TO POWERPOINT (REAL)
    // =================================================================
    public byte[] pdfToPpt(MultipartFile file) throws IOException {
        try (PDDocument pdfDocument = PDDocument.load(file.getInputStream());
             XMLSlideShow ppt = new XMLSlideShow();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFRenderer pdfRenderer = new PDFRenderer(pdfDocument);
            for (int i = 0; i < pdfDocument.getNumberOfPages(); i++) {
                BufferedImage bim = pdfRenderer.renderImageWithDPI(i, 150, ImageType.RGB);
                XSLFSlide slide = ppt.createSlide();
                ByteArrayOutputStream imgOut = new ByteArrayOutputStream();
                ImageIO.write(bim, "png", imgOut);
                XSLFPictureData pictureData = ppt.addPicture(imgOut.toByteArray(), PictureData.PictureType.PNG);
                XSLFPictureShape pictureShape = slide.createPicture(pictureData);
                pictureShape.setAnchor(new Rectangle2D.Double(0, 0, ppt.getPageSize().getWidth(), ppt.getPageSize().getHeight()));
            }
            ppt.write(out);
            return out.toByteArray();
        }
    }
    
    // =================================================================
    // 13. PDF TO EXCEL (REAL)
    // =================================================================
    public byte[] pdfToExcel(MultipartFile file) throws IOException {
        try (PDDocument pdfDocument = PDDocument.load(file.getInputStream());
             XSSFWorkbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("PDF Data");
            
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(pdfDocument);

            String[] lines = text.split(System.lineSeparator());
            int rowNum = 0;
            
            for (String line : lines) {
                if (line.trim().isEmpty()) continue;
                XSSFRow row = sheet.createRow(rowNum++);
                String[] columns = line.split("\\s{2,}"); // Split by 2+ spaces
                
                int colNum = 0;
                for (String colData : columns) {
                    XSSFCell cell = row.createCell(colNum++);
                    cell.setCellValue(colData.trim());
                }
            }
            
            for (int i = 0; i < 10; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // =================================================================
    // 12. IMAGE TO PDF (REAL)
    // =================================================================
    public byte[] imageToPdf(MultipartFile imageFile) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imageFile.getBytes(), imageFile.getOriginalFilename());
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                 float scale = Math.min(page.getMediaBox().getWidth() / pdImage.getWidth(), page.getMediaBox().getHeight() / pdImage.getHeight());
                 contentStream.drawImage(pdImage, 0, 0, pdImage.getWidth() * scale, pdImage.getHeight() * scale);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }
    
    public byte[] handleConversion(MultipartFile file) throws IOException {
         return file.getBytes();
    }
}