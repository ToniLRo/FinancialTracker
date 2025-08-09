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
    
    //Buscar datos por símbolo y tipo de activo
    List<MarketData> findBySymbolAndAssetType(String symbol, AssetType assetType);

    //Buscar datos más recientes por tipo de activo
    @Query("SELECT md FROM MarketData md WHERE md.assetType = :assetType AND md.date = (SELECT MAX(md2.date) FROM MarketData md2 WHERE md2.assetType = :assetType AND md2.symbol = md.symbol)")
    List<MarketData> findLatestByAssetType(@Param("assetType") AssetType assetType);

    //Buscar datos más recientes por símbolo y tipo de activo
    @Query("SELECT md FROM MarketData md WHERE md.symbol = :symbol AND md.assetType = :assetType ORDER BY md.date DESC LIMIT 1")
    Optional<MarketData> findLatestBySymbolAndAssetType(@Param("symbol") String symbol, @Param("assetType") AssetType assetType);
}
