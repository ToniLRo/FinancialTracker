package com.tonilr.FinancialTracker;

import org.junit.platform.suite.api.SelectClasses;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

@Suite
@SuiteDisplayName("Financial Tracker Functional Test Suite")
@SelectClasses({
    // Pruebas de Integración
    com.tonilr.FinancialTracker.integration.FinancialIntegrationTest.class,
    
    // Pruebas de Validación
    com.tonilr.FinancialTracker.validation.FinancialDataValidationTest.class,
    
    // Pruebas de Lógica de Negocio
    com.tonilr.FinancialTracker.business.FinancialBusinessLogicTest.class
})
public class FinancialTrackerFunctionalTestSuite {
    // Esta clase actúa como un contenedor para ejecutar todas las pruebas funcionales
} 