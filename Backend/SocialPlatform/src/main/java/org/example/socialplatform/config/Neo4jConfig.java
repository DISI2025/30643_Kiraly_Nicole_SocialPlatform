package org.example.socialplatform.config;

import org.neo4j.driver.Driver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.neo4j.core.transaction.Neo4jTransactionManager;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.data.transaction.ChainedTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableNeo4jRepositories(basePackages = "org.example.socialplatform.repository")
public class Neo4jConfig {

    @Autowired
    private LocalContainerEntityManagerFactoryBean entityManagerFactory;

    @Autowired
    private Driver driver; // Let Spring Boot autoconfigure this

    @Bean(name = "neo4jTransactionManager")
    public PlatformTransactionManager neo4jTransactionManager() {
        return new Neo4jTransactionManager(driver);
    }

    @Bean(name = "jpaTransactionManager")
    public PlatformTransactionManager jpaTransactionManager() {
        return new JpaTransactionManager(entityManagerFactory.getObject());
    }

    @Primary
    @Bean
    public PlatformTransactionManager transactionManager(
            @Qualifier("neo4jTransactionManager") PlatformTransactionManager neo4jTransactionManager,
            @Qualifier("jpaTransactionManager") PlatformTransactionManager jpaTransactionManager) {

        return new ChainedTransactionManager(jpaTransactionManager, neo4jTransactionManager);
    }
}
