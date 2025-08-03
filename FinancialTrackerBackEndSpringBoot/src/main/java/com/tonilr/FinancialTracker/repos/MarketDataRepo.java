package com.tonilr.FinancialTracker.repos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tonilr.FinancialTracker.Entities.AssetType;
import com.tonilr.FinancialTracker.Entities.MarketData;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketDataRepo extends JpaRepository<MarketData,Long>{
    
    // Consulta para encontrar datos por símbolo y tipo de activo
    List<MarketData> findBySymbolAndAssetType(String symbol, AssetType assetType);

    // Consulta optimizada usando ROW_NUMBER()
    @Query(value = """
        SELECT * FROM (
            SELECT *, ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY date DESC) as rn
            FROM market_data 
            WHERE asset_type = :assetType
        ) ranked 
        WHERE rn = 1
        """, nativeQuery = true)
    List<MarketData> findLatestByAssetType(@Param("assetType") String assetType);

    @Query("SELECT md FROM MarketData md WHERE md.symbol = :symbol AND md.assetType = :assetType ORDER BY md.date DESC LIMIT 1")
    Optional<MarketData> findLatestBySymbolAndAssetType(@Param("symbol") String symbol, @Param("assetType") AssetType assetType);
}
