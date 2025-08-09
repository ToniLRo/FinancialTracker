package com.tonilr.FinancialTracker.Services;

import com.tonilr.FinancialTracker.Entities.ApiUpdateControl;
import com.tonilr.FinancialTracker.repos.ApiUpdateControlRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApiUpdateControlService {

    @Autowired
    private ApiUpdateControlRepo apiUpdateControlRepo;

    public boolean shouldUpdate(ApiUpdateControl.ApiType apiType) {
        return apiUpdateControlRepo.findByApiType(apiType)
            .map(control -> {
                LocalDateTime nextUpdate = control.getLastUpdate()
                    .plusMinutes(control.getUpdateIntervalMinutes());
                return LocalDateTime.now().isAfter(nextUpdate);
            })
            .orElse(true);
    }

    public void updateLastUpdateTime(ApiUpdateControl.ApiType apiType) {
        ApiUpdateControl control = apiUpdateControlRepo.findByApiType(apiType)
            .orElse(new ApiUpdateControl());
        
        control.setApiType(apiType);
        control.setLastUpdate(LocalDateTime.now());
        
        switch (apiType) {
            case FOREX:
                control.setUpdateIntervalMinutes(32);
                break;
            case CRYPTO:
                control.setUpdateIntervalMinutes(5);
                break;
            case STOCK:
                control.setUpdateIntervalMinutes(16);
                break;
        }
        
        apiUpdateControlRepo.save(control);
    }

    public LocalDateTime getNextUpdateTime(ApiUpdateControl.ApiType apiType) {
        return apiUpdateControlRepo.findByApiType(apiType)
            .map(control -> control.getLastUpdate().plusMinutes(control.getUpdateIntervalMinutes()))
            .orElse(LocalDateTime.now());
    }

    public LocalDateTime getLastUpdate(ApiUpdateControl.ApiType apiType) {
        return apiUpdateControlRepo.findByApiType(apiType)
            .map(ApiUpdateControl::getLastUpdate)
            .orElse(null);
    }

    public List<Map<String, Object>> getAllApiStatus() {
        return apiUpdateControlRepo.findAll().stream()
            .map(control -> {
                Map<String, Object> status = new HashMap<>();
                status.put("type", control.getApiType());
                status.put("lastUpdate", control.getLastUpdate());
                status.put("nextUpdate", control.getLastUpdate().plusMinutes(control.getUpdateIntervalMinutes()));
                return status;
            })
            .collect(Collectors.toList());
    }
}
