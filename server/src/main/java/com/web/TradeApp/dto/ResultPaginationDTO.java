package com.web.TradeApp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResultPaginationDTO {
    private PageMeta meta;
    private Object result;

    @Getter
    @Setter
    public static class PageMeta {
        private int page;
        private int pageSize;
        private int pages;
        private long total;
    }
}
