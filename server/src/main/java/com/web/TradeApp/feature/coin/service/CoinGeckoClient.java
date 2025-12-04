package com.web.TradeApp.feature.coin.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
public class CoinGeckoClient {
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

    private static final String COINGECKO_PRICE_URL = COINGECKO_BASE_URL + "/simple/price?ids=%s&vs_currencies=usd";

    // Map common symbols to CoinGecko IDs
    private static final Map<String, String> SYMBOL_TO_ID_MAP = Map.of(
            "BTC", "bitcoin",
            "ETH", "ethereum",
            "BNB", "binancecoin",
            "SOL", "solana",
            "XRP", "ripple",
            "ADA", "cardano",
            "DOGE", "dogecoin");

    public boolean isExists(String coinGeckoId) {
        String url = COINGECKO_BASE_URL + "/coins/" + coinGeckoId;
        try {
            restTemplate.getForObject(url, Object.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public BigDecimal getCurrentPrice(String symbolOrId) {
        try {
            // Convert symbol to CoinGecko ID if needed
            String coinGeckoId = SYMBOL_TO_ID_MAP.getOrDefault(symbolOrId.toUpperCase(), symbolOrId.toLowerCase());

            String url = String.format(COINGECKO_PRICE_URL, coinGeckoId);
            Map<String, Map<String, Object>> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey(coinGeckoId)) {
                Object priceObj = response.get(coinGeckoId).get("usd");

                if (priceObj instanceof Number) {
                    return BigDecimal.valueOf(((Number) priceObj).doubleValue());
                }

                throw new RuntimeException("Invalid price format from CoinGecko: " + priceObj);
            }

            throw new RuntimeException(
                    "Failed to fetch price for: " + symbolOrId + " (mapped to: " + coinGeckoId + ") | " + url);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching price from CoinGecko: " + e.getMessage(), e);
        }
    }

    /**
     * Batch fetch prices for multiple coins in ONE API call
     * This dramatically reduces API calls and prevents rate limiting
     * 
     * @param symbolsOrIds List of coin symbols (BTC, ETH) or IDs (bitcoin,
     *                     ethereum)
     * @return Map of coinGeckoId -> price in USD
     */
    @SuppressWarnings("unchecked")
    public Map<String, BigDecimal> getBatchPrices(List<String> symbolsOrIds) {
        if (symbolsOrIds == null || symbolsOrIds.isEmpty()) {
            return new HashMap<>();
        }

        try {
            // Convert all symbols to CoinGecko IDs
            String coinIds = symbolsOrIds.stream()
                    .map(symbolOrId -> SYMBOL_TO_ID_MAP.getOrDefault(symbolOrId.toUpperCase(),
                            symbolOrId.toLowerCase()))
                    .distinct() // Remove duplicates
                    .collect(Collectors.joining(","));

            String url = String.format(COINGECKO_PRICE_URL, coinIds);
            Map<String, Map<String, Object>> response = restTemplate.getForObject(url, Map.class);

            Map<String, BigDecimal> prices = new HashMap<>();

            if (response != null) {
                for (Map.Entry<String, Map<String, Object>> entry : response.entrySet()) {
                    String coinId = entry.getKey();
                    Object priceObj = entry.getValue().get("usd");

                    if (priceObj instanceof Number) {
                        prices.put(coinId, BigDecimal.valueOf(((Number) priceObj).doubleValue()));
                    }
                }
            }

            return prices;
        } catch (Exception e) {
            throw new RuntimeException("Error fetching batch prices from CoinGecko: " + e.getMessage(), e);
        }
    }

    /**
     * Helper method to get price from a pre-fetched price map
     * Handles symbol-to-ID conversion automatically
     * 
     * @param symbolOrId Symbol (BTC) or ID (bitcoin)
     * @param priceMap   Pre-fetched prices with CoinGecko IDs as keys
     * @return Price or null if not found
     */
    public BigDecimal getPriceFromMap(String symbolOrId, Map<String, BigDecimal> priceMap) {
        if (priceMap == null || symbolOrId == null) {
            return null;
        }

        // Convert symbol to CoinGecko ID
        String coinGeckoId = SYMBOL_TO_ID_MAP.getOrDefault(symbolOrId.toUpperCase(), symbolOrId.toLowerCase());

        return priceMap.get(coinGeckoId);
    }
}
