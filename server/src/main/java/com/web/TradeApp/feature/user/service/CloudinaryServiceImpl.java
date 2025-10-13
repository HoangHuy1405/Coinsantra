package com.web.TradeApp.feature.user.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.web.TradeApp.exception.FunctionErrorException;
import com.web.TradeApp.feature.user.dto.CloudinaryDto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    @Transactional
    public CloudinaryDto uploadFile(final MultipartFile file, final String fileName, final String paths) {
        try {
            // (Optional) validate file size/type with your util
            // FileUploadUtil.assertAllowed(file, FileUploadUtil.IMAGE_PATTERN);

            final String safeName = normalizeFileName(fileName);
            final String baseName = stripExtension(safeName); // public_id should not include the extension

            // Build options
            Map<String, Object> opts = new java.util.HashMap<>();
            if (!paths.isBlank()) {
                opts.put("folder", paths); // Let Cloudinary handle folders
            }
            opts.put("public_id", baseName); // Final public_id = "<folder>/<baseName>"
            opts.put("overwrite", true); // Optional: overwrite if same id exists
            opts.put("invalidate", true); // Purge CDN cache on overwrite

            final Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), opts);

            final String url = (String) result.get("secure_url");
            final String publicId = (String) result.get("public_id");
            final Number version = (Number) result.get("version");

            return CloudinaryDto.builder()
                    .publicId(publicId)
                    .url(url)
                    .version(version != null ? version.longValue() : null)
                    .build();

        } catch (final Exception e) {
            throw new FunctionErrorException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            if (publicId == null || publicId.isBlank()) {
                throw new IllegalArgumentException("publicId must not be null or blank");
            }

            // destroy the asset and purge from CDN
            Map<String, Object> opts = new HashMap<>();
            opts.put("invalidate", true);

            Map<?, ?> result = cloudinary.uploader().destroy(publicId, opts);

            String status = (String) result.get("result");
            if (!"ok".equalsIgnoreCase(status) && !"not found".equalsIgnoreCase(status)) {
                // Cloudinary returns "not found" if the publicId doesn’t exist, which you may
                // choose to ignore
                throw new FunctionErrorException("Failed to delete file: status=" + status);
            }

        } catch (Exception e) {
            throw new FunctionErrorException("Failed to delete file: " + e.getMessage());
        }
    }

    private static String normalizeFileName(String name) {
        if (name == null)
            return "file";
        // simple safe normalization for public_id purposes
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private static String stripExtension(String name) {
        int i = name.lastIndexOf('.');
        return (i == -1) ? name : name.substring(0, i);
    }

}
