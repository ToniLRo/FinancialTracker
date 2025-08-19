package com.tonilr.FinancialTracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinancialTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinancialTrackerApplication.class, args);
	}

}
