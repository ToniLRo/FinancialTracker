package com.tonilr.FinancialTracker.Controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tonilr.FinancialTracker.Entities.AssetType;
import com.tonilr.FinancialTracker.Entities.MarketData;
import com.tonilr.FinancialTracker.Services.APIServices;
import com.tonilr.FinancialTracker.Services.MarketDataServices;

@RestController
@RequestMapping("/marketdata")
public class MarketDataController {
    
    @Autowired
    private MarketDataServices marketDataService;

    @Autowired
    private APIServices apiServices;
    
    // Endpoint para obtener últimos datos por tipo de activo
    @GetMapping("/last/{assetType}")
    public ResponseEntity<List<MarketData>> getLastMarketData(
            @PathVariable("assetType") AssetType assetType) {
        System.out.println("\n🔍 Buscando últimos datos para tipo: " + assetType);
        try {
            List<MarketData> data = marketDataService.findLatestByAssetType(assetType);
            System.out.println("✅ Encontrados " + data.size() + " registros");
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            System.err.println("❌ Error obteniendo datos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para guardar datos
    @PostMapping("/add")
    public ResponseEntity<MarketData> addMarketData(@RequestBody MarketData marketData) {
        System.out.println("\n📥 Recibida petición POST para MarketData");
        System.out.println("Símbolo: " + marketData.getSymbol());
        System.out.println("Tipo: " + marketData.getAssetType());
        
        try {
            MarketData saved = marketDataService.saveOrUpdate(marketData);
            System.out.println("✅ Datos procesados correctamente para: " + saved.getSymbol());
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("❌ Error procesando datos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint para obtener MarketData por símbolo y tipo de activo
	@GetMapping("/getStock/{symbol}")
    public ResponseEntity<String> getStockDataBySymbolAPI(
    		@PathVariable("symbol") String symbol) {
		  try {
		        String data = apiServices.getStockData(symbol);
        return ResponseEntity.ok(data);
		    } catch (Exception e) {
		        // Manejo de errores
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener datos del mercado: " + e.getMessage());
		    }
        		//new ResponseEntity<>(marketData, HttpStatus.OK);
    }
	
    // Endpoint para obtener datos de Forex por símbolo
    @GetMapping("/getForex/{fromSymbol}/{toSymbol}")
    public ResponseEntity<String> getForexDataBySymbolsAPI(
            @PathVariable("fromSymbol") String fromSymbol,
            @PathVariable("toSymbol") String toSymbol) {
        try {
            String data = apiServices.getForexData(fromSymbol, toSymbol);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener datos de Forex: " + e.getMessage());
        }
    }
    
    // Endpoint para obtener datos de Forex por símbolo
    @GetMapping("/getCrypto/{symbol}/{market}")
    public ResponseEntity<String> getCryptoDataBySymbolsAPI(
            @PathVariable("symbol") String symbol,
            @PathVariable("market") String market) {
        try {
            String data = apiServices.getCryptoData(symbol, market);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al obtener datos de Forex: " + e.getMessage());
        }
    }
    @GetMapping("/getTop10Crypto")
    public List<Map<String, String>> getTop10Cryptos() {
        return apiServices.getTop10Cryptos();
    }
	
	@GetMapping("/find/{symbol}/{assetType}")
    public ResponseEntity<List<MarketData>> findMarketDataBySymbol(
    		@PathVariable("symbol") String symbol, 
    		@PathVariable("assetType") AssetType assetType) {
		List<MarketData> marketData = marketDataService.findMarketDataBySymbol(symbol, assetType);
        return new ResponseEntity<>(marketData, HttpStatus.OK);
    }
    
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteMarketData(@PathVariable("id") Long id) {
		marketDataService.deleteMarketData(id);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
