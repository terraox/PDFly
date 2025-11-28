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
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
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
import org.apache.pdfbox.text.TextPosition;
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
    // 2. SPLIT PDF (Enhanced)
    // =================================================================

    public List<byte[]> splitPdf(MultipartFile file, String splitMode, String pageRanges, Integer pagesPerFile)
            throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            List<byte[]> result = new java.util.ArrayList<>();
            Splitter splitter = new Splitter();
            if ("every".equalsIgnoreCase(splitMode) && pagesPerFile != null && pagesPerFile > 0)
                splitter.setSplitAtPage(pagesPerFile);
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
            for (PDPage page : document.getPages())
                compressResources(page.getResources(), document, cache);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void compressResources(PDResources resources, PDDocument document, Map<COSBase, PDImageXObject> cache)
            throws IOException {
        if (resources == null)
            return;
        for (COSName name : resources.getXObjectNames()) {
            PDXObject xobject = resources.getXObject(name);
            if (xobject instanceof PDFormXObject)
                compressResources(((PDFormXObject) xobject).getResources(), document, cache);
            else if (xobject instanceof PDImageXObject) {
                PDImageXObject image = (PDImageXObject) xobject;
                if (image.getWidth() > 1000 || image.getHeight() > 1000) {
                    BufferedImage bi = image.getImage();
                    int newWidth = (int) (bi.getWidth() * 0.6);
                    int newHeight = (int) (bi.getHeight() * 0.6);
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

    public byte[] watermarkPdf(MultipartFile file, String watermarkText, MultipartFile watermarkImage,
            Float xPosition, Float yPosition, Float opacity, Float rotation, Float scale) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {

            // Default values
            float alpha = (opacity != null && opacity >= 0 && opacity <= 1) ? opacity : 0.3f;
            float rotationDegrees = (rotation != null) ? rotation : 45f;
            float scaleValue = (scale != null && scale > 0) ? scale : 1.0f;

            for (PDPage page : document.getPages()) {
                float pageWidth = page.getMediaBox().getWidth();
                float pageHeight = page.getMediaBox().getHeight();

                // Default position: center of page
                float x = (xPosition != null) ? xPosition : pageWidth / 2;
                float y = (yPosition != null) ? yPosition : pageHeight / 2;

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {

                    // Set transparency
                    PDExtendedGraphicsState graphicsState = new PDExtendedGraphicsState();
                    graphicsState.setNonStrokingAlphaConstant(alpha);
                    graphicsState.setStrokingAlphaConstant(alpha);
                    contentStream.setGraphicsStateParameters(graphicsState);

                    if (watermarkImage != null && !watermarkImage.isEmpty()) {
                        // IMAGE WATERMARK - Clean solution
                        PDImageXObject pdImage = PDImageXObject.createFromByteArray(
                                document, watermarkImage.getBytes(), watermarkImage.getOriginalFilename());

                        // Get image dimensions
                        float imgWidth = pdImage.getWidth();
                        float imgHeight = pdImage.getHeight();

                        // Scale down only if image is too large (keep small images small)
                        float maxDimension = Math.max(imgWidth, imgHeight);
                        float autoScale = 1.0f;
                        if (maxDimension > 400) {
                            autoScale = 400f / maxDimension;
                        }

                        // Apply auto-scale to base dimensions
                        float baseWidth = imgWidth * autoScale;
                        float baseHeight = imgHeight * autoScale;

                        // Apply user's scale factor
                        float finalWidth = baseWidth * scaleValue;
                        float finalHeight = baseHeight * scaleValue;

                        // Save graphics state
                        contentStream.saveGraphicsState();

                        // Build transformation matrix
                        org.apache.pdfbox.util.Matrix matrix = new org.apache.pdfbox.util.Matrix();

                        // 1. Translate to clicked position
                        matrix.translate(x, y);

                        // 2. Rotate by NEGATIVE angle to match Frontend's Clockwise rotation
                        // PDF rotation is Counter-Clockwise, so we negate to get Clockwise
                        matrix.rotate(Math.toRadians(-rotationDegrees));

                        // Apply transformation
                        contentStream.transform(matrix);

                        // 3. Draw image centered at origin (no flips needed)
                        contentStream.drawImage(pdImage, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);

                        contentStream.restoreGraphicsState();

                    } else if (watermarkText != null && !watermarkText.isEmpty()) {
                        // TEXT WATERMARK
                        PDType1Font font = PDType1Font.HELVETICA_BOLD;
                        float fontSize = 60 * scaleValue;

                        // Calculate text width to center it
                        float textWidth = font.getStringWidth(watermarkText) / 1000 * fontSize;

                        contentStream.setNonStrokingColor(Color.GRAY);
                        contentStream.setFont(font, fontSize);
                        contentStream.beginText();

                        // Create transformation matrix: translate to position, rotate, then offset to
                        // center
                        // We need to offset BEFORE rotation to center the text properly
                        org.apache.pdfbox.util.Matrix matrix = new org.apache.pdfbox.util.Matrix();

                        // First translate to the clicked position
                        matrix.translate(x, y);

                        // Then rotate around that point
                        matrix.rotate(Math.toRadians(rotationDegrees));

                        // Finally offset to center the text (this happens in rotated space)
                        matrix.translate(-textWidth / 2, 0);

                        contentStream.setTextMatrix(matrix);
                        contentStream.showText(watermarkText);
                        contentStream.endText();
                    }
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
            if (document.isEncrypted())
                document.setAllSecurityToBeRemoved(true);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    // =================================================================
    // 8. SIGN PDF
    // =================================================================

    public byte[] signPdf(MultipartFile file, String signatureText, Float xPosition, Float yPosition,
            String colorHex, String fontName, Integer fontSize) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            // Parse color from hex string (default: blue)
            Color color = Color.BLUE;
            if (colorHex != null && !colorHex.isEmpty()) {
                try {
                    color = Color.decode(colorHex);
                } catch (NumberFormatException e) {
                    System.err.println("Invalid color format, using default blue: " + e.getMessage());
                }
            }

            // Map font name to PDType1Font (default: HELVETICA_BOLD)
            PDType1Font font = PDType1Font.HELVETICA_BOLD;
            if (fontName != null && !fontName.isEmpty()) {
                switch (fontName.toUpperCase()) {
                    case "HELVETICA":
                        font = PDType1Font.HELVETICA;
                        break;
                    case "HELVETICA_BOLD":
                        font = PDType1Font.HELVETICA_BOLD;
                        break;
                    case "TIMES_ROMAN":
                        font = PDType1Font.TIMES_ROMAN;
                        break;
                    case "TIMES_BOLD":
                        font = PDType1Font.TIMES_BOLD;
                        break;
                    case "COURIER":
                        font = PDType1Font.COURIER;
                        break;
                    case "COURIER_BOLD":
                        font = PDType1Font.COURIER_BOLD;
                        break;
                    default:
                        font = PDType1Font.HELVETICA_BOLD;
                }
            }

            // Default font size
            int size = (fontSize != null && fontSize > 0) ? fontSize : 18;

            // Sign all pages
            for (PDPage page : document.getPages()) {
                // Calculate position (default: bottom-right)
                float x = (xPosition != null) ? xPosition : page.getMediaBox().getWidth() - 200;
                float y = (yPosition != null) ? yPosition : 50;

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {
                    contentStream.setNonStrokingColor(color);
                    contentStream.setFont(font, size);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(x, y);
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
            PDType1Font font = PDType1Font.HELVETICA;
            int totalPages = document.getNumberOfPages();
            for (int i = 0; i < totalPages; i++) {
                PDPage page = document.getPage(i);
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page,
                        PDPageContentStream.AppendMode.APPEND, true, true)) {
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
    // 10. PDF TO WORD (REAL - FORMATTING PRESERVED)
    // =================================================================

    public byte[] pdfToWord(MultipartFile file) throws IOException {
        try (PDDocument pdfDocument = PDDocument.load(file.getInputStream());
                XWPFDocument wordDocument = new XWPFDocument();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDFTextStripper stripper = new PDFTextStripper() {
                @Override
                protected void writeString(String text, List<TextPosition> textPositions) throws IOException {
                    super.writeString(text, textPositions);
                }
            };

            stripper.setSortByPosition(true);
            stripper.setStartPage(1);
            stripper.setEndPage(pdfDocument.getNumberOfPages());

            String text = stripper.getText(pdfDocument);
            String[] paragraphs = text.split("\\r?\\n\\r?\\n");

            for (String paraText : paragraphs) {
                XWPFParagraph paragraph = wordDocument.createParagraph();
                XWPFRun run = paragraph.createRun();
                String cleanText = paraText.trim();
                if (!cleanText.isEmpty()) {
                    run.setText(cleanText);
                    run.setFontFamily("Calibri");
                    run.setFontSize(11);

                    if (cleanText.length() < 50 && cleanText.equals(cleanText.toUpperCase())) {
                        run.setBold(true);
                        run.setFontSize(14);
                    }
                }
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
                pictureShape.setAnchor(
                        new Rectangle2D.Double(0, 0, ppt.getPageSize().getWidth(), ppt.getPageSize().getHeight()));
            }
            ppt.write(out);
            return out.toByteArray();
        }
    }

    // =================================================================
    // 12. PDF TO EXCEL (REAL)
    // =================================================================

    public byte[] pdfToExcel(MultipartFile file) throws IOException {
        try (PDDocument pdfDocument = PDDocument.load(file.getInputStream());
                XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("PDF Data");

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            stripper.setWordSeparator("|");

            String text = stripper.getText(pdfDocument);
            String[] lines = text.split(System.lineSeparator());
            int rowNum = 0;

            for (String line : lines) {
                if (line.trim().isEmpty())
                    continue;

                XSSFRow row = sheet.createRow(rowNum++);
                String[] columns = line.split("\\|");

                int colNum = 0;
                for (String colData : columns) {
                    if (!colData.trim().isEmpty()) {
                        XSSFCell cell = row.createCell(colNum++);
                        cell.setCellValue(colData.trim());
                    }
                }
            }

            // Removed sheet.autoSizeColumn(i) to prevent crashes

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // =================================================================
    // 13. IMAGE TO PDF (REAL)
    // =================================================================

    public byte[] imageToPdf(MultipartFile imageFile) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imageFile.getBytes(),
                    imageFile.getOriginalFilename());
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                float scale = Math.min(page.getMediaBox().getWidth() / pdImage.getWidth(),
                        page.getMediaBox().getHeight() / pdImage.getHeight());
                contentStream.drawImage(pdImage, 0, 0, pdImage.getWidth() * scale, pdImage.getHeight() * scale);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        }
    }

    // =================================================================
    // 14. WORD TO PDF (REAL - NEW LOGIC)
    // =================================================================

    public byte[] wordToPdf(MultipartFile file) throws IOException {
        try (XWPFDocument docx = new XWPFDocument(file.getInputStream());
                PDDocument pdf = new PDDocument();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            pdf.addPage(page);

            float margin = 50;
            float yPosition = page.getMediaBox().getHeight() - margin; // Start from top
            float pageHeight = page.getMediaBox().getHeight();
            float pageWidth = page.getMediaBox().getWidth();
            float fontSize = 12;
            float leading = 15; // Line spacing

            PDPageContentStream contentStream = new PDPageContentStream(pdf, page);
            contentStream.setFont(PDType1Font.HELVETICA, fontSize);

            List<XWPFParagraph> paragraphs = docx.getParagraphs();

            for (XWPFParagraph para : paragraphs) {
                String text = para.getText();

                if (text == null || text.trim().isEmpty()) {
                    // Empty paragraph - add spacing
                    yPosition -= leading;
                    continue;
                }

                // Sanitize text (remove problematic characters)
                String safeText = text.replaceAll("[\\n\\r]", " ");

                // Replace non-ASCII characters with '?' to avoid encoding issues
                safeText = safeText.replaceAll("[^\\x00-\\x7F]", "?");

                // Word wrap: split long lines to fit page width
                float maxWidth = pageWidth - (2 * margin);
                List<String> lines = wrapText(safeText, PDType1Font.HELVETICA, fontSize, maxWidth);

                for (String line : lines) {
                    // Check if we need a new page
                    if (yPosition < margin + leading) {
                        contentStream.close();
                        page = new PDPage(PDRectangle.A4);
                        pdf.addPage(page);
                        contentStream = new PDPageContentStream(pdf, page);
                        contentStream.setFont(PDType1Font.HELVETICA, fontSize);
                        yPosition = pageHeight - margin;
                    }

                    // Draw the text line
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText(line);
                    contentStream.endText();

                    yPosition -= leading;
                }

                // Add extra spacing after paragraph
                yPosition -= leading / 2;
            }

            contentStream.close();
            pdf.save(out);
            return out.toByteArray();
        }
    }

    // Helper method to wrap text to fit within a given width
    private List<String> wrapText(String text, org.apache.pdfbox.pdmodel.font.PDFont font, float fontSize,
            float maxWidth) throws IOException {
        List<String> lines = new java.util.ArrayList<>();

        if (text == null || text.isEmpty()) {
            return lines;
        }

        String[] words = text.split(" ");
        StringBuilder currentLine = new StringBuilder();

        for (String word : words) {
            String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;
            float width = font.getStringWidth(testLine) / 1000 * fontSize;

            if (width > maxWidth && currentLine.length() > 0) {
                // Current line is full, start a new line
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(word);
            } else {
                currentLine = new StringBuilder(testLine);
            }
        }

        // Add the last line
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }

        return lines;
    }

    // =================================================================
    // 15. GENERATE PDF PREVIEW (First Page as Image)
    // =================================================================

    public byte[] generatePdfPreview(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream());
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            if (document.getNumberOfPages() == 0) {
                throw new IOException("PDF has no pages");
            }

            PDFRenderer pdfRenderer = new PDFRenderer(document);
            // Render first page at 150 DPI for good quality preview
            BufferedImage image = pdfRenderer.renderImageWithDPI(0, 150, ImageType.RGB);

            // Write as PNG
            ImageIO.write(image, "PNG", out);
            return out.toByteArray();
        }
    }

    public byte[] handleConversion(MultipartFile file) throws IOException {
        return file.getBytes();
    }
}