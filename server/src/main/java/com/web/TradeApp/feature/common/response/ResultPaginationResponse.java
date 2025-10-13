package com.web.TradeApp.feature.common.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResultPaginationResponse {
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
