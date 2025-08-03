package com.tonilr.FinancialTracker.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tonilr.FinancialTracker.Entities.AssetType;
import com.tonilr.FinancialTracker.Entities.MarketData;
import com.tonilr.FinancialTracker.repos.MarketDataRepo;

@Service
public class MarketDataServices {
	
    @Autowired
    private final MarketDataRepo marketDataRepository;
    
	public MarketDataServices(MarketDataRepo marketDataRepository) {
		this.marketDataRepository = marketDataRepository;
	}

    public MarketData saveOrUpdate(MarketData marketData) {
        // Buscar el último registro para este símbolo y tipo
        Optional<MarketData> existingData = marketDataRepository.findLatestBySymbolAndAssetType(
            marketData.getSymbol(), 
            marketData.getAssetType()
        );

        if (existingData.isPresent()) {
            // Actualizar el registro existente
            MarketData existing = existingData.get();
            existing.setDate(marketData.getDate());
            existing.setOpen(marketData.getOpen());
            existing.setHigh(marketData.getHigh());
            existing.setLow(marketData.getLow());
            existing.setClose(marketData.getClose());
            existing.setVolume(marketData.getVolume());
            existing.setMarket(marketData.getMarket());
            return marketDataRepository.save(existing);
        } else {
            // Crear nuevo registro
            return marketDataRepository.save(marketData);
        }
    }

    public List<MarketData> findMarketDataBySymbol(String symbol, AssetType assetType) {
        return marketDataRepository.findBySymbolAndAssetType(symbol, assetType);
    }
    
    public void deleteMarketData(Long id) {
         marketDataRepository.deleteById(id);
    }

    public List<MarketData> findLatestByAssetType(AssetType assetType) {
        return marketDataRepository.findLatestByAssetType(assetType);
    }
}
