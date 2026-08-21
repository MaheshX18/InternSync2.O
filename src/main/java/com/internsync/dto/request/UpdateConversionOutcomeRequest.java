package com.internsync.dto.request;

import com.internsync.model.ConversionOutcome;

public class UpdateConversionOutcomeRequest {

    private ConversionOutcome conversionOutcome;

    public UpdateConversionOutcomeRequest() {}

    public ConversionOutcome getConversionOutcome() {
        return conversionOutcome;
    }

    public void setConversionOutcome(ConversionOutcome conversionOutcome) {
        this.conversionOutcome = conversionOutcome;
    }
}
