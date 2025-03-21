package org.example.socialplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SocialPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(SocialPlatformApplication.class, args);
	}

}
