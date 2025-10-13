package com.web.TradeApp.feature.user.service;

import org.springframework.web.multipart.MultipartFile;

import com.web.TradeApp.feature.user.dto.CloudinaryDto;

public interface CloudinaryService {
    CloudinaryDto uploadFile(final MultipartFile file, final String fileName, final String paths);

    void deleteFile(final String publicId);
}
