package com.web.TradeApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@ComponentScan(basePackages = {
		"com.web.TradeApp",
		"com.turkraft.springfilter"
})
public class TradeAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(TradeAppApplication.class, args);
	}

}
