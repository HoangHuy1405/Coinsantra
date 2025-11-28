package com.web.TradeApp.feature.coin.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class CoinGeckoClient {
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isExists(String coinGeckoId) {
        String url = "https://api.coingecko.com/api/v3/coins/" + coinGeckoId;
        try {
            restTemplate.getForObject(url, Object.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        }
    }
}
